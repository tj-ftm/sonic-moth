
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

  return (
    <nav className={`relative z-20 ${isMobile ? 'p-2' : 'p-6'}`}>
      <div className="container mx-auto">
        <div className="flex justify-center items-center">
          <div className={`bg-black/20 backdrop-blur-md rounded-full ${isMobile ? 'p-1' : 'p-2'} border border-orange-500/30`}>
            <div className={`flex ${isMobile ? 'space-x-1' : 'space-x-2'} items-center`}>
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${isMobile ? 'px-3 py-2 text-xs' : 'px-6 py-3 text-sm'} rounded-full font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                      : 'text-orange-200 hover:text-white hover:bg-orange-800/30'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className={isMobile ? 'mr-1' : 'mr-2'}>{tab.icon}</span>
                  {tab.label}
                </motion.button>
              ))}
              
              {/* About Button */}
              {activeTab === 'home' && onShowAbout && (
                <motion.button
                  onClick={onShowAbout}
                  className={`${isMobile ? 'px-3 py-2 text-xs' : 'px-6 py-3 text-sm'} rounded-full font-medium transition-all duration-300 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className={isMobile ? 'mr-1' : 'mr-2'}>ℹ️</span>
                  {isMobile ? 'Info' : 'About'}
                </motion.button>
              )}
              
              {/* Leaderboard Button */}
              {activeTab === 'home' && onShowLeaderboard && (
                <motion.button
                  onClick={onShowLeaderboard}
                  className={`${isMobile ? 'px-3 py-2 text-xs' : 'px-6 py-3 text-sm'} rounded-full font-medium transition-all duration-300 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className={isMobile ? 'mr-1' : 'mr-2'}>🏆</span>
                  {isMobile ? 'Board' : 'Leaderboard'}
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
