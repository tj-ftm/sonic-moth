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
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [userPoints, setUserPoints] = useState(0);
  const [balances, setBalances] = useState({ sonic: '0.00', moth: '0.00' });
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // Handle score updates and save to localStorage
  const handleScoreUpdate = (points: number) => {
    setUserPoints(points);
    localStorage.setItem('currentMothScore', points.toString());
  };

  // Handle balance updates from wallet
  const handleBalanceUpdate = (newBalances: { sonic: string; moth: string }) => {
    setBalances(newBalances);
  };

  // Handle wallet connection with address
  const handleWalletConnect = (connected: boolean, address?: string) => {
    setWalletConnected(connected);
    if (connected && address) {
      setWalletAddress(address);
    } else if (!connected) {
      setWalletAddress('');
    }
  };

  // Load saved score on component mount
  useEffect(() => {
    const savedScore = localStorage.getItem('currentMothScore');
    if (savedScore) {
      setUserPoints(parseInt(savedScore));
    }
  }, []);

  // Get wallet address when connected
  useEffect(() => {
    if (walletConnected && typeof window.ethereum !== 'undefined') {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        });
    }
  }, [walletConnected]);

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
          onShowLeaderboard={activeTab === 'home' ? () => setShowLeaderboard(true) : undefined}
          onShowAbout={activeTab === 'home' ? () => setShowAbout(true) : undefined}
          onBalanceUpdate={handleBalanceUpdate}
          walletAddress={walletAddress}
          onWalletConnectWithAddress={handleWalletConnect}
        />
        
        <div className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {/* Only show title on desktop, mobile has it in navigation */}
                <div className="hidden md:block">
                  <motion.h2 
                    className="text-4xl font-bold text-center bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-6"
                    animate={{ 
                      filter: ['drop-shadow(0 0 10px rgba(249, 115, 22, 0.5))', 'drop-shadow(0 0 15px rgba(249, 115, 22, 0.7))', 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.5))']
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    Moth VS Lamp
                  </motion.h2>
                </div>
                
                <MothGame 
                  onScoreUpdate={handleScoreUpdate} 
                  walletConnected={walletConnected}
                  walletAddress={walletAddress}
                  onWalletConnect={setWalletConnected}
                />
                
                {/* Hovering Leaderboard Modal */}
                <AnimatePresence>
                  {showLeaderboard && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                      onClick={() => setShowLeaderboard(false)}
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-gradient-to-br from-black via-gray-900 to-orange-900 rounded-2xl border border-orange-500/30 p-6 max-w-2xl w-full max-h-[70vh] overflow-y-auto scrollbar-hide"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                            🏆 Leaderboard
                          </h2>
                          <motion.button
                            onClick={() => setShowLeaderboard(false)}
                            onTouchEnd={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowLeaderboard(false);
                            }}
                            className="text-orange-300 hover:text-orange-200 text-2xl"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            ✕
                          </motion.button>
                        </div>
                        <Leaderboard walletAddress={walletAddress} walletConnected={walletConnected} />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Hovering About Modal */}
                <AnimatePresence>
                  {showAbout && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                      onClick={() => setShowAbout(false)}
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-gradient-to-br from-black via-gray-900 to-orange-900 rounded-2xl border border-orange-500/30 p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto scrollbar-hide"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-3xl font-bold text-white">About $MOTH</h2>
                          <motion.button
                            onClick={() => setShowAbout(false)}
                            onTouchEnd={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowAbout(false);
                            }}
                            className="text-orange-300 hover:text-orange-200 text-2xl"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            ✕
                          </motion.button>
                        </div>
                        
                        <div className="space-y-6 text-orange-200">
                          <p className="text-lg leading-relaxed">
                            Welcome to Moth To The Lamp - where digital moths are irresistibly drawn to the 
                            luminous realm of decentralized gaming on Sonic Network. Navigate through dangerous 
                            obstacles as you're pulled toward the eternal light.
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
                                <li><strong>Objective:</strong> Reach the lamp</li>
                                <li><strong>Scoring:</strong> Time-based + Bonuses</li>
                                <li><strong>Penalties:</strong> -10 points per hit</li>
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
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Index;