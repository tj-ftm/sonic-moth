
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WalletConnect from '../components/WalletConnect';
import BalanceCard from '../components/BalanceCard';
import MothGame from '../components/MothGame';
import Leaderboard from '../components/Leaderboard';
import ParticleBackground from '../components/ParticleBackground';
import Navigation from '../components/Navigation';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [walletConnected, setWalletConnected] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [balances, setBalances] = useState({ sonic: '0.00', moth: '0.00' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="text-center mb-12">
                  <motion.h1 
                    className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 bg-clip-text text-transparent mb-4"
                    animate={{ 
                      filter: ['drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))', 'drop-shadow(0 0 30px rgba(168, 85, 247, 0.8))', 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    $MOTH
                  </motion.h1>
                  <p className="text-xl text-purple-200 mb-8">
                    Navigate the digital realm on Sonic Network
                  </p>
                  
                  {!walletConnected ? (
                    <WalletConnect onConnect={setWalletConnected} />
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      <BalanceCard 
                        title="Sonic ($S)" 
                        balance={balances.sonic} 
                        gradient="from-blue-500 to-cyan-400"
                      />
                      <BalanceCard 
                        title="MOTH Token" 
                        balance={balances.moth} 
                        gradient="from-purple-500 to-pink-400"
                      />
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <motion.div
                    className="inline-block p-8 rounded-2xl bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h2 className="text-3xl font-bold text-white mb-4">
                      Current Points: {userPoints.toLocaleString()}
                    </h2>
                    <p className="text-purple-200">
                      Play the moth game to earn more points!
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'game' && (
              <motion.div
                key="game"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
              >
                <MothGame onScoreUpdate={setUserPoints} />
              </motion.div>
            )}

            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <Leaderboard />
              </motion.div>
            )}

            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-purple-500/30">
                  <h2 className="text-4xl font-bold text-white mb-6 text-center">About $MOTH</h2>
                  <div className="space-y-6 text-purple-200">
                    <p className="text-lg leading-relaxed">
                      Welcome to the $MOTH ecosystem on Sonic Network - where digital moths navigate through 
                      the luminous realm of decentralized gaming. Our platform combines the thrill of 
                      blockchain technology with engaging gameplay mechanics.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-purple-800/20 rounded-xl p-6 border border-purple-400/20">
                        <h3 className="text-xl font-semibold text-white mb-3">Network Details</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>Network:</strong> Sonic</li>
                          <li><strong>Chain ID:</strong> 146</li>
                          <li><strong>RPC:</strong> https://rpc.soniclabs.com</li>
                          <li><strong>Explorer:</strong> sonicscan.org</li>
                        </ul>
                      </div>
                      <div className="bg-pink-800/20 rounded-xl p-6 border border-pink-400/20">
                        <h3 className="text-xl font-semibold text-white mb-3">Token Info</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>Symbol:</strong> $MOTH</li>
                          <li><strong>Type:</strong> ERC-20</li>
                          <li><strong>Contract:</strong> 0x8d5e...da21</li>
                          <li><strong>Game Points:</strong> Off-chain</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Index;
