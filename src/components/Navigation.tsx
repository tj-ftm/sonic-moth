
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import WalletDropdown from './WalletDropdown';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  walletConnected: boolean;
  balances: { sonic: string; moth: string };
  userPoints: number;
  onWalletConnect: (connected: boolean) => void;
  onShowLeaderboard?: () => void;
  onShowAbout?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  setActiveTab, 
  walletConnected, 
  balances, 
  userPoints, 
  onWalletConnect,
  onShowLeaderboard,
  onShowAbout
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const tabs = [
    { id: 'home', label: 'Home', icon: '🦋' }
  ];

  if (isMobile) {
    return (
      <nav className="relative z-20 p-2">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            {/* Moth Survival Title */}
            <motion.h2 
              className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent"
              animate={{ 
                filter: ['drop-shadow(0 0 10px rgba(249, 115, 22, 0.5))', 'drop-shadow(0 0 15px rgba(249, 115, 22, 0.7))', 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.5))']
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Moth Survival
            </motion.h2>
            
            {/* Mobile Menu Button - Three Lines Only */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-black/20 backdrop-blur-md rounded-full p-3 border border-orange-500/30 flex flex-col justify-center items-center space-y-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-5 h-0.5 bg-orange-400 rounded"></div>
              <div className="w-5 h-0.5 bg-orange-400 rounded"></div>
              <div className="w-5 h-0.5 bg-orange-400 rounded"></div>
            </motion.button>
            
            {/* Sliding Menu from Right */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ 
                x: isMenuOpen ? 0 : '100%', 
                opacity: isMenuOpen ? 1 : 0 
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed right-0 top-0 h-full w-64 bg-gradient-to-br from-black via-gray-900 to-orange-900 border-l border-orange-500/30 backdrop-blur-md z-50"
            >
              <div className="p-4 space-y-4">
                {/* Close Button */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-orange-200 font-semibold text-lg">Menu</h3>
                  <motion.button
                    onClick={() => setIsMenuOpen(false)}
                    className="text-orange-300 hover:text-orange-200 text-xl"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </motion.button>
                </div>
                
                {/* Home Button */}
                <motion.button
                  onClick={() => {
                    setActiveTab('home');
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-4 rounded-full shadow-lg shadow-orange-500/25 border border-orange-400/30 flex items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>🦋</span>
                  <span>Home</span>
                </motion.button>
                
                {/* About Button */}
                {onShowLeaderboard && (
                  <motion.button
                    onClick={() => {
                      onShowLeaderboard();
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-4 rounded-full shadow-lg shadow-orange-500/25 border border-orange-400/30 flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>🏆</span>
                    <span>Leaderboard</span>
                  </motion.button>
                )}
                
                {/* About Button */}
                {onShowAbout && (
                  <motion.button
                    onClick={() => {
                      onShowAbout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-4 rounded-full shadow-lg shadow-orange-500/25 border border-orange-400/30 flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>ℹ️</span>
                    <span>About</span>
                  </motion.button>
                )}
                
                {/* Wallet Section */}
                <div className="pt-4 border-t border-orange-500/30">
                  <div className="w-full">
                    <WalletDropdown
                      walletConnected={walletConnected}
                      balances={balances}
                      userPoints={userPoints}
                      onWalletConnect={onWalletConnect}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Overlay */}
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setIsMenuOpen(false)}
              />
            )}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="relative z-20 p-6">
      <div className="container mx-auto">
        <div className="flex justify-center items-center">
          <div className="bg-black/20 backdrop-blur-md rounded-full p-2 border border-orange-500/30">
            <div className="flex space-x-2 items-center">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm rounded-full font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                      : 'text-orange-200 hover:text-white hover:bg-orange-800/30'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </motion.button>
              ))}
              
              {/* About Button */}
              {activeTab === 'home' && onShowLeaderboard && (
                <motion.button
                  onClick={onShowLeaderboard}
                  className="px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 text-orange-200 hover:text-white hover:bg-orange-800/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="mr-2">🏆</span>
                  Leaderboard
                </motion.button>
              )}
              
              {/* About Button */}
              {activeTab === 'home' && onShowAbout && (
                <motion.button
                  onClick={onShowAbout}
                  className="px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 text-orange-200 hover:text-white hover:bg-orange-800/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="mr-2">ℹ️</span>
                  About
                </motion.button>
              )}
              
              <WalletDropdown
                walletConnected={walletConnected}
                balances={balances}
                userPoints={userPoints}
                onWalletConnect={onWalletConnect}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
