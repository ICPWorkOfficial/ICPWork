"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Shield, CheckCircle, Wallet, Clock, FileText, Zap, RefreshCw } from 'lucide-react';
import { MultiWalletConnection } from '@/components/MultiWalletConnection';
import { WalletFunding } from '@/components/WalletFunding';
import { PriceConverter } from '@/components/PriceConverter';
import { walletService } from '@/lib/wallet-service';
import { conversionService } from '@/lib/conversion-service';

interface BookingData {
  serviceId: string;
  serviceTitle: string;
  selectedTier: 'Basic' | 'Advanced' | 'Premium';
  price: string;
  provider: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    projectName: '',
    projectDescription: '',
    timeline: '3 days'
  });
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [additionalServices, setAdditionalServices] = useState({
    fastDelivery: false,
    additionalRevision: false,
    extraChanges: false
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletBalance, setWalletBalance] = useState<any>(null);
  const [fundingComplete, setFundingComplete] = useState(false);
  const [icpPrice, setIcpPrice] = useState<number>(0);

  useEffect(() => {
    // Get booking data from localStorage
    const storedData = localStorage.getItem('bookingData');
    if (storedData) {
      setBookingData(JSON.parse(storedData));
    } else {
      // Redirect to services if no booking data
      router.push('/client-dashboard');
    }
    setLoading(false);
    
    // Check wallet connection
    setWalletConnected(walletService.isConnected());
    
    // Load ICP price for conversion
    loadIcpPrice();
  }, [router]);

  const loadIcpPrice = async () => {
    try {
      const rate = await conversionService.getConversionRate();
      setIcpPrice(rate.icpToUsd);
    } catch (error) {
      console.error('Failed to load ICP price:', error);
    }
  };

  // Calculate pricing
  const calculatePricing = () => {
    if (!bookingData) return { basePrice: 0, additionalCost: 0, tax: 0, total: 0 };
    
    const basePrice = parseFloat(bookingData.price.replace('$', ''));
    const additionalCost = Object.values(additionalServices).filter(Boolean).length * 10; // $10 per additional service
    const subtotal = basePrice + additionalCost;
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    return { basePrice, additionalCost, tax, total };
  };

  const { basePrice, additionalCost, tax, total } = calculatePricing();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdditionalServiceChange = (service: keyof typeof additionalServices) => {
    setAdditionalServices(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  const handleWalletConnectionChange = (connected: boolean) => {
    setWalletConnected(connected);
  };

  const handleWalletBalanceChange = (balance: any) => {
    setWalletBalance(balance);
  };

  const handleFundingComplete = (transactionId: string, amount: number) => {
    setFundingComplete(true);
    setTimeout(() => {
      handleSubmit(new Event('submit') as any);
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (!bookingData) {
        throw new Error('No booking data available');
      }

      if (paymentMethod === 'wallet' && !fundingComplete) {
        throw new Error('Please complete wallet funding first');
      }

      if (paymentMethod === 'card') {
        const depositResponse = await fetch('/api/escrow/balance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'deposit',
            amount: total
          })
        });

        const depositResult = await depositResponse.json();
        if (!depositResult.success) {
          throw new Error(depositResult.error || 'Failed to deposit funds');
        }
      }

      const timelineDays = parseInt(formData.timeline) || 7;
      const deadline = Date.now() + (timelineDays * 24 * 60 * 60 * 1000);

      const escrowResponse = await fetch('/api/escrow/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller: bookingData.provider,
          arbitrator: null,
          amount: total,
          description: formData.projectDescription,
          deadline: deadline,
          serviceId: bookingData.serviceId,
          projectTitle: bookingData.serviceTitle
        })
      });

      const escrowResult = await escrowResponse.json();
      if (!escrowResult.success) {
        throw new Error(escrowResult.error || 'Failed to create escrow agreement');
      }

      console.log('Escrow created successfully:', {
        escrowId: escrowResult.escrowId,
        ...bookingData,
        ...formData,
        paymentMethod
      });

      localStorage.setItem('escrowId', escrowResult.escrowId.toString());
      localStorage.removeItem('bookingData');
      router.push('/client-dashboard/checkout/success');
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      alert(`Payment processing failed: ${error.message}. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">No booking data found</p>
        <button 
          onClick={() => router.push('/client-dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Services
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ICP</span>
                </div>
                <span className="text-xl font-bold text-gray-900">ICPWork</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Find Talent</span>
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Find Jobs</span>
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Find Work</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden lg:block relative">
                <input
                  type="text"
                  placeholder="Search your industry here..."
                  className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="hidden md:block relative">
                <select className="px-4 py-2 bg-pink-100 border border-pink-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-pink-500">
                  <option>Freelancer</option>
                </select>
              </div>
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Log In</span>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Check Out Page</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Project Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Name */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ans:
                </label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  placeholder="ENTER A PROJECT NAME."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-4"
                  />
                  <Wallet size={24} className="mr-3 text-blue-600" />
                  <span className="text-lg">ICP Wallet</span>
                </label>
                
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-4"
                  />
                  <CreditCard size={24} className="mr-3 text-blue-600" />
                  <span className="text-lg">Payment Card</span>
                </label>
              </div>
            </div>

            {/* Additional Services */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Services</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={additionalServices.fastDelivery}
                      onChange={() => handleAdditionalServiceChange('fastDelivery')}
                      className="mr-4 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-lg font-medium">FAST DELIVERY</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">$10</span>
                </label>
                
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={additionalServices.additionalRevision}
                      onChange={() => handleAdditionalServiceChange('additionalRevision')}
                      className="mr-4 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-lg font-medium">ADDITIONAL REVISION</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">$10</span>
                </label>
                
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={additionalServices.extraChanges}
                      onChange={() => handleAdditionalServiceChange('extraChanges')}
                      className="mr-4 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-lg font-medium">EXTRA CHANGES</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">$10</span>
                </label>
              </div>
            </div>

            {/* Wallet Funding Section */}
            {paymentMethod === 'wallet' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <WalletFunding
                  requiredAmount={total}
                  onFundingComplete={handleFundingComplete}
                />
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            {/* Wallet Connection */}
            <div className="mb-6">
              <MultiWalletConnection
                onConnectionChange={handleWalletConnectionChange}
                onBalanceChange={(balance) => handleWalletBalanceChange({ balance, formatted: `${balance.toFixed(4)} ICP` })}
              />
            </div>
            
            {/* Order Summary Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              {/* Service Preview */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <FileText size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                    {bookingData?.serviceTitle || 'Service Title'}
                  </h4>
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Basic Tier</span>
                  <span className="font-semibold">${basePrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Delivery Time</span>
                  <span className="font-semibold">{formData.timeline}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Commercial Use</span>
                  <CheckCircle size={16} className="text-purple-600" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Source File</span>
                  <CheckCircle size={16} className="text-purple-600" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Interactive Mockup</span>
                  <CheckCircle size={16} className="text-purple-600" />
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <a href="#" className="text-purple-600 hover:text-purple-700 text-sm">
                  Have a Promo code?
                </a>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total</span>
                  <span className="font-semibold">${basePrice + additionalCost}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taxes</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Final Payable Amount</span>
                    <span className="text-lg font-bold text-gray-900">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleSubmit}
                disabled={isProcessing || (paymentMethod === 'wallet' && !fundingComplete)}
                className="w-full mt-6 bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Check Out ($${total.toFixed(2)})`
                )}
              </button>
            </div>

            {/* Payment Protection */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield size={20} className="text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Organaise Payment Protection</h4>
                  <p className="text-sm text-gray-600">
                    Fund the project upfront. {bookingData?.provider || 'Freelancer'} gets paid once you are satisfied with the work.
                  </p>
                </div>
              </div>
            </div>

            {/* Price Converter */}
            <div className="mt-6">
              <PriceConverter
                onConversionChange={(icp, usd) => {
                  console.log('Price conversion:', { icp, usd });
                }}
                showPriceTicker={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}