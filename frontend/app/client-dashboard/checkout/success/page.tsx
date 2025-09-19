"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, Home, MessageCircle, Shield, Clock } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [escrowId, setEscrowId] = useState<string | null>(null);

  useEffect(() => {
    // Get escrow ID from localStorage
    const storedEscrowId = localStorage.getItem('escrowId');
    if (storedEscrowId) {
      setEscrowId(storedEscrowId);
      // Clear the escrow ID from localStorage after displaying
      localStorage.removeItem('escrowId');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">
            Your project has been successfully booked. The service provider will contact you within 24 hours to discuss the project details.
          </p>
        </div>

        {escrowId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center mb-2">
              <Shield size={20} className="text-green-600 mr-2" />
              <h3 className="font-semibold text-green-900">Escrow Protected</h3>
            </div>
            <p className="text-sm text-green-800">
              Your payment is secured in escrow (ID: {escrowId}). Funds will be released to the freelancer only after project completion and your approval.
            </p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
          <ul className="text-sm text-blue-800 text-left space-y-1">
            <li>• Service provider will contact you within 24 hours</li>
            <li>• Discuss project requirements and timeline</li>
            <li>• Work begins after agreement on project scope</li>
            <li>• Track progress through your dashboard</li>
            <li>• Approve work completion to release payment</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <Clock size={20} className="text-yellow-600 mr-2" />
            <h3 className="font-semibold text-yellow-900">Platform Fee</h3>
          </div>
          <p className="text-sm text-yellow-800">
            A 10% platform fee has been deducted from the total amount. This fee supports platform maintenance and dispute resolution services.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/client-dashboard')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center"
          >
            <Home size={16} className="mr-2" />
            Back to Dashboard
          </button>
          
          <button
            onClick={() => router.push('/client-dashboard/messages')}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 flex items-center justify-center"
          >
            <MessageCircle size={16} className="mr-2" />
            View Messages
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team at support@icpwork.com
          </p>
        </div>
      </div>
    </div>
  );
}
