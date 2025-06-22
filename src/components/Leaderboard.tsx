
import React from 'react';
import { motion } from 'framer-motion';

const Leaderboard: React.FC = () => {
  // Mock leaderboard data
  const mockLeaderboard = [
    { rank: 1, address: '0x742d...A4B7', points: 15420, badge: '🥇' },
    { rank: 2, address: '0x1A3B...C9E2', points: 12850, badge: '🥈' },
    { rank: 3, address: '0x9F4E...D1A8', points: 11200, badge: '🥉' },
    { rank: 4, address: '0x5C2F...B8E1', points: 9750, badge: '' },
    { rank: 5, address: '0x8A1D...F3C4', points: 8900, badge: '' },
    { rank: 6, address: '0x3E7B...A5D2', points: 7650, badge: '' },
    { rank: 7, address: '0x6D9C...E4F7', points: 6800, badge: '' },
    { rank: 8, address: '0x2B5A...C1E9', points: 5950, badge: '' },
    { rank: 9, address: '0x7F3E...B2D6', points: 5100, badge: '' },
    { rank: 10, address: '0x4A8C...F5E3', points: 4250, badge: '' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.h2 
        className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        animate={{ 
          filter: ['drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))', 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.8))', 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))']
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🏆 Leaderboard
      </motion.h2>

      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/30 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-4 border-b border-purple-500/30">
          <div className="grid grid-cols-4 gap-4 text-white font-semibold">
            <div className="text-center">Rank</div>
            <div className="text-center">Player</div>
            <div className="text-center">Points</div>
            <div className="text-center">Badge</div>
          </div>
        </div>

        <div className="divide-y divide-purple-500/20">
          {mockLeaderboard.map((player, index) => (
            <motion.div
              key={player.rank}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`grid grid-cols-4 gap-4 p-4 hover:bg-purple-800/20 transition-colors ${
                player.rank <= 3 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10' : ''
              }`}
            >
              <div className="text-center">
                <span className={`text-xl font-bold ${
                  player.rank === 1 ? 'text-yellow-400' :
                  player.rank === 2 ? 'text-gray-300' :
                  player.rank === 3 ? 'text-amber-600' :
                  'text-purple-200'
                }`}>
                  #{player.rank}
                </span>
              </div>
              
              <div className="text-center">
                <code className="text-purple-200 bg-purple-800/30 px-2 py-1 rounded text-sm">
                  {player.address}
                </code>
              </div>
              
              <div className="text-center">
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
              
              <div className="text-center">
                {player.badge && (
                  <motion.span 
                    className="text-2xl"
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
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-purple-300 text-sm">
          Leaderboard updates every 30 seconds. Play the moth game to climb the ranks! 🦋
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
