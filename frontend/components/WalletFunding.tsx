"use client";
import React, { useState, useEffect } from 'react';
import { Wallet, ArrowRight, RefreshCw, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { walletManager } from '@/lib/wallet-connector';
import { conversionService } from '@/lib/conversion-service';
import { PriceConverter } from './PriceConverter';

interface WalletFundingProps {
  onFundingComplete?: (transactionId: string, amount: number) => void;
  requiredAmount?: number;
  escrowCanisterId?: string;
}

export function WalletFunding({ onFundingComplete, requiredAmount, escrowCanisterId }: WalletFundingProps) {
  const [balance, setBalance] = useState<{ balance: string; currency: string; principal: string } | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [usdAmount, setUsdAmount] = useState<string>('0.00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showConverter, setShowConverter] = useState(false);

  useEffect(() => {
    checkConnection();
    if (requiredAmount) {
      setAmount(requiredAmount.toString());
      updateUsdAmount(requiredAmount);
    }
  }, [requiredAmount]);

  const updateUsdAmount = async (icpAmount: number) => {
    try {
      const usd = await conversionService.convertIcpToUsd(icpAmount);
      setUsdAmount(usd.toFixed(2));
    } catch (error) {
      console.error('Failed to convert ICP to USD:', error);
    }
  };

  const checkConnection = async () => {
    const connected = walletManager.isConnected();
    setIsConnected(connected);
    
    if (connected) {
      try {
        const walletBalance = await walletManager.getBalance();
        const connection = walletManager.getCurrentConnection();
        setBalance({ 
          balance: walletBalance.toString(), 
          currency: 'ICP', 
          principal: connection?.principal.toText() || '' 
        });
      } catch (error) {
        console.error('Failed to load balance:', error);
      }
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      if (value) {
        updateUsdAmount(parseFloat(value) || 0);
      } else {
        setUsdAmount('0.00');
      }
    }
  };

  const fundEscrow = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    const fundingAmount = parseFloat(amount);
    if (!fundingAmount || fundingAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (balance && fundingAmount > parseFloat(balance.balance)) {
      setError('Insufficient balance');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const transactionId = await walletManager.transfer(
        escrowCanisterId || 'rrkah-fqaaa-aaaah-qcujq-cai',
        fundingAmount
      );
      
      setSuccess(`Successfully funded ${fundingAmount} ICP to escrow account`);
      onFundingComplete?.(transactionId, fundingAmount);
      
      // Refresh balance
      await checkConnection();
    } catch (error: any) {
      setError(error.message || 'Funding failed');
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toFixed(4);
  };

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle size={20} className="text-yellow-600 mr-3" />
          <div>
            <h3 className="font-medium text-yellow-800">Wallet Not Connected</h3>
            <p className="text-sm text-yellow-700">
              Please connect your wallet to fund the escrow account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Fund Escrow Account</h3>
        <Wallet size={24} className="text-gray-400" />
      </div>

      {balance && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Available Balance</span>
            <span className="text-lg font-semibold text-gray-900">
              {formatBalance(balance.balance)} ICP
            </span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount to Fund (ICP)
          </label>
          <div className="relative">
            <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {requiredAmount && (
            <p className="text-xs text-gray-500 mt-1">
              Required amount: {requiredAmount} ICP
            </p>
          )}
          {amount && parseFloat(amount) > 0 && (
            <p className="text-sm text-blue-600 mt-1">
              ≈ ${usdAmount} USD
            </p>
          )}
        </div>

        {/* Price Converter Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Need help with pricing?</span>
          <button
            onClick={() => setShowConverter(!showConverter)}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            {showConverter ? 'Hide' : 'Show'} Price Converter
          </button>
        </div>

        {/* Price Converter */}
        {showConverter && (
          <div className="mt-4">
            <PriceConverter
              onConversionChange={(icp, usd) => {
                setAmount(icp.toFixed(6));
                setUsdAmount(usd.toFixed(2));
              }}
              initialIcpAmount={parseFloat(amount) || 0}
              showPriceTicker={true}
              className="border-0 p-0"
            />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle size={16} className="text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <CheckCircle size={16} className="text-green-500 mr-2" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          </div>
        )}

        <button
          onClick={fundEscrow}
          disabled={loading || !amount || parseFloat(amount) <= 0}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <RefreshCw size={16} className="mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ArrowRight size={16} className="mr-2" />
              Fund Escrow Account
            </>
          )}
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-900 mb-1">How it works:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Funds are transferred to the escrow canister</li>
            <li>• 10% platform fee is automatically deducted</li>
            <li>• Remaining amount is held until project completion</li>
            <li>• Funds are released after mutual approval</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
