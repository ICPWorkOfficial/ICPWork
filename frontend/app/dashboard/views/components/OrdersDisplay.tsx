"use client";

import React, { useState, useEffect } from 'react';
import { Eye, Clock, CheckCircle, XCircle, AlertCircle, Package, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { walletManager } from '@/lib/wallet-connector';

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

interface OrdersDisplayProps {
  userEmail: string;
  userType?: 'client' | 'provider';
  onViewAll?: () => void;
}

const OrdersDisplay: React.FC<OrdersDisplayProps> = ({ userEmail, userType = 'client', onViewAll }) => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingOrder, setCompletingOrder] = useState<string | null>(null);
  const router = useRouter();
  console.log(userEmail,"shhsdahdhas")
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/orders?userEmail=${userEmail}&limit=5`);
        const result = await response.json();
        
        if (result.success) {
          setOrders(result.orders || []);
        } else {
          setError(result.error || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchOrders();
    }
  }, [userEmail, userType]);

  const handleQuickComplete = async (orderId: string, orderAmount: number) => {
    if (!walletManager.isConnected()) {
      alert('Please connect your wallet first to complete orders');
      return;
    }

    if (!confirm(`Are you sure you want to mark this order as complete? This will release the payment of ${formatAmount(orderAmount)} to the service provider.`)) {
      return;
    }

    try {
      setCompletingOrder(orderId);
      
      // Mark order as complete (simple status change)
      const response = await fetch(`/api/orders/${orderId}/mark-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedBy: 'Current User', // TODO: Get from auth
          completionNotes: 'Order completed via quick action'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh orders list
        fetchOrders();
        alert('Order marked as complete successfully!');
      } else {
        alert(result.error || 'Failed to complete order');
      }
      
    } catch (err: any) {
      console.error('Error completing order:', err);
      alert(`Failed to complete order: ${err.message}`);
    } finally {
      setCompletingOrder(null);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/orders?userEmail=${encodeURIComponent(userEmail)}&userType=${userType}&limit=5`);
      const result = await response.json();
      
      if (result.success) {
        setOrders(result.orders || []);
      } else {
        setError(result.error || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };
  console.log(orders,userEmail,"orders");
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'in_progress':
        return <Clock size={16} className="text-blue-500" />;
      case 'pending':
        return <AlertCircle size={16} className="text-yellow-500" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-500" />;
      case 'disputed':
        return <AlertCircle size={16} className="text-orange-500" />;
      default:
        return <Package size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      case 'disputed':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
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
      <div className="bg-white rounded-xl border border-[#EDEDED] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[22px] md:text-[24px] font-semibold text-gray-800">Recent Orders</h2>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-[#EDEDED] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[22px] md:text-[24px] font-semibold text-gray-800">Recent Orders</h2>
        </div>
        <div className="text-center py-8">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Error loading orders</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#EDEDED] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[22px] md:text-[24px] font-semibold text-gray-800">Recent Orders</h2>
        {onViewAll && (
          <button 
            onClick={onViewAll} 
            className="flex items-center gap-2 text-[12px] md:text-[13px] font-medium uppercase tracking-[0.4px] text-black bg-transparent rounded-full px-3 py-2 hover:bg-gray-100 transition-colors"
          >
            <Eye size={14} />
            View All
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <Package size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No orders found</p>
          <p className="text-gray-500 text-sm">
            {userType === 'client' 
              ? "You haven't placed any orders yet." 
              : "You don't have any orders yet."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => router.push(`/orders/${order.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[16px] font-medium text-gray-800 truncate">
                      {order.projectName || order.serviceTitle}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {userType === 'client' 
                      ? `Service Provider: ${order.serviceProvider}`
                      : `Client: ${order.clientName || order.clientEmail}`
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    Order #{order.orderNumber} • {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[16px] font-semibold text-gray-800">
                    {formatAmount(order.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.selectedTier} Tier
                  </p>
                </div>
              </div>
              
              {order.projectDescription && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {order.projectDescription}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Timeline: {order.timeline}</span>
                <span>Payment: {order.paymentMethod}</span>
              </div>
              
              {/* Quick Actions */}
              {order.status === 'pending' || order.status === 'in_progress' ? (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Quick Actions</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickComplete(order.id, order.totalAmount);
                      }}
                      disabled={completingOrder === order.id}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {completingOrder === order.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                      ) : (
                        <Zap size={12} />
                      )}
                      {completingOrder === order.id ? 'Completing...' : 'Complete'}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersDisplay;
