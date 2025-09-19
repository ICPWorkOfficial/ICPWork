"use client";
import React, { useState } from 'react';
import { plugWalletService } from '@/lib/plug-wallet-service';
import { CheckCircle, AlertCircle, Loader2, Wallet } from 'lucide-react';

export default function TestPlugPage() {
  const [connection, setConnection] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const plugConnection = await plugWalletService.connect();
      setConnection(plugConnection);
      setBalance(plugConnection.balance);
    } catch (err: any) {
      setError(err.message);
      console.error('Connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await plugWalletService.disconnect();
      setConnection(null);
      setBalance(0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshBalance = async () => {
    if (!connection) return;
    
    setLoading(true);
    try {
      const newBalance = await plugWalletService.getBalance();
      setBalance(newBalance);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrincipal = (principal: any) => {
    const principalStr = principal.toString();
    return `${principalStr.slice(0, 5)}...${principalStr.slice(-5)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Plug Wallet Test</h1>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Wallet size={32} className="text-blue-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Plug Wallet Connection</h2>
                <p className="text-sm text-gray-600">Test direct Plug wallet integration</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {connection && (
                <button
                  onClick={handleRefreshBalance}
                  disabled={loading}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <Loader2 size={16} className={loading ? 'animate-spin' : ''} />
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertCircle size={16} className="text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          {!connection ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Click the button below to connect to your Plug wallet
              </p>
              <button
                onClick={handleConnect}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet size={20} className="mr-2" />
                    Connect Plug Wallet
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Status</span>
                <div className="flex items-center text-green-600">
                  <CheckCircle size={16} className="mr-2" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Principal</span>
                  <span className="font-mono text-sm text-gray-900">
                    {formatPrincipal(connection.principal)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Account ID</span>
                  <span className="font-mono text-sm text-gray-900">
                    {connection.accountId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Balance</span>
                  <span className="font-semibold text-gray-900">
                    {balance.toFixed(4)} ICP
                  </span>
                </div>
              </div>

              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">How to Test</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
            <li>Make sure you have the Plug wallet browser extension installed</li>
            <li>Click "Connect Plug Wallet" to establish connection</li>
            <li>Check the connection details and balance</li>
            <li>Use the refresh button to update balance</li>
            <li>Click "Disconnect" to end the session</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
