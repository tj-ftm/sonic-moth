import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface WalletConnectProps {
  onConnect: (connected: boolean) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const SONIC_NETWORK = {
    chainId: '0x92', // 146 in hex
    chainName: 'Sonic Network',
    nativeCurrency: {
      name: 'Sonic',
      symbol: 'S',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.soniclabs.com'],
    blockExplorerUrls: ['https://sonicscan.org'],
  };

  const checkAndSwitchNetwork = async (provider: any) => {
    try {
      const chainId = await provider.request({ method: 'eth_chainId' });
      
      if (chainId !== SONIC_NETWORK.chainId) {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SONIC_NETWORK.chainId }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to the wallet
          if (switchError.code === 4902) {
            try {
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [SONIC_NETWORK],
              });
            } catch (addError) {
              throw new Error('Failed to add Sonic Network to wallet');
            }
          } else {
            throw new Error('Failed to switch to Sonic Network');
          }
        }
      }
    } catch (error) {
      console.error('Network switch error:', error);
      throw error;
    }
  };

  const connectRabby = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        setIsConnecting(true);
        setError(null);
        
        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts.length > 0) {
          await checkAndSwitchNetwork(window.ethereum);
          onConnect(true);
        }
      } else {
        setError('Rabby Wallet is not installed. Please install Rabby Wallet to continue.');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to connect to Rabby Wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnect = () => {
    connectRabby();
  };

  return (
    <motion.div className="text-center">
      <motion.button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg shadow-orange-500/25 border border-orange-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(249, 115, 22, 0.5)' }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-2">
          <span>🐰</span>
          <span>{isConnecting ? 'Connecting...' : 'Connect'}</span>
          {isConnecting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>}
        </div>
      </motion.button>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mt-4 max-w-md mx-auto">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}
      
      <p className="text-orange-300 mt-4 text-sm">
        Connect your wallet to access the Sonic Network
      </p>
    </motion.div>
  );
};

export default WalletConnect;