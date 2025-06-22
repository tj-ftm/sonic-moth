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

  // Handle score updates and save to localStorage
  const handleScoreUpdate = (points: number) => {
    setUserPoints(points);
    localStorage.setItem('currentMothScore', points.toString());
  };

  // Load saved score on component mount
  useEffect(() => {
    const savedScore = localStorage.getItem('currentMothScore');
    if (savedScore) {
      setUserPoints(parseInt(savedScore));
    }
  }, []);

  // Handle navigation from leaderboard button
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#leaderboard') {
        setActiveTab('leaderboard');
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check on mount

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-orange-900 relative overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10">
        <Navigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          walletConnected={walletConnected}
          balances={balances}
          userPoints={userPoints}
          onWalletConnect={setWalletConnected}
        />
        
        <div className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <div className="flex gap-8 max-w-7xl mx-auto">
                <motion.div
                  key="home"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="flex-1"
                >
                  <MothGame onScoreUpdate={handleScoreUpdate} />
                </motion.div>
                
                {/* Desktop Leaderboard */}
                <div className="hidden lg:block w-80">
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Leaderboard />
                  </motion.div>
                </div>
              </div>
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
                <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-2xl p-8 border border-orange-500/30">
                  <h2 className="text-4xl font-bold text-white mb-6 text-center">About $MOTH</h2>
                  <div className="space-y-6 text-orange-200">
                    <p className="text-lg leading-relaxed">
                      Welcome to the $MOTH ecosystem on Sonic Network - where digital moths navigate through 
                      the luminous realm of decentralized gaming. Our platform combines the thrill of 
                      blockchain technology with engaging survival gameplay mechanics.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-orange-800/20 rounded-xl p-6 border border-orange-400/20">
                        <h3 className="text-xl font-semibold text-white mb-3">Network Details</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>Network:</strong> Sonic</li>
                          <li><strong>Chain ID:</strong> 146</li>
                          <li><strong>RPC:</strong> https://rpc.soniclabs.com</li>
                          <li><strong>Explorer:</strong> sonicscan.org</li>
                        </ul>
                      </div>
                      <div className="bg-red-800/20 rounded-xl p-6 border border-red-400/20">
                        <h3 className="text-xl font-semibold text-white mb-3">Game Info</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>Objective:</strong> Survival</li>
                          <li><strong>Scoring:</strong> Time-based + Bonuses</li>
                          <li><strong>Penalties:</strong> -50 points per hit</li>
                          <li><strong>Bonuses:</strong> +10 points per obstacle destroyed</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex justify-center space-x-6 mt-8">
                      <motion.a
                        href="https://twitter.com/moth_token"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-orange-500/25 border border-orange-400/30"
                        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(249, 115, 22, 0.5)' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        𝕏 Twitter
                      </motion.a>
                      
                      <motion.a
                        href="https://dexscreener.com/sonic/moth"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-orange-500/25 border border-orange-400/30"
                        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(249, 115, 22, 0.5)' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        📊 DexScreener
                      </motion.a>
                      
                      <motion.a
                        href="https://t.me/moth_token"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-orange-500/25 border border-orange-400/30"
                        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(249, 115, 22, 0.5)' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        📱 Telegram
                      </motion.a>
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