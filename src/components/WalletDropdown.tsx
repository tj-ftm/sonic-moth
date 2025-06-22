
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface WalletDropdownProps {
  walletConnected: boolean;
  balances: { sonic: string; moth: string };
  userPoints: number;
  onWalletConnect: (connected: boolean) => void;
}

const WalletDropdown: React.FC<WalletDropdownProps> = ({
  walletConnected,
  balances,
  userPoints,
  onWalletConnect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem('mothUserName') || '');
  const [isEditingName, setIsEditingName] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      onWalletConnect(true);
    }, 2000);
  };

  const handleSaveName = () => {
    localStorage.setItem('mothUserName', userName);
    setIsEditingName(false);
  };

  if (!walletConnected) {
    return (
      <motion.button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-6 rounded-full text-sm shadow-lg shadow-orange-500/25 border border-orange-400/30 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(249, 115, 22, 0.5)' }}
        whileTap={{ scale: 0.95 }}
      >
        {isConnecting ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Connecting...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>🦋</span>
            <span>Connect</span>
          </div>
        )}
      </motion.button>
    );
  }

  return (
    <div className="relative ml-2">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-6 rounded-full text-sm shadow-lg shadow-orange-500/25 border border-orange-400/30"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-2">
          <span>🦋</span>
          <span>{userName || '0x1234...5678'}</span>
          <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 top-full mt-2 w-80 bg-black/90 backdrop-blur-md rounded-xl border border-orange-500/30 shadow-2xl shadow-orange-500/20 z-50"
        >
          <div className="p-6 space-y-4">
            <div className="border-b border-orange-500/20 pb-4">
              <h3 className="text-white font-semibold mb-2">Wallet Details</h3>
              <p className="text-orange-200 text-sm">0x1234...5678</p>
            </div>

            <div className="space-y-3">
              <div className="bg-orange-800/20 rounded-lg p-3 border border-orange-400/20">
                <div className="flex justify-between items-center">
                  <span className="text-orange-200 text-sm">Sonic ($S)</span>
                  <span className="text-white font-semibold">{balances.sonic}</span>
                </div>
              </div>
              
              <div className="bg-red-800/20 rounded-lg p-3 border border-red-400/20">
                <div className="flex justify-between items-center">
                  <span className="text-orange-200 text-sm">MOTH Token</span>
                  <span className="text-white font-semibold">{balances.moth}</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-800/20 to-red-800/20 rounded-lg p-3 border border-orange-400/20">
                <div className="flex justify-between items-center">
                  <span className="text-orange-200 text-sm">Game Points</span>
                  <span className="text-white font-semibold">{userPoints.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-orange-500/20 pt-4">
              <div className="space-y-2">
                <label className="text-orange-200 text-sm">Display Name</label>
                {isEditingName ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="flex-1 px-3 py-2 bg-black/50 border border-orange-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
                      placeholder="Enter display name"
                    />
                    <button
                      onClick={handleSaveName}
                      className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm">{userName || 'Not set'}</span>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-orange-400 hover:text-orange-300 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WalletDropdown;
