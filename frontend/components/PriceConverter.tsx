"use client";
import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Coins } from 'lucide-react';
import { conversionService, ConversionRate } from '@/lib/conversion-service';

interface PriceConverterProps {
  onConversionChange?: (icpAmount: number, usdAmount: number) => void;
  initialIcpAmount?: number;
  showPriceTicker?: boolean;
  className?: string;
}

export function PriceConverter({ 
  onConversionChange, 
  initialIcpAmount = 0,
  showPriceTicker = true,
  className = ""
}: PriceConverterProps) {
  const [icpAmount, setIcpAmount] = useState<string>(initialIcpAmount.toString());
  const [usdAmount, setUsdAmount] = useState<string>('0.00');
  const [conversionRate, setConversionRate] = useState<ConversionRate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceData, setPriceData] = useState<{
    price: number;
    change24h: number;
    formattedPrice: string;
    formattedChange: string;
    isPositive: boolean;
  } | null>(null);

  // Load initial conversion rate and price data
  useEffect(() => {
    loadConversionData();
  }, []);

  // Update conversion when ICP amount changes
  useEffect(() => {
    if (conversionRate && icpAmount) {
      const icp = parseFloat(icpAmount) || 0;
      const usd = icp * conversionRate.icpToUsd;
      setUsdAmount(usd.toFixed(2));
      onConversionChange?.(icp, usd);
    }
  }, [icpAmount, conversionRate, onConversionChange]);

  const loadConversionData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [rate, price] = await Promise.all([
        conversionService.getConversionRate(),
        conversionService.getPriceWithChange()
      ]);
      
      setConversionRate(rate);
      setPriceData(price);
      
      // Update USD amount if ICP amount is set
      if (icpAmount) {
        const icp = parseFloat(icpAmount) || 0;
        const usd = icp * rate.icpToUsd;
        setUsdAmount(usd.toFixed(2));
      }
    } catch (err) {
      setError('Failed to load conversion rates');
      console.error('Conversion error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIcpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setIcpAmount(value);
    }
  };

  const handleUsdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setUsdAmount(value);
      
      if (conversionRate) {
        const usd = parseFloat(value) || 0;
        const icp = usd * conversionRate.usdToIcp;
        setIcpAmount(icp.toFixed(6));
        onConversionChange?.(icp, usd);
      }
    }
  };

  const refreshRates = () => {
    conversionService.clearCache();
    loadConversionData();
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Price Ticker */}
      {showPriceTicker && priceData && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Coins size={20} className="text-blue-600 mr-2" />
              <span className="font-semibold text-gray-900">ICP Price</span>
            </div>
            <button
              onClick={refreshRates}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900">{priceData.formattedPrice}</span>
              <span className="text-sm text-gray-500 ml-2">USD</span>
            </div>
            <div className={`flex items-center ${priceData.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {priceData.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="ml-1 font-medium">{priceData.formattedChange}</span>
            </div>
          </div>
          
          {conversionRate && (
            <p className="text-xs text-gray-500 mt-2">
              Last updated: {formatTimeAgo(conversionRate.lastUpdated)} • Source: {conversionRate.source}
            </p>
          )}
        </div>
      )}

      {/* Conversion Inputs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Price Converter</h3>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ICP Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ICP Amount
            </label>
            <div className="relative">
              <Coins size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={icpAmount}
                onChange={handleIcpChange}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                ICP
              </span>
            </div>
          </div>

          {/* USD Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              USD Amount
            </label>
            <div className="relative">
              <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={usdAmount}
                onChange={handleUsdChange}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                USD
              </span>
            </div>
          </div>
        </div>

        {/* Conversion Rate Display */}
        {conversionRate && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">
                <strong>1 ICP = ${conversionRate.icpToUsd.toFixed(4)} USD</strong>
              </span>
              <span className="text-xs text-blue-600">
                Rate updated: {formatTimeAgo(conversionRate.lastUpdated)}
              </span>
            </div>
          </div>
        )}

        {/* Quick Amount Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Amounts (ICP)
          </label>
          <div className="flex flex-wrap gap-2">
            {[1, 5, 10, 25, 50, 100].map((amount) => (
              <button
                key={amount}
                onClick={() => setIcpAmount(amount.toString())}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {amount} ICP
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
