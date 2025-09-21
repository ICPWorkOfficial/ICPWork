"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, Home, MessageCircle, Shield, Clock, Package } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [escrowId, setEscrowId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    // Get order details from localStorage
    const storedEscrowId = localStorage.getItem('escrowId');
    const storedOrderId = localStorage.getItem('orderId');
    const storedOrderNumber = localStorage.getItem('orderNumber');
    
    if (storedEscrowId) {
      setEscrowId(storedEscrowId);
    }
    if (storedOrderId) {
      setOrderId(storedOrderId);
    }
    if (storedOrderNumber) {
      setOrderNumber(storedOrderNumber);
    }
    
    // Clear the data from localStorage after displaying
    localStorage.removeItem('escrowId');
    localStorage.removeItem('orderId');
    localStorage.removeItem('orderNumber');
  }, []);

  return (
    <div className="min-h-screen bg-brand-muted flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-brand-white rounded-lg shadow-lg p-6 sm:p-10 text-center">
        <div className="mb-6">
          <CheckCircle size={64} className="text-[var(--brand-1)] mx-auto mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--brand-4)] mb-2">Payment Successful!</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Your project has been successfully booked. The service provider will contact you within 24 hours to discuss the project details.
          </p>
        </div>

        {(escrowId || orderNumber) && (
          <div className="bg-[rgba(82,39,132,0.04)] border border-[rgba(82,39,132,0.06)] rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center mb-2">
              <Shield size={20} className="text-[var(--brand-4)] mr-2" />
              <h3 className="font-semibold text-[var(--brand-4)]">Order Confirmed</h3>
            </div>
            {orderNumber && (
              <p className="text-sm text-[var(--brand-4)] mb-2">
                <strong>Order Number:</strong> {orderNumber}
              </p>
            )}
            {escrowId && (
              <p className="text-sm text-[var(--brand-4)]">
                Your payment is secured in escrow (ID: {escrowId}). Funds will be released to the freelancer only after project completion and your approval.
              </p>
            )}
          </div>
        )}

        <div className="bg-[rgba(240,90,36,0.06)] border border-[rgba(240,90,36,0.12)] rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-[var(--brand-4)] mb-2">What's Next?</h3>
          <ul className="text-sm text-[rgba(82,39,132,0.85)] space-y-1">
            <li>• Service provider will contact you within 24 hours</li>
            <li>• Discuss project requirements and timeline</li>
            <li>• Work begins after agreement on project scope</li>
            <li>• Track progress through your dashboard</li>
            <li>• Approve work completion to release payment</li>
          </ul>
        </div>

        <div className="bg-[rgba(250,175,59,0.06)] border border-[rgba(250,175,59,0.12)] rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <Clock size={20} className="text-[var(--brand-2)] mr-2" />
            <h3 className="font-semibold text-[var(--brand-2)]">Platform Fee</h3>
          </div>
          <p className="text-sm text-[rgba(250,175,59,0.9)]">
            A 10% platform fee has been deducted from the total amount. This fee supports platform maintenance and dispute resolution services.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/orders')}
            className="w-full btn-brand py-3 rounded-lg font-medium flex items-center justify-center"
          >
            <Package size={16} className="mr-2 text-white" />
            View My Orders
          </button>
          
          <button
            onClick={() => router.push('/client-dashboard')}
            className="w-full bg-[rgba(82,39,132,0.04)] text-[var(--brand-4)] py-3 px-4 rounded-lg font-medium hover:bg-[rgba(82,39,132,0.06)] flex items-center justify-center"
          >
            <Home size={16} className="mr-2 text-[var(--brand-4)]" />
            Back to Dashboard
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-[rgba(82,39,132,0.06)]">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team at support@icpwork.com
          </p>
        </div>
      </div>
    </div>
  );
}
