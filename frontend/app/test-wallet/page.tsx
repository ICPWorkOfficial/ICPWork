"use client";
import React, { useState } from 'react';
import { WalletConnection } from '@/components/WalletConnection';
import { MultiWalletConnection } from '@/components/MultiWalletConnection';
import { WalletFunding } from '@/components/WalletFunding';
import { PriceConverter } from '@/components/PriceConverter';
import { walletService } from '@/lib/wallet-service';

export default function TestWalletPage() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletBalance, setWalletBalance] = useState<any>(null);

  const handleWalletConnectionChange = (connected: boolean) => {
    setWalletConnected(connected);
  };

  const handleWalletBalanceChange = (balance: any) => {
    setWalletBalance(balance);
  };

  const handleFundingComplete = (transactionId: string, amount: number) => {
    console.log('Funding completed:', { transactionId, amount });
    alert(`Funding completed! Transaction ID: ${transactionId}, Amount: ${amount} ICP`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">ICP Wallet Integration Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Multi-Wallet Connection */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Multi-Wallet Connection</h2>
            <MultiWalletConnection
              onConnectionChange={handleWalletConnectionChange}
              onBalanceChange={(balance) => handleWalletBalanceChange({ balance, formatted: `${balance.toFixed(4)} ICP` })}
            />
          </div>

          {/* Legacy Wallet Connection */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Legacy Wallet Connection</h2>
            <WalletConnection
              onConnectionChange={handleWalletConnectionChange}
              onBalanceChange={handleWalletBalanceChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Wallet Funding */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Wallet Funding</h2>
            <WalletFunding
              requiredAmount={100}
              onFundingComplete={handleFundingComplete}
            />
          </div>
        </div>

        {/* Price Converter */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Real-time Price Converter</h2>
          <PriceConverter
            onConversionChange={(icp, usd) => {
              console.log('Conversion:', { icp, usd });
            }}
            showPriceTicker={true}
          />
        </div>

        {/* Status Display */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <div className="space-y-2">
            <p><strong>Wallet Connected:</strong> {walletConnected ? 'Yes' : 'No'}</p>
            <p><strong>Balance:</strong> {walletBalance ? `${walletBalance.balance} ${walletBalance.currency}` : 'Not loaded'}</p>
            <p><strong>Principal:</strong> {walletBalance ? walletBalance.principal : 'Not available'}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">How to Test</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Click "Connect Wallet" to establish a mock wallet connection</li>
            <li>Check the status section to see connection details</li>
            <li>Enter an amount in the funding section (e.g., 50)</li>
            <li>Click "Fund Escrow Account" to simulate a transaction</li>
            <li>Watch for the success message with transaction ID</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
