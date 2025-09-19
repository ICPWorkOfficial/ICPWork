"use client";
import React, { useState, useEffect } from 'react';
import { Wallet, Download, ExternalLink, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { walletManager, WalletInfo, WalletConnection } from '@/lib/wallet-connector';
import { WalletErrorHandler } from './WalletErrorHandler';

interface WalletSelectorProps {
  onConnectionChange?: (connection: WalletConnection | null) => void;
  onBalanceChange?: (balance: number) => void;
  className?: string;
}

export function WalletSelector({ 
  onConnectionChange, 
  onBalanceChange,
  className = ""
}: WalletSelectorProps) {
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);
  const [currentConnection, setCurrentConnection] = useState<WalletConnection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWalletList, setShowWalletList] = useState(false);

  useEffect(() => {
    loadAvailableWallets();
  }, []);

  const loadAvailableWallets = () => {
    const wallets = walletManager.getAvailableWallets();
    setAvailableWallets(wallets);
  };

  const handleConnectWallet = async (walletId: string) => {
    setLoading(true);
    setError(null);

    try {
      const connection = await walletManager.connectWallet(walletId);
      setCurrentConnection(connection);
      onConnectionChange?.(connection);
      
      // Load balance
      const balance = await walletManager.getBalance();
      onBalanceChange?.(balance);
      
      setShowWalletList(false);
    } catch (err: any) {
      setError(err.message);
      console.error('Wallet connection failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryConnection = () => {
    if (currentConnection) {
      handleConnectWallet(currentConnection.wallet.id);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await walletManager.disconnectWallet();
      setCurrentConnection(null);
      onConnectionChange?.(null);
      onBalanceChange?.(0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshBalance = async () => {
    if (!currentConnection) return;
    
    setLoading(true);
    try {
      const balance = await walletManager.getBalance();
      onBalanceChange?.(balance);
      setCurrentConnection(prev => prev ? { ...prev, balance } : null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (balance: number) => {
    return balance.toFixed(4);
  };

  const formatPrincipal = (principal: any) => {
    const principalStr = principal.toString();
    return `${principalStr.slice(0, 5)}...${principalStr.slice(-5)}`;
  };

  if (currentConnection) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img 
              src={currentConnection.wallet.icon} 
              alt={currentConnection.wallet.name}
              className="w-8 h-8 rounded-full mr-3"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{currentConnection.wallet.name}</h3>
              <p className="text-sm text-gray-500">Connected</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefreshBalance}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <Loader2 size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              Disconnect
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Balance</span>
              <span className="font-semibold text-gray-900">
                {formatBalance(currentConnection.balance || 0)} ICP
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Account ID</span>
              <span className="font-mono text-sm text-gray-900">
                {formatPrincipal(currentConnection.principal)}
              </span>
            </div>
          </div>
        </div>

        <WalletErrorHandler
          error={error}
          onRetry={handleRetryConnection}
          walletType={currentConnection?.wallet.name}
        />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="text-center mb-6">
        <Wallet size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
        <p className="text-sm text-gray-600">
          Choose a wallet to connect and start using ICP services
        </p>
      </div>

      <WalletErrorHandler
        error={error}
        onRetry={() => setError(null)}
        walletType="wallet"
      />

      <div className="space-y-3">
        {availableWallets.map((wallet) => (
          <div
            key={wallet.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              wallet.installed
                ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                : 'border-gray-100 bg-gray-50 opacity-60'
            }`}
            onClick={() => wallet.installed && handleConnectWallet(wallet.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src={wallet.icon} 
                  alt={wallet.name}
                  className="w-10 h-10 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{wallet.name}</h4>
                  <p className="text-sm text-gray-600">{wallet.description}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                {wallet.installed ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle size={20} className="mr-2" />
                    <span className="text-sm font-medium">Available</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <a
                      href={wallet.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download size={16} className="mr-1" />
                      <span className="text-sm">Install</span>
                      <ExternalLink size={12} className="ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="mt-4 flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-blue-600 mr-2" />
          <span className="text-sm text-gray-600">Connecting...</span>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-900 mb-1">Need help?</h4>
          <p className="text-xs text-blue-800">
            Make sure you have a compatible wallet installed. Plug and Stoic are the most popular options for ICP.
          </p>
        </div>
      </div>
    </div>
  );
}
