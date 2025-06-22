import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getLeaderboard, LeaderboardScore } from '../lib/supabase';

interface LeaderboardProps {
  walletAddress?: string;
  walletConnected?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ walletAddress, walletConnected }) => {
  const [leaderboardData, setLeaderboardData] = useState<Array<{
    rank: number;
    address: string;
    points: number;
    badge: string;
    isCurrentUser?: boolean;
    isWalletScore?: boolean;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const scores = await getLeaderboard(10);
        
        const formattedScores = scores.map((score: LeaderboardScore, index: number) => {
          const displayName = score.display_name || 
                            (score.wallet_address ? `${score.wallet_address.slice(0, 6)}...${score.wallet_address.slice(-4)}` : 'Anonymous');
          
          return {
            rank: index + 1,
            address: displayName,
            points: score.score,
            badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '',
            isCurrentUser: walletConnected && walletAddress && 
                          score.wallet_address.toLowerCase() === walletAddress.toLowerCase(),
            isWalletScore: score.wallet_address.startsWith('0x')
          };
        });
        
        setLeaderboardData(formattedScores);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        // Fallback to empty state
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
    
    // Update leaderboard every 10 seconds
    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [walletAddress, walletConnected]);

  return (
    <div className="max-w-2xl mx-auto">
      <motion.h2 
        className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        animate={{ 
          filter: ['drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))', 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.8))', 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))']
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🏆 Leaderboard
      </motion.h2>

      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/30 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-4 border-b border-orange-500/30">
          <div className="grid grid-cols-4 gap-2 text-white font-semibold text-sm">
            <div className="text-center">Rank</div>
            <div className="text-center">Player</div>
            <div className="text-center">Points</div>
            <div className="text-center">Badge</div>
          </div>
        </div>

        <div className="divide-y divide-orange-500/20 max-h-60 overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto mb-2"></div>
              <p className="text-orange-300">Loading leaderboard...</p>
            </div>
          ) : leaderboardData.length > 0 ? (
            leaderboardData.map((player, index) => (
              <motion.div
                key={`${player.rank}-${player.address}`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`grid grid-cols-4 gap-2 p-3 hover:bg-orange-800/20 transition-colors ${
                  player.rank <= 3 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10' : ''
                } ${
                  player.isCurrentUser ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-l-4 border-blue-400' : ''
                } ${
                  player.isWalletScore && !player.isCurrentUser ? 'bg-gradient-to-r from-green-500/10 to-teal-500/10' : ''
                }`}
              >
                <div className="text-center">
                  <span className={`text-lg font-bold ${
                    player.rank === 1 ? 'text-yellow-400' :
                    player.rank === 2 ? 'text-gray-300' :
                    player.rank === 3 ? 'text-amber-600' :
                    'text-orange-200'
                  }`}>
                    #{player.rank}
                  </span>
                </div>
                
                <div className="text-center">
                  <span className={`px-1 py-1 rounded text-xs ${
                    player.isCurrentUser ? 'text-blue-200 font-semibold' : 'text-orange-200'
                  }`}>
                    {player.address}
                    {player.isCurrentUser && (
                      <span className="ml-1 text-blue-300">👤</span>
                    )}
                    {player.isWalletScore && !player.isCurrentUser && (
                      <span className="ml-1 text-green-300">🔗</span>
                    )}
                  </span>
                </div>
                
                <div className="text-center">
                  <motion.span 
                    className={`font-bold text-sm ${
                      player.isCurrentUser ? 'text-blue-200' : 'text-white'
                    }`}
                    animate={{ 
                      textShadow: player.rank <= 3 ? [
                        '0 0 5px rgba(255, 255, 255, 0.5)', 
                        '0 0 15px rgba(255, 255, 255, 0.8)', 
                        '0 0 5px rgba(255, 255, 255, 0.5)'
                      ] : undefined
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {player.points.toLocaleString()}
                  </motion.span>
                </div>
                
                <div className="text-center">
                  {player.badge && (
                    <motion.span 
                      className="text-lg"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {player.badge}
                    </motion.span>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-6 text-center">
              <p className="text-orange-300">No scores yet. Be the first to play!</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-orange-300 text-sm">
          Leaderboard updates every 10 seconds. Play Moth To The Lamp to climb the ranks! 
          {walletConnected ? ' Your wallet scores are highlighted in blue!' : ' Connect a wallet to save your high scores!'} 
          Wallet scores are marked with 🔗 🦋
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;