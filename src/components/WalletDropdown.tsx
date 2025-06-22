import React, { useState, useEffect } from 'react';
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
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem('mothUserName') || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (walletConnected && typeof window.ethereum !== 'undefined') {
      // Get current account
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        });
    }
  }, [walletConnected]);

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
        
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts.length > 0) {
          await checkAndSwitchNetwork(window.ethereum);
          setWalletAddress(accounts[0]);
          onWalletConnect(true);
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
          setWalletAddress(accounts[0]);
          onWalletConnect(true);
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

  const handleConnect = () => {
    setShowWalletOptions(true);
    setError(null);
  };

  const handleDisconnect = () => {
    onWalletConnect(false);
    setWalletAddress('');
    setIsOpen(false);
  };

  const handleSaveName = () => {
    localStorage.setItem('mothUserName', userName);
    setIsEditingName(false);
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!walletConnected) {
    if (showWalletOptions) {
      return (
        <div className="relative ml-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute right-0 top-0 ${isMobile ? 'w-72' : 'w-80'} bg-black/90 backdrop-blur-md rounded-xl border border-orange-500/30 shadow-2xl shadow-orange-500/20 z-50 p-6`}
          >
            <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white mb-4 text-center`}>Choose Your Wallet</h3>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
            
            <div className="space-y-3">
              <motion.button
                onClick={connectMetaMask}
                disabled={isConnecting}
                className={`w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold ${isMobile ? 'py-2 px-3 text-sm' : 'py-3 px-4'} rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>🦊</span>
                <span>MetaMask</span>
                {isConnecting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              </motion.button>

              <motion.button
                onClick={connectRabby}
                disabled={isConnecting}
                className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold ${isMobile ? 'py-2 px-3 text-sm' : 'py-3 px-4'} rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>🐰</span>
                <span>Rabby</span>
                {isConnecting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              </motion.button>
            </div>

            <motion.button
              onClick={() => setShowWalletOptions(false)}
              className="w-full mt-4 text-orange-300 hover:text-orange-200 underline text-sm"
              whileHover={{ scale: 1.05 }}
            >
              Cancel
            </motion.button>
          </motion.div>
        </div>
      );
    }

    return (
      <motion.button
        onClick={handleConnect}
        className={`bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold ${isMobile ? 'py-2 px-4 text-sm' : 'py-3 px-6 text-sm'} rounded-full shadow-lg shadow-orange-500/25 border border-orange-400/30 ml-2`}
        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(249, 115, 22, 0.5)' }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-2">
          <span>🦋</span>
          <span>Connect</span>
        </div>
      </motion.button>
    );
  }

  return (
    <div className="relative ml-2">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold ${isMobile ? 'py-2 px-4 text-sm' : 'py-3 px-6 text-sm'} rounded-full shadow-lg shadow-orange-500/25 border border-orange-400/30`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-2">
          <span>🦋</span>
          <span className={isMobile ? 'max-w-[80px] truncate' : ''}>{userName || formatAddress(walletAddress)}</span>
          <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`absolute right-0 top-full mt-2 ${isMobile ? 'w-72' : 'w-80'} bg-black/90 backdrop-blur-md rounded-xl border border-orange-500/30 shadow-2xl shadow-orange-500/20 z-50`}
        >
          <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-4`}>
            <div className="border-b border-orange-500/20 pb-4">
              <h3 className="text-white font-semibold mb-2">Wallet Details</h3>
              <p className={`text-orange-200 ${isMobile ? 'text-xs' : 'text-sm'}`}>{formatAddress(walletAddress)}</p>
            </div>

            <div className="space-y-3">
              <div className="bg-orange-800/20 rounded-lg p-3 border border-orange-400/20">
                <div className="flex justify-between items-center">
                  <span className={`text-orange-200 ${isMobile ? 'text-xs' : 'text-sm'}`}>Sonic ($S)</span>
                  <span className={`text-white font-semibold ${isMobile ? 'text-sm' : ''}`}>{balances.sonic}</span>
                </div>
              </div>
              
              <div className="bg-red-800/20 rounded-lg p-3 border border-red-400/20">
                <div className="flex justify-between items-center">
                  <span className={`text-orange-200 ${isMobile ? 'text-xs' : 'text-sm'}`}>MOTH Token</span>
                  <span className={`text-white font-semibold ${isMobile ? 'text-sm' : ''}`}>{balances.moth}</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-800/20 to-red-800/20 rounded-lg p-3 border border-orange-400/20">
                <div className="flex justify-between items-center">
                  <span className={`text-orange-200 ${isMobile ? 'text-xs' : 'text-sm'}`}>Game Points</span>
                  <span className={`text-white font-semibold ${isMobile ? 'text-sm' : ''}`}>{userPoints.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-orange-500/20 pt-4">
              <div className="space-y-2">
                <label className={`text-orange-200 ${isMobile ? 'text-xs' : 'text-sm'}`}>Display Name</label>
                {isEditingName ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className={`flex-1 px-3 py-2 bg-black/50 border border-orange-500/30 rounded-lg text-white ${isMobile ? 'text-xs' : 'text-sm'} focus:outline-none focus:border-orange-500`}
                      placeholder="Enter display name"
                    />
                    <button
                      onClick={handleSaveName}
                      className={`px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white ${isMobile ? 'text-xs' : 'text-sm'} rounded-lg transition-colors`}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className={`text-white ${isMobile ? 'text-xs' : 'text-sm'}`}>{userName || 'Not set'}</span>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className={`text-orange-400 hover:text-orange-300 ${isMobile ? 'text-xs' : 'text-sm'}`}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-orange-500/20 pt-4">
              <motion.button
                onClick={handleDisconnect}
                className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold ${isMobile ? 'py-2 text-sm' : 'py-3'} rounded-lg transition-colors`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Disconnect Wallet
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WalletDropdown;