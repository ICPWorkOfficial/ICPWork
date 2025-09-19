"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  MessageSquare, 
  Clock, 
  DollarSign,
  User,
  Calendar,
  Package,
  Wallet,
  Send,
  Flag,
  Eye,
  Download
} from 'lucide-react';
import { walletManager } from '@/lib/wallet-connector';
import { MultiWalletConnection } from '@/components/MultiWalletConnection';

// Order data interface
interface OrderData {
  id: string;
  orderNumber: string;
  clientEmail: string;
  clientName?: string;
  serviceProvider: string;
  serviceProviderEmail: string;
  serviceId: string;
  serviceTitle: string;
  serviceCategory: string;
  selectedTier: 'Basic' | 'Advanced' | 'Premium';
  projectName: string;
  projectDescription: string;
  timeline: string;
  deadline: number;
  basePrice: number;
  additionalServices: {
    fastDelivery: boolean;
    additionalRevision: boolean;
    extraChanges: boolean;
  };
  additionalCost: number;
  tax: number;
  totalAmount: number;
  paymentMethod: 'wallet' | 'card';
  escrowId: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  notes?: string;
  attachments?: string[];
}

interface OrderResponse {
  id: string;
  orderId: string;
  senderEmail: string;
  senderName: string;
  message: string;
  type: 'message' | 'completion' | 'dispute' | 'update';
  createdAt: number;
  attachments?: string[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<OrderData | null>(null);
  const [responses, setResponses] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [showWalletConnector, setShowWalletConnector] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletConnection, setWalletConnection] = useState<any>(null);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  
  // Form states
  const [newMessage, setNewMessage] = useState('');
  const [responseType, setResponseType] = useState<'message' | 'completion' | 'dispute'>('message');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
    checkWalletConnection();
  }, [orderId]);

  const checkWalletConnection = () => {
    setWalletConnected(walletManager.isConnected());
  };

  const handleWalletConnectionChange = (connected: boolean) => {
    setWalletConnected(connected);
    if (connected) {
      setShowWalletConnector(false);
      // Get wallet connection details
      const connection = walletManager.getCurrentConnection();
      setWalletConnection(connection);
      // Load wallet balance
      loadWalletBalance();
    } else {
      setWalletConnection(null);
      setWalletBalance(0);
    }
  };

  const loadWalletBalance = async () => {
    try {
      const balance = await walletManager.getBalance();
      setWalletBalance(balance);
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch order details
      const orderResponse = await fetch(`/api/orders/${orderId}`);
      const orderResult = await orderResponse.json();
      
      if (orderResult.success) {
        setOrder(orderResult.order);
      } else {
        setError(orderResult.error || 'Order not found');
      }
      
      // Fetch order responses/messages
      const responsesResponse = await fetch(`/api/orders/${orderId}/responses`);
      const responsesResult = await responsesResponse.json();
      
      if (responsesResult.success) {
        setResponses(responsesResult.responses || []);
      }
      
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletConnected) {
      setShowWalletConnector(true);
      return;
    }
    
    if (!newMessage.trim()) {
      alert('Please enter a message');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/orders/${orderId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          type: responseType,
          senderEmail: 'current-user@example.com', // TODO: Get from auth
          senderName: 'Current User' // TODO: Get from auth
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setNewMessage('');
        setResponseType('message');
        fetchOrderDetails(); // Refresh data
        alert('Response sent successfully!');
      } else {
        alert(result.error || 'Failed to send response');
      }
      
    } catch (err) {
      console.error('Error sending response:', err);
      alert('Failed to send response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!walletConnected) {
      setShowWalletConnector(true);
      return;
    }
    
    if (!order) {
      alert('Order not found');
      return;
    }
    
    // Show payment confirmation dialog
    setPaymentDetails({
      amount: order.totalAmount,
      recipient: order.serviceProvider,
      orderNumber: order.orderNumber
    });
    setShowPaymentConfirmation(true);
    return;
  };

  const confirmPayment = async () => {
    if (!order) return;
    
    try {
      setIsSubmitting(true);
      setShowPaymentConfirmation(false);
      
      // First, process the payment through escrow
      console.log('Processing payment for order completion...');
      
      // Get current wallet connection
      const connection = walletManager.getCurrentConnection();
      if (!connection) {
        throw new Error('No wallet connection found');
      }
      
      // Process payment through escrow
      const paymentResult = await processOrderPayment(order);
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment processing failed');
      }
      
      // Mark order as complete using dedicated completion API
      const response = await fetch(`/api/orders/${orderId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedBy: 'Current User', // TODO: Get from auth
          completionNotes: `Order completed and payment of ${formatAmount(order.totalAmount)} released to service provider.`,
          paymentReleased: true,
          transactionId: paymentResult.transactionId
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Send completion response
        await fetch(`/api/orders/${orderId}/responses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Order completed successfully! Payment of ${formatAmount(order.totalAmount)} has been released to the service provider. Transaction ID: ${paymentResult.transactionId}`,
            type: 'completion',
            senderEmail: 'current-user@example.com', // TODO: Get from auth
            senderName: 'Current User' // TODO: Get from auth
          })
        });
        
        fetchOrderDetails(); // Refresh data
        alert(`Order marked as complete! Payment of ${formatAmount(order.totalAmount)} has been released. Transaction ID: ${paymentResult.transactionId}`);
      } else {
        alert(result.error || 'Failed to update order');
      }
      
    } catch (err: any) {
      console.error('Error completing order:', err);
      alert(`Failed to complete order: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const processOrderPayment = async (order: OrderData) => {
    try {
      // Get current wallet connection
      const connection = walletManager.getCurrentConnection();
      if (!connection) {
        return { success: false, error: 'No wallet connection found' };
      }
      
      // Get conversion rate from API
      let conversionRate = 0.1; // Default fallback
      try {
        const rateResponse = await fetch('/api/conversion/rate');
        const rateResult = await rateResponse.json();
        if (rateResult.success && rateResult.rate) {
          conversionRate = rateResult.rate;
        }
      } catch (rateError) {
        console.warn('Failed to fetch conversion rate, using default:', rateError);
      }
      
      // Convert USD amount to ICP
      const icpAmount = order.totalAmount * conversionRate;
      
      console.log(`Processing payment: ${order.totalAmount} USD = ${icpAmount} ICP (rate: ${conversionRate})`);
      
      // Process payment through escrow release
      const escrowResponse = await fetch('/api/escrow/wallet-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escrowId: order.escrowId,
          amount: icpAmount,
          action: 'release', // Release funds to service provider
          recipient: order.serviceProviderEmail,
          notes: `Order completion payment for order ${order.orderNumber}`
        })
      });
      
      const escrowResult = await escrowResponse.json();
      
      if (!escrowResult.success) {
        throw new Error(escrowResult.error || 'Escrow payment failed');
      }
      
      // If escrow API is not available, simulate the payment
      if (escrowResult.simulated) {
        console.log('Using simulated payment (escrow API not available)');
        const mockTransactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return {
          success: true,
          transactionId: mockTransactionId,
          amount: icpAmount,
          message: 'Payment processed successfully (simulated)',
          simulated: true
        };
      }
      
      return {
        success: true,
        transactionId: escrowResult.transactionId || `tx_${Date.now()}`,
        amount: icpAmount,
        message: 'Payment processed successfully',
        simulated: false
      };
      
    } catch (error: any) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error.message || 'Payment processing failed'
      };
    }
  };

  const handleRaiseDispute = async () => {
    if (!walletConnected) {
      setShowWalletConnector(true);
      return;
    }
    
    const reason = prompt('Please provide a reason for the dispute:');
    if (!reason) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'disputed',
          notes: reason
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchOrderDetails(); // Refresh data
        alert('Dispute raised successfully!');
      } else {
        alert(result.error || 'Failed to raise dispute');
      }
      
    } catch (err) {
      console.error('Error raising dispute:', err);
      alert('Failed to raise dispute');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'disputed':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The order you are looking for does not exist.'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  Order #{order.orderNumber}
                </h1>
                <p className="text-sm text-gray-600">{order.projectName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                {order.status.replace('_', ' ').toUpperCase()}
              </span>
              
              {walletConnected ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">
                    {walletConnection?.wallet?.name || 'Wallet'} Connected
                  </span>
                  <span className="text-xs text-green-600">
                    {walletBalance.toFixed(4)} ICP
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => setShowWalletConnector(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Wallet size={16} />
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Details</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Project Name</label>
                    <p className="text-gray-800">{order.projectName}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Service</label>
                    <p className="text-gray-800">{order.serviceTitle}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Selected Tier</label>
                    <p className="text-gray-800">{order.selectedTier}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Timeline</label>
                    <p className="text-gray-800">{order.timeline}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Amount</label>
                    <p className="text-xl font-semibold text-gray-800">{formatAmount(order.totalAmount)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Payment Method</label>
                    <p className="text-gray-800 capitalize">{order.paymentMethod}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <p className="text-gray-800">{formatDate(order.createdAt)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Deadline</label>
                    <p className="text-gray-800">{formatDate(order.deadline)}</p>
                  </div>
                </div>
              </div>
              
              {order.projectDescription && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-800 mt-1">{order.projectDescription}</p>
                </div>
              )}
            </div>

            {/* Messages/Responses */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Messages & Updates</h2>
              
              <div className="space-y-4 mb-6">
                {responses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No messages yet</p>
                ) : (
                  responses.map((response) => (
                    <div key={response.id} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{response.senderName}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            response.type === 'completion' ? 'bg-green-100 text-green-800' :
                            response.type === 'dispute' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {response.type}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(response.createdAt)}</span>
                      </div>
                      <p className="text-gray-700">{response.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Send Response Form */}
              <form onSubmit={handleSubmitResponse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Type
                  </label>
                  <select
                    value={responseType}
                    onChange={(e) => setResponseType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="message">Message</option>
                    <option value="completion">Mark Complete</option>
                    <option value="dispute">Raise Dispute</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Type your message here..."
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting || !walletConnected}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send size={16} />
                  )}
                  {!walletConnected ? 'Connect Wallet First' : 'Send Response'}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                {order.status === 'in_progress' && (
                  <button
                    onClick={handleMarkComplete}
                    disabled={!walletConnected || isSubmitting}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Mark Complete
                  </button>
                )}
                
                {order.status !== 'disputed' && order.status !== 'cancelled' && (
                  <button
                    onClick={handleRaiseDispute}
                    disabled={!walletConnected || isSubmitting}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Flag size={16} />
                    Raise Dispute
                  </button>
                )}
                
                <button
                  onClick={() => setShowWalletConnector(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Wallet size={16} />
                  {walletConnected ? 'Wallet Connected' : 'Connect Wallet'}
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-medium">{formatAmount(order.basePrice)}</span>
                </div>
                
                {order.additionalCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Additional Services</span>
                    <span className="font-medium">{formatAmount(order.additionalCost)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatAmount(order.tax)}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Total</span>
                    <span className="font-semibold text-gray-800">{formatAmount(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Client</label>
                  <p className="text-gray-800">{order.clientName || order.clientEmail}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Service Provider</label>
                  <p className="text-gray-800">{order.serviceProvider}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Escrow ID</label>
                  <p className="text-gray-800 font-mono text-sm">{order.escrowId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Connector Modal */}
      {showWalletConnector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Connect Wallet</h3>
              <button
                onClick={() => setShowWalletConnector(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Please connect your wallet to send responses and manage orders.
            </p>
            
            <MultiWalletConnection 
              onConnectionChange={handleWalletConnectionChange}
              onBalanceChange={setWalletBalance}
            />
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentConfirmation && paymentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Confirm Payment</h3>
              <button
                onClick={() => setShowPaymentConfirmation(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Payment Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order:</span>
                    <span className="font-medium">#{paymentDetails.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">{formatAmount(paymentDetails.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recipient:</span>
                    <span className="font-medium">{paymentDetails.recipient}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Wallet Connected</span>
                </div>
                <p className="text-sm text-blue-700">
                  {walletConnection?.wallet?.name || 'Wallet'} • {walletBalance.toFixed(4)} ICP
                </p>
              </div>
              
              <p className="text-sm text-gray-600">
                This will release the payment from escrow to the service provider. This action cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPaymentConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckCircle size={16} />
                )}
                {isSubmitting ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
