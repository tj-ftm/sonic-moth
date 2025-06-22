import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WalletDropdownProps {
  walletConnected: boolean;
  balances: { sonic: string; moth: string };
  userPoints: number;
  onWalletConnect: (connected: boolean) => void;
  onBalanceUpdate?: (balances: { sonic: string; moth: string }) => void;
  walletAddress?: string;
  onWalletConnectWithAddress?: (connected: boolean, address?: string) => void;
}

const WalletDropdown: React.FC<WalletDropdownProps> = ({
  walletConnected,
  balances,
  userPoints,
  onWalletConnect,
  onBalanceUpdate,
  walletAddress: propWalletAddress,
  onWalletConnectWithAddress
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem('mothUserName') || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>(propWalletAddress || '');
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentBalances, setCurrentBalances] = useState({ sonic: '0.00', moth: '0.00' });

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

  const MOTH_CONTRACT_ADDRESS = '0xD259C1ae13e4AcD745556913D044f08542418875';

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
      // Get current account and update balances
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            if (onWalletConnectWithAddress) {
              onWalletConnectWithAddress(true, accounts[0]);
            }
            updateBalances(accounts[0]);
          }
        });
    }
  }, [walletConnected]);

  const updateBalances = async (address: string) => {
    try {
      if (!window.ethereum || !address) return;

      // Get Sonic (native token) balance
      const sonicBalance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });

      // Convert from wei to ether
      const sonicBalanceInEther = parseInt(sonicBalance, 16) / Math.pow(10, 18);

      // Get MOTH token balance using ERC-20 balanceOf method
      const mothBalance = await getMothTokenBalance(address);

      const newBalances = {
        sonic: sonicBalanceInEther.toFixed(4),
        moth: mothBalance
      };

      setCurrentBalances(newBalances);
      
      // Update parent component balances
      if (onBalanceUpdate) {
        onBalanceUpdate(newBalances);
      }
    } catch (error) {
      console.error('Error updating balances:', error);
      // Fallback to showing 0 balances on error
      const fallbackBalances = { sonic: '0.00', moth: '0.00' };
      setCurrentBalances(fallbackBalances);
      if (onBalanceUpdate) {
        onBalanceUpdate(fallbackBalances);
      }
    }
  };

  const getMothTokenBalance = async (address: string): Promise<string> => {
    try {
      // ERC-20 balanceOf function signature
      const balanceOfSignature = '0x70a08231';
      const paddedAddress = address.slice(2).padStart(64, '0');
      const data = balanceOfSignature + paddedAddress;

      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: MOTH_CONTRACT_ADDRESS,
          data: data
        }, 'latest']
      });

      // Convert hex result to decimal
      const balanceInWei = parseInt(result, 16);
      
      // Assuming MOTH token has 18 decimals (standard for most tokens)
      const balanceInTokens = balanceInWei / Math.pow(10, 18);
      
      return balanceInTokens.toFixed(2);
    } catch (error) {
      console.error('Error fetching MOTH balance:', error);
      return '0.00';
    }
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
      // Force wallet connection request
      if (typeof window.ethereum !== 'undefined' && window.ethereum.request) {
        setIsConnecting(true);
        setError(null);
        
        // Always request accounts to trigger wallet popup
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts.length > 0) {
          await checkAndSwitchNetwork(window.ethereum);
          setWalletAddress(accounts[0]);
          
          // Check for pending score from game over screen
          const pendingScore = localStorage.getItem('pendingScore');
          const pendingPlayerName = localStorage.getItem('pendingPlayerName');
          
          if (pendingScore) {
            localStorage.setItem(`mothScore_${accounts[0]}`, pendingScore);
            localStorage.setItem('currentMothScore', pendingScore);
            
            if (pendingPlayerName) {
              localStorage.setItem(`mothWalletName_${accounts[0]}`, pendingPlayerName);
            }
            
            // Clean up pending data
            localStorage.removeItem('pendingScore');
            localStorage.removeItem('pendingPlayerName');
          }
          
          if (onWalletConnectWithAddress) {
            onWalletConnectWithAddress(true, accounts[0]);
          }
          await updateBalances(accounts[0]);
          onWalletConnect(true);
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

  const handleDisconnect = () => {
    try {
      // Force disconnect by clearing wallet state
      if (typeof window.ethereum !== 'undefined' && window.ethereum.request) {
        // Some wallets support wallet_requestPermissions to reset connection
        window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        }).catch(() => {
          // Ignore errors, just proceed with local disconnect
        });
      }
      
      onWalletConnect(false);
      if (onWalletConnectWithAddress) {
        onWalletConnectWithAddress(false);
      }
      setWalletAddress('');
      setCurrentBalances({ sonic: '0.00', moth: '0.00' });
      setIsOpen(false);
    } catch (error) {
      console.error('Disconnect error:', error);
      // Force local disconnect even if wallet disconnect fails
      onWalletConnect(false);
      if (onWalletConnectWithAddress) {
        onWalletConnectWithAddress(false);
      }
      setWalletAddress('');
      setCurrentBalances({ sonic: '0.00', moth: '0.00' });
      setIsOpen(false);
    }
  };

  const handleSaveName = () => {
    localStorage.setItem('mothUserName', userName);
    // Also save wallet-specific display name if connected
    if (walletConnected && walletAddress) {
      localStorage.setItem(`mothWalletName_${walletAddress}`, userName);
    }
    setIsEditingName(false);
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!walletConnected) {
    return (
      <>
        <motion.button
          onClick={handleConnect}
          disabled={isConnecting}
          className={`${isMobile ? 'w-full' : ''} bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold ${isMobile ? 'py-3 px-4 text-sm' : 'py-3 px-6 text-sm'} rounded-full shadow-lg shadow-orange-500/25 border border-orange-400/30 ${!isMobile ? 'ml-2' : ''} disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation clickable`}
          style={{ 
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            cursor: 'pointer',
            minHeight: '48px'
          }}
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
          <div className="absolute top-full mt-2 right-0 bg-red-500/20 border border-red-500/50 rounded-lg p-3 z-50 max-w-xs">
            <p className="text-red-200 text-sm max-w-xs">{error}</p>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="relative ml-2">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isMobile ? 'w-full' : ''} bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold ${isMobile ? 'py-3 px-4 text-sm' : 'py-3 px-6 text-sm'} rounded-full shadow-lg shadow-orange-500/25 border border-orange-400/30 ${!isMobile ? 'ml-2' : ''} touch-manipulation clickable`}
        style={{ 
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          cursor: 'pointer',
          minHeight: '48px'
        }}
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
          className={`absolute right-0 top-full mt-2 ${isMobile ? 'w-72' : 'w-80'} bg-black/90 backdrop-blur-md rounded-xl border border-orange-500/30 shadow-2xl shadow-orange-500/20 z-50 touch-manipulation`}
          style={{ 
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }}
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
                  <span className={`text-white font-semibold ${isMobile ? 'text-sm' : ''}`}>{currentBalances.sonic}</span>
                </div>
              </div>
              
              <div className="bg-red-800/20 rounded-lg p-3 border border-red-400/20">
                <div className="flex justify-between items-center">
                  <span className={`text-orange-200 ${isMobile ? 'text-xs' : 'text-sm'}`}>MOTH Token</span>
                  <span className={`text-white font-semibold ${isMobile ? 'text-sm' : ''}`}>{currentBalances.moth}</span>
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
                      className={`px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white ${isMobile ? 'text-xs' : 'text-sm'} rounded-lg transition-colors touch-manipulation clickable`}
                      style={{ 
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'transparent',
                        cursor: 'pointer',
                        minHeight: '40px'
                      }}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className={`text-white ${isMobile ? 'text-xs' : 'text-sm'}`}>{userName || 'Not set'}</span>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className={`text-orange-400 hover:text-orange-300 ${isMobile ? 'text-xs' : 'text-sm'} touch-manipulation clickable`}
                      style={{ 
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'transparent',
                        cursor: 'pointer',
                        minHeight: '32px',
                        padding: '8px'
                      }}
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
                className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold ${isMobile ? 'py-2 text-sm' : 'py-3'} rounded-lg transition-colors touch-manipulation clickable`}
                style={{ 
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  cursor: 'pointer',
                  minHeight: '48px'
                }}
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