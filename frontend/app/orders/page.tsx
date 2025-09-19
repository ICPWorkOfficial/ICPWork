"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Clock, 
  User, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  MessageCircle,
  FileText,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

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

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
  confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Confirmed' },
  in_progress: { color: 'bg-purple-100 text-purple-800', icon: RefreshCw, label: 'In Progress' },
  completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
  cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
  disputed: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'Disputed' }
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // TODO: Get user email from session/auth
      const userEmail = 'client@example.com';
      
      const response = await fetch(`/api/orders?userEmail=${userEmail}&userType=client`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
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
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            </div>
            <button
              onClick={fetchOrders}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh orders"
            >
              <RefreshCw size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package size={64} className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <button
              onClick={() => router.push('/client-dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Services
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.projectName}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon size={12} className="mr-1" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{order.serviceTitle}</p>
                      <p className="text-sm text-gray-500">
                        Order #{order.orderNumber} • {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.selectedTier} Tier
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Provider: {order.serviceProvider}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Deadline: {formatDate(order.deadline)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Payment: {order.paymentMethod === 'wallet' ? 'ICP Wallet' : 'Card'}
                      </span>
                    </div>
                  </div>

                  {order.additionalServices && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Services:</h4>
                      <div className="flex flex-wrap gap-2">
                        {order.additionalServices.fastDelivery && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            Fast Delivery
                          </span>
                        )}
                        {order.additionalServices.additionalRevision && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Additional Revision
                          </span>
                        )}
                        {order.additionalServices.extraChanges && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                            Extra Changes
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <FileText size={16} />
                        <span className="text-sm font-medium">View Details</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 transition-colors">
                        <MessageCircle size={16} />
                        <span className="text-sm font-medium">Contact Provider</span>
                      </button>
                    </div>
                    {order.status === 'pending' && (
                      <button className="px-4 py-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors">
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle size={20} className="text-gray-600" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Order Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Order Number:</span>
                      <p className="font-medium">{selectedOrder.orderNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <p className="font-medium">{getStatusConfig(selectedOrder.status).label}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Deadline:</span>
                      <p className="font-medium">{formatDate(selectedOrder.deadline)}</p>
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Project Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Project Name:</span>
                      <p className="font-medium">{selectedOrder.projectName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Service:</span>
                      <p className="font-medium">{selectedOrder.serviceTitle}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tier:</span>
                      <p className="font-medium">{selectedOrder.selectedTier}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Description:</span>
                      <p className="font-medium">{selectedOrder.projectDescription}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Base Price:</span>
                      <span className="font-medium">{formatCurrency(selectedOrder.basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Additional Services:</span>
                      <span className="font-medium">{formatCurrency(selectedOrder.additionalCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tax:</span>
                      <span className="font-medium">{formatCurrency(selectedOrder.tax)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-900 font-medium">Total:</span>
                      <span className="font-bold text-lg">{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment Method:</span>
                      <span className="font-medium">
                        {selectedOrder.paymentMethod === 'wallet' ? 'ICP Wallet' : 'Payment Card'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Escrow ID:</span>
                      <span className="font-medium font-mono text-xs">{selectedOrder.escrowId}</span>
                    </div>
                  </div>
                </div>

                {/* Provider Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Service Provider</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <p className="font-medium">{selectedOrder.serviceProvider}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium">{selectedOrder.serviceProviderEmail}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
