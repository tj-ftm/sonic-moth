
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import WalletDropdown from './WalletDropdown';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  walletConnected: boolean;
  balances: { sonic: string; moth: string };
  userPoints: number;
  onWalletConnect: (connected: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  setActiveTab, 
  walletConnected, 
  balances, 
  userPoints, 
  onWalletConnect 
}) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🦋' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'about', label: 'About', icon: 'ℹ️' }
  ];

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
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
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
