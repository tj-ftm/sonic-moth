import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Leaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<Array<{
    rank: number;
    address: string;
    points: number;
    badge: string;
  }>>([]);

  useEffect(() => {
    // Get real leaderboard data from localStorage
    const getRealLeaderboardData = () => {
      const scores = [];
      
      // Get all stored scores from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mothScore_')) {
          const address = key.replace('mothScore_', '');
          const score = parseInt(localStorage.getItem(key) || '0');
          const userName = localStorage.getItem(`mothUserName_${address}`) || address;
          
          scores.push({
            address: userName,
            points: score
          });
        }
      }
      
      // Add current user's score if available
      const currentScore = parseInt(localStorage.getItem('currentMothScore') || '0');
      const currentUser = localStorage.getItem('mothUserName') || 'Anonymous';
      
      if (currentScore > 0) {
        scores.push({
          address: currentUser,
          points: currentScore
        });
      }
      
      // If no real scores, add some sample data
      if (scores.length === 0) {
        scores.push(
          { address: 'Anonymous Player', points: 0 },
          { address: 'Moth Master', points: 0 },
          { address: 'Light Seeker', points: 0 }
        );
      }
      
      // Sort by points and add ranks and badges
      const sortedScores = scores
        .sort((a, b) => b.points - a.points)
        .slice(0, 10) // Top 10
        .map((score, index) => ({
          rank: index + 1,
          address: score.address,
          points: score.points,
          badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''
        }));
      
      return sortedScores;
    };
    
    setLeaderboardData(getRealLeaderboardData());
    
    // Update leaderboard every 30 seconds
    const interval = setInterval(() => {
      setLeaderboardData(getRealLeaderboardData());
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Save score to localStorage when component mounts
  useEffect(() => {
    const currentScore = parseInt(localStorage.getItem('currentMothScore') || '0');
    if (currentScore > 0) {
      const timestamp = Date.now();
      const scoreKey = `mothScore_${timestamp}`;
      localStorage.setItem(scoreKey, currentScore.toString());
      
      const userName = localStorage.getItem('mothUserName') || 'Anonymous';
      localStorage.setItem(`mothUserName_${timestamp}`, userName);
    }
  }, []);

  return (
    <div className="w-full">
      <motion.h2 
        className="text-2xl lg:text-4xl font-bold text-center mb-6 lg:mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        animate={{ 
          filter: ['drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))', 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.8))', 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))']
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🏆 Leaderboard
      </motion.h2>

      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/30 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-4 border-b border-purple-500/30">
          <div className="grid grid-cols-4 gap-2 lg:gap-4 text-white font-semibold text-sm lg:text-base">
            <div className="text-center">Rank</div>
            <div className="text-center">Player</div>
            <div className="text-center">Points</div>
            <div className="text-center">Badge</div>
          </div>
        </div>

        <div className="divide-y divide-purple-500/20">
          {leaderboardData.length > 0 ? (
            leaderboardData.map((player, index) => (
              <motion.div
                key={`${player.rank}-${player.address}`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`grid grid-cols-4 gap-4 p-4 hover:bg-purple-800/20 transition-colors ${
                  player.rank <= 3 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10' : ''
                }`}
              >
                <div className="text-center text-sm lg:text-base">
                  <span className={`text-xl font-bold ${
                    player.rank === 1 ? 'text-yellow-400' :
                    player.rank === 2 ? 'text-gray-300' :
                    player.rank === 3 ? 'text-amber-600' :
                    'text-purple-200'
                  }`}>
                    #{player.rank}
                  </span>
                </div>
                
                <div className="text-center text-xs lg:text-sm">
                  <span className="text-purple-200 px-1 lg:px-2 py-1 rounded">
                    {player.address}
                  </span>
                </div>
                
                <div className="text-center text-sm lg:text-base">
                  <motion.span 
                    className="text-white font-bold text-lg"
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
                
                <div className="text-center text-lg lg:text-2xl">
                  {player.badge && (
                    <motion.span 
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
            <div className="p-8 text-center">
              <p className="text-purple-300">No scores yet. Be the first to play!</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 lg:mt-8 text-center">
        <p className="text-purple-300 text-xs lg:text-sm">
          Leaderboard updates every 30 seconds. Play the moth survival game to climb the ranks! 🦋
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;