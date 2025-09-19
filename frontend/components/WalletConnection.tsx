"use client";
import React, { useState, useEffect } from 'react';
import { Wallet, LogOut, RefreshCw, AlertCircle } from 'lucide-react';
import { walletService, WalletConnection, WalletBalance } from '@/lib/wallet-service';
import { Principal } from '@dfinity/principal';

interface WalletConnectionProps {
  onConnectionChange?: (connected: boolean) => void;
  onBalanceChange?: (balance: WalletBalance) => void;
}

export function WalletConnection({ onConnectionChange, onBalanceChange }: WalletConnectionProps) {
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if wallet is already connected
    const existingConnection = walletService.getConnection();
    if (existingConnection) {
      setConnection(existingConnection);
      loadBalance();
    }
  }, []);

  const loadBalance = async () => {
    try {
      const walletBalance = await walletService.getBalance();
      setBalance(walletBalance);
      onBalanceChange?.(walletBalance);
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newConnection = await walletService.connectWallet();
      setConnection(newConnection);
      await loadBalance();
      onConnectionChange?.(true);
    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet');
      onConnectionChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    walletService.disconnectWallet();
    setConnection(null);
    setBalance(null);
    onConnectionChange?.(false);
  };

  const refreshBalance = async () => {
    if (connection) {
      await loadBalance();
    }
  };

  const formatPrincipal = (principal: Principal) => {
    const text = principal.toText();
    return `${text.slice(0, 6)}...${text.slice(-6)}`;
  };

  if (!connection) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Connect Wallet</h3>
          <Wallet size={24} className="text-gray-400" />
        </div>
        
        <p className="text-gray-600 mb-4">
          Connect your ICP wallet to fund escrow accounts and make payments.
        </p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <AlertCircle size={16} className="text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}
        
        <button
          onClick={connectWallet}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <RefreshCw size={16} className="mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet size={16} className="mr-2" />
              Connect Wallet
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Wallet Connected</h3>
        <button
          onClick={disconnectWallet}
          className="text-gray-400 hover:text-gray-600"
        >
          <LogOut size={20} />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Principal ID</label>
          <p className="text-sm text-gray-900 font-mono">
            {formatPrincipal(connection.principal)}
          </p>
        </div>
        
        {balance && (
          <div>
            <label className="text-sm font-medium text-gray-500">Balance</label>
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-gray-900">
                {balance.balance} {balance.currency}
              </p>
              <button
                onClick={refreshBalance}
                className="text-gray-400 hover:text-gray-600"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        )}
        
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Your wallet is connected and ready for transactions.
          </p>
        </div>
      </div>
    </div>
  );
}
