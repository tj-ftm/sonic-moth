import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface WalletConnectProps {
  onConnect: (connected: boolean) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
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

  const connectMetaMask = async () => {
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
          setShowWalletOptions(false);
        }
      } else {
        setError('MetaMask is not installed');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to connect to MetaMask');
    } finally {
      setIsConnecting(false);
    }
  };

  const connectRabby = async () => {
    try {
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isRabby) {
        setIsConnecting(true);
        setError(null);
        
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts.length > 0) {
          await checkAndSwitchNetwork(window.ethereum);
          onConnect(true);
          setShowWalletOptions(false);
        }
      } else {
        setError('Rabby Wallet is not installed');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to connect to Rabby Wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const connectWalletConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // For now, we'll simulate WalletConnect
      // In a real implementation, you'd use @walletconnect/web3-provider
      setTimeout(async () => {
        try {
          // Simulate successful connection
          onConnect(true);
          setShowWalletOptions(false);
        } catch (error: any) {
          setError('Failed to connect via WalletConnect');
        } finally {
          setIsConnecting(false);
        }
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to connect via WalletConnect');
      setIsConnecting(false);
    }
  };

  const handleConnect = () => {
    setShowWalletOptions(true);
    setError(null);
  };

  if (showWalletOptions) {
    return (
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-2xl font-bold text-white mb-6">Choose Your Wallet</h3>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}
        
        <div className="space-y-4 max-w-md mx-auto">
          <motion.button
            onClick={connectMetaMask}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-orange-500/25 border border-orange-400/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-2xl">🦊</span>
            <span>MetaMask</span>
            {isConnecting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>}
          </motion.button>

          <motion.button
            onClick={connectRabby}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-purple-500/25 border border-purple-400/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-2xl">🐰</span>
            <span>Rabby Wallet</span>
            {isConnecting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>}
          </motion.button>

          <motion.button
            onClick={connectWalletConnect}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/25 border border-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-2xl">🔗</span>
            <span>WalletConnect</span>
            {isConnecting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>}
          </motion.button>
        </div>

        <motion.button
          onClick={() => setShowWalletOptions(false)}
          className="mt-6 text-orange-300 hover:text-orange-200 underline"
          whileHover={{ scale: 1.05 }}
        >
          Back
        </motion.button>
        
        <p className="text-orange-300 mt-4 text-sm">
          Connect your wallet to access the Sonic Network
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div className="text-center">
      <motion.button
        onClick={handleConnect}
        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg shadow-orange-500/25 border border-orange-400/30"
        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(249, 115, 22, 0.5)' }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-2">
          <span>🦋</span>
          <span>Connect Wallet</span>
        </div>
      </motion.button>
      
      <p className="text-orange-300 mt-4 text-sm">
        Connect your wallet to access the Sonic Network
      </p>
    </motion.div>
  );
};

export default WalletConnect;