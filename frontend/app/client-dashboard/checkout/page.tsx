"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Shield, CheckCircle, Wallet, Clock, FileText, Zap, RefreshCw } from 'lucide-react';
import { MultiWalletConnection } from '@/components/MultiWalletConnection';
import { WalletFunding } from '@/components/WalletFunding';
import { PriceConverter } from '@/components/PriceConverter';
import { walletManager } from '@/lib/wallet-connector';
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
  const [conversionRate, setConversionRate] = useState<{icpToUsd: number, usdToIcp: number} | null>(null);

  useEffect(() => {
    // Get booking data from localStorage
    const storedData = localStorage.getItem('bookingData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setBookingData(data);
      
      // Set default form values based on booking data
      setFormData({
        projectName: `${data.serviceTitle} Project`,
        projectDescription: `I need help with ${data.serviceTitle} service. Please provide details about the project requirements.`,
        timeline: '3 days'
      });
    } else {
      // Redirect to services if no booking data
      router.push('/client-dashboard');
    }
    setLoading(false);
    
    // Check wallet connection
    setWalletConnected(walletManager.isConnected());
    
    // Load ICP price for conversion
    loadIcpPrice();
    
    // Set up automatic refresh every 5 minutes
    const refreshInterval = setInterval(loadIcpPrice, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [router]);

  const loadIcpPrice = async () => {
    try {
      const rate = await conversionService.getConversionRate();
      setIcpPrice(rate.icpToUsd);
      setConversionRate(rate);
    } catch (error) {
      console.error('Failed to load ICP price:', error);
    }
  };

  // Calculate pricing
  const calculatePricing = () => {
    if (!bookingData) return { basePrice: 0, additionalCost: 0, tax: 0, total: 0 };
    
    // Parse price safely - handle different price formats
    let basePrice = 0;
    if (bookingData.price) {
      const priceStr = bookingData.price.toString();
      basePrice = parseFloat(priceStr.replace(/[$,]/g, '')) || 0;
    }
    
    // If no price found, use default pricing based on tier
    if (basePrice === 0) {
      switch (bookingData.selectedTier) {
        case 'Basic':
          basePrice = 50;
          break;
        case 'Advanced':
          basePrice = 100;
          break;
        case 'Premium':
          basePrice = 200;
          break;
        default:
          basePrice = 50;
      }
    }
    
    const additionalCost = Object.values(additionalServices).filter(Boolean).length * 10; // $10 per additional service
    const subtotal = basePrice + additionalCost;
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    console.log('Pricing calculation:', { basePrice, additionalCost, tax, total, bookingData });
    
    return { basePrice, additionalCost, tax, total };
  };

  const { basePrice, additionalCost, tax, total } = calculatePricing();

  // Calculate ICP amounts
  const calculateIcpAmounts = () => {
    // Use default conversion rate if not available (1 USD = 0.1 ICP as fallback)
    const defaultRate = 0.1;
    const rate = conversionRate?.usdToIcp || defaultRate;
    
    return {
      basePriceIcp: basePrice * rate,
      additionalCostIcp: additionalCost * rate,
      taxIcp: tax * rate,
      totalIcp: total * rate
    };
  };

  const { basePriceIcp, additionalCostIcp, taxIcp, totalIcp } = calculateIcpAmounts();

  // Check if ICP pricing should be shown
  const shouldShowIcpPricing = walletConnected || paymentMethod === 'wallet';

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

      console.log('Booking data:', bookingData);
      console.log('Form data:', formData);
      console.log('Payment method:', paymentMethod);
      console.log('Total amounts:', { total, totalIcp });
      console.log('Pricing breakdown:', { basePrice, additionalCost, tax, total });
      console.log('ICP amounts:', { basePriceIcp, additionalCostIcp, taxIcp, totalIcp });
      console.log('Conversion rate:', conversionRate);

      if (paymentMethod === 'wallet' && !walletConnected) {
        throw new Error('Please connect your wallet first');
      }

      // Validate form data
      if (!formData.projectName.trim()) {
        throw new Error('Project name is required');
      }
      if (!formData.projectDescription.trim()) {
        throw new Error('Project description is required');
      }

      // Handle wallet payment
      let transactionId = null;
      if (paymentMethod === 'wallet') {
        console.log('Processing wallet payment...');
        
        // Get the ICP amount to transfer
        const icpAmount = totalIcp;
        console.log(`Transferring ${icpAmount} ICP to escrow...`);
        
        // Get wallet connection details
        const walletConnection = walletManager.getCurrentConnection();
        if (!walletConnection) {
          throw new Error('Wallet connection not found');
        }
        
        // Transfer ICP to escrow canister
        transactionId = await walletManager.transfer(
          'yeeiw-3qaaa-aaaah-qcvmq-cai', // Escrow canister ID
          icpAmount
        );
        
        console.log('Wallet transfer completed:', transactionId);
      }
      
      // Handle card payment
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

      // Ensure amount is valid
      const finalAmount = paymentMethod === 'wallet' ? totalIcp : total;
      if (!finalAmount || finalAmount <= 0 || isNaN(finalAmount)) {
        throw new Error(`Invalid amount calculated: ${finalAmount}. Please check pricing configuration.`);
      }

      // Validate required fields before creating escrow
      const requiredFields = {
        seller: bookingData.provider || 'default-provider',
        amount: finalAmount,
        description: formData.projectDescription,
        deadline: deadline,
        serviceId: bookingData.serviceId || 'default-service',
        projectTitle: bookingData.serviceTitle || 'Default Service'
      };

      console.log('Required fields validation:', requiredFields);

      // Check for missing required fields
      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => {
          if (key === 'amount') {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            return !numValue || numValue <= 0 || isNaN(numValue);
          }
          return !value || (typeof value === 'string' && value.trim() === '');
        })
        .map(([key]) => key);

      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        console.error('Field values:', requiredFields);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      console.log('Creating escrow with data:', requiredFields);

      const escrowResponse = await fetch('/api/escrow/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller: bookingData.provider,
          arbitrator: null,
          amount: paymentMethod === 'wallet' ? totalIcp : total,
          amountUSD: total,
          description: formData.projectDescription,
          deadline: deadline,
          serviceId: bookingData.serviceId,
          projectTitle: bookingData.serviceTitle,
          paymentMethod: paymentMethod
        })
      });

      console.log('Escrow API response status:', escrowResponse.status);
      const escrowResult = await escrowResponse.json();
      console.log('Escrow API response:', escrowResult);
      
      if (!escrowResult.success) {
        throw new Error(escrowResult.error || 'Failed to create escrow agreement');
      }

      // Create order record with all details
      console.log('Creating order record...');
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientEmail: 'client@example.com', // TODO: Get from session/auth
          clientName: 'Client Name', // TODO: Get from user profile
          serviceProvider: bookingData.provider,
          serviceProviderEmail: 'provider@example.com', // TODO: Get from service data
          serviceId: bookingData.serviceId,
          serviceTitle: bookingData.serviceTitle,
          serviceCategory: 'General', // TODO: Get from service data
          selectedTier: bookingData.selectedTier,
          projectName: formData.projectName,
          projectDescription: formData.projectDescription,
          timeline: formData.timeline,
          deadline: deadline,
          basePrice: basePrice,
          additionalServices: additionalServices,
          additionalCost: additionalCost,
          tax: tax,
          totalAmount: total,
          paymentMethod: paymentMethod,
          escrowId: escrowResult.escrowId.toString(),
          notes: `Order created via ${paymentMethod} payment method`
        })
      });

      console.log('Order API response status:', orderResponse.status);
      const orderResult = await orderResponse.json();
      console.log('Order API response:', orderResult);
      
      if (!orderResult.success) {
        console.warn('Failed to create order record:', orderResult.error);
        // Don't fail the checkout process if order creation fails
      }

      console.log('Checkout completed successfully:', {
        escrowId: escrowResult.escrowId,
        orderId: orderResult.order?.id,
        orderNumber: orderResult.order?.orderNumber,
        ...bookingData,
        ...formData,
        paymentMethod,
        totalAmount: total,
        deadline: new Date(deadline).toISOString()
      });

      localStorage.setItem('escrowId', escrowResult.escrowId.toString());
      localStorage.setItem('orderId', orderResult.order?.id || '');
      localStorage.setItem('orderNumber', orderResult.order?.orderNumber || '');
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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--brand-4)' }}></div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">No booking data found</p>
        <button 
          onClick={() => router.push('/client-dashboard')}
          className="px-4 py-2 btn-outline-brand rounded hover:opacity-95"
        >
          Back to Services
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-muted">
      {/* Header */}
      <div className="bg-brand-white border-b" style={{ borderColor: 'rgba(82,39,132,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
    <div className="w-[57px] h-[33px]">
      <svg viewBox="0 0 57 33" fill="none" className="w-full h-full">
        <path d="M40.1879 8.63504L32.2559 10.2732L25.8785 16.0471L18.2052 8.3738L18.2457 8.33328L11.1216 1.20916C9.50931 -0.403096 6.89434 -0.403096 5.28209 1.20916L1.20919 5.28206C-0.403065 6.89432 -0.403065 9.50928 1.20919 11.1215L18.4285 28.3408C23.8524 33.7647 32.6474 33.7647 38.0713 28.3408L38.1213 28.2908L55.0284 11.3836L50.0424 6.47868L40.1879 8.63504Z" fill="url(#paint0_linear)" />
        <path d="M50.1 6.4793L43.8062 7.68634L39.4091 8.63473L38.6832 9.0296L31.0349 1.38128C29.4226 -0.230975 26.8077 -0.230975 25.1954 1.38128L18.2437 8.33297L30.7409 20.8301C34.8379 24.9272 41.4809 24.9272 45.5788 20.8301L48.0317 18.3773L55.0265 11.3825L50.1009 6.4793H50.1Z" fill="url(#paint1_linear)" />
        <path d="M18.2441 8.33384L18.2039 8.37407L38.1198 28.29L38.1601 28.2498L18.2441 8.33384Z" fill="#FDB131" />
        <path d="M55.0284 11.3825C51.1668 15.2441 44.9057 15.2441 41.0432 11.3825L38.1635 8.5028L45.1557 1.5106C46.768 -0.101657 49.3829 -0.101657 50.9952 1.5106L55.0276 5.54297C56.6398 7.15523 56.6398 9.7702 55.0276 11.3825H55.0284Z" fill="#29AAE1" />
        <defs>
          <linearGradient id="paint0_linear" x1="15.066" y1="-1.80067" x2="47.4853" y2="30.6187" gradientUnits="userSpaceOnUse">
            <stop offset="0.21" stopColor="#F05A24" />
            <stop offset="0.68" stopColor="#FAAF3B" />
          </linearGradient>
          <linearGradient id="paint1_linear" x1="26.2265" y1="-0.549979" x2="55.4515" y2="28.675" gradientUnits="userSpaceOnUse">
            <stop offset="0.22" stopColor="#EC1E79" />
            <stop offset="0.89" stopColor="#522784" />
          </linearGradient>
        </defs>
      </svg>
    </div>
    <span className="text-[24px] font-bold text-black">ICPWork</span>
    <span className="text-[16px] font-normal text-black">®</span>
  </div>
            </div>
            <div className="flex items-center space-x-4">
            
             
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
        
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--brand-4)' }}></div>
            <p className="mt-2 text-gray-600">Loading checkout details...</p>
          </div>
        )}

        {!loading && (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Project Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Name */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  placeholder="Enter a project name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(82,39,132,0.12)] focus:border-transparent text-lg"
                  required
                />
              </div>
            </div>

            {/* Project Description */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  placeholder="Describe your project requirements in detail..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(82,39,132,0.12)] focus:border-transparent text-lg resize-vertical"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Please provide detailed information about what you need for this project.
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Timeline
                </label>
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(82,39,132,0.12)] focus:border-transparent text-lg"
                >
                  <option value="1 day">1 day</option>
                  <option value="3 days">3 days</option>
                  <option value="1 week">1 week</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="1 month">1 month</option>
                  <option value="2 months">2 months</option>
                </select>
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
                  <Wallet size={24} className="mr-3 text-[var(--brand-4)]" />
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
                  <CreditCard size={24} className="mr-3 text-[var(--brand-4)]" />
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
                      className="mr-4 w-5 h-5 text-[var(--brand-4)] rounded focus:ring-[rgba(82,39,132,0.12)]"
                    />
                    <span className="text-lg font-medium">FAST DELIVERY</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-gray-900">$10</span>
                    {shouldShowIcpPricing && conversionRate && (
                      <div className="text-sm text-[var(--brand-4)]">
                        {(10 * conversionRate.usdToIcp).toFixed(4)} ICP
                      </div>
                    )}
                  </div>
                </label>
                
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={additionalServices.additionalRevision}
                      onChange={() => handleAdditionalServiceChange('additionalRevision')}
                      className="mr-4 w-5 h-5 text-[var(--brand-4)] rounded focus:ring-[rgba(82,39,132,0.12)]"
                    />
                    <span className="text-lg font-medium">ADDITIONAL REVISION</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-gray-900">$10</span>
                    {shouldShowIcpPricing && conversionRate && (
                      <div className="text-sm text-[var(--brand-4)]">
                        {(10 * conversionRate.usdToIcp).toFixed(4)} ICP
                      </div>
                    )}
                  </div>
                </label>
                
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={additionalServices.extraChanges}
                      onChange={() => handleAdditionalServiceChange('extraChanges')}
                      className="mr-4 w-5 h-5 text-[var(--brand-4)] rounded focus:ring-[rgba(82,39,132,0.12)]"
                    />
                    <span className="text-lg font-medium">EXTRA CHANGES</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-gray-900">$10</span>
                    {shouldShowIcpPricing && conversionRate && (
                      <div className="text-sm text-[var(--brand-4)]">
                        {(10 * conversionRate.usdToIcp).toFixed(4)} ICP
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            
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
            <div className="bg-brand-white rounded-xl shadow-lg p-6 sticky top-6">
              {/* ICP Pricing Indicator */}
              {shouldShowIcpPricing && conversionRate && (
                <div className="mb-4 p-3 bg-[rgba(240,90,36,0.06)] border border-[rgba(240,90,36,0.12)] rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-2">
                      <span className="text-white font-bold text-xs">ICP</span>
                    </div>
                    <div className="text-sm flex-1">
                      <span className="font-medium text-[var(--brand-4)]">ICP Pricing Active</span>
                      <div className="text-[rgba(82,39,132,0.9)] text-xs">
                        1 ICP = ${conversionRate.icpToUsd.toFixed(2)} USD
                      </div>
                    </div>
                    <button
                      onClick={loadIcpPrice}
                      className="p-1 hover:bg-blue-100 rounded transition-colors"
                      title="Refresh ICP price"
                    >
                      <RefreshCw size={14} className="text-[var(--brand-4)]" />
                    </button>
                  </div>
                </div>
              )}
              {/* Service Preview */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <FileText size={24} className="text-[var(--brand-4)]" />
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
                  <div className="text-right">
                    <span className="font-semibold">${basePrice}</span>
                    {shouldShowIcpPricing && conversionRate && (
                      <div className="text-sm text-[var(--brand-4)]">
                        {basePriceIcp.toFixed(4)} ICP
                      </div>
                    )}
                  </div>
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

         

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total</span>
                  <div className="text-right">
                    <span className="font-semibold">${basePrice + additionalCost}</span>
                    {shouldShowIcpPricing && conversionRate && (
                      <div className="text-sm text-[var(--brand-4)]">
                        {(basePriceIcp + additionalCostIcp).toFixed(4)} ICP
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taxes</span>
                  <div className="text-right">
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                    {shouldShowIcpPricing && conversionRate && (
                      <div className="text-sm text-blue-600">
                        {taxIcp.toFixed(4)} ICP
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Final Payable Amount</span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">${total.toFixed(2)}</span>
                      {shouldShowIcpPricing && conversionRate && (
                          <div className="text-lg font-bold text-[var(--brand-4)]">
                          {totalIcp.toFixed(4)} ICP
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleSubmit}
                disabled={isProcessing || (paymentMethod === 'wallet' && !walletConnected)}
                className="w-full mt-6 btn-brand py-4 px-6 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="text-center">
                    <div>Check Out (${total.toFixed(2)})</div>
                    {shouldShowIcpPricing && conversionRate && (
                      <div className="text-sm opacity-90">
                        {totalIcp.toFixed(4)} ICP
                      </div>
                    )}
                  </div>
                )}
              </button>
            </div>

            {/* Payment Protection */}
            {/* <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
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
            </div> */}

            
          </div>
        </div>
        )}
      </div>
    </div>
  );
}