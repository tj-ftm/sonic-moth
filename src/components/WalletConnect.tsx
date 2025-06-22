
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface WalletConnectProps {
  onConnect: (connected: boolean) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    setTimeout(() => {
      setIsConnecting(false);
      onConnect(true);
    }, 2000);
  };

  return (
    <motion.div className="text-center">
      <motion.button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg shadow-orange-500/25 border border-orange-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(249, 115, 22, 0.5)' }}
        whileTap={{ scale: 0.95 }}
        animate={isConnecting ? { 
          boxShadow: ['0 0 20px rgba(249, 115, 22, 0.5)', '0 0 40px rgba(249, 115, 22, 0.8)', '0 0 20px rgba(249, 115, 22, 0.5)']
        } : {}}
        transition={{ duration: 0.5, repeat: isConnecting ? Infinity : 0 }}
      >
        {isConnecting ? (
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Connecting to Rabby Wallet...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>🦋</span>
            <span>Connect Wallet</span>
          </div>
        )}
      </motion.button>
      
      <p className="text-orange-300 mt-4 text-sm">
        Connect your Rabby Wallet to access the Sonic Network
      </p>
    </motion.div>
  );
};

export default WalletConnect;
