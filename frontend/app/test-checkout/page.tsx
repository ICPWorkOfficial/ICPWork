'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestCheckoutPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    // Check if booking data exists
    const storedData = localStorage.getItem('bookingData');
    if (storedData) {
      setBookingData(JSON.parse(storedData));
    }
  }, []);

  const setTestBookingData = () => {
    const testData = {
      serviceId: 't3chnobromo@gmail.com',
      serviceTitle: 'Test Service - dasdasd',
      selectedTier: 'Basic',
      price: '0',
      provider: 't3chnobromo@gmail.com'
    };
    
    localStorage.setItem('bookingData', JSON.stringify(testData));
    setBookingData(testData);
  };

  const clearBookingData = () => {
    localStorage.removeItem('bookingData');
    setBookingData(null);
  };

  const goToCheckout = () => {
    router.push('/client-dashboard/checkout');
  };

  const goToServiceDetail = () => {
    router.push('/client-dashboard/service/1758277026554');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Checkout Flow</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Step 1: Set Booking Data */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Step 1: Set Booking Data</h2>
            <button
              onClick={setTestBookingData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-4"
            >
              Set Test Booking Data
            </button>
            <button
              onClick={clearBookingData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 ml-2"
            >
              Clear Data
            </button>
            
            {bookingData && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 font-medium">✅ Booking data set successfully!</p>
                <pre className="text-sm text-gray-600 mt-2 overflow-auto">
                  {JSON.stringify(bookingData, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Step 2: Test Checkout */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Step 2: Test Checkout Page</h2>
            <button
              onClick={goToCheckout}
              disabled={!bookingData}
              className={`px-4 py-2 rounded-lg ${
                bookingData 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Go to Checkout
            </button>
            
            {!bookingData && (
              <p className="text-red-600 text-sm mt-2">
                ❌ No booking data found. Please set booking data first.
              </p>
            )}
          </div>

          {/* Step 3: Test Service Detail */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Step 3: Test Service Detail Page</h2>
            <button
              onClick={goToServiceDetail}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Go to Service Detail
            </button>
            <p className="text-sm text-gray-600 mt-2">
              This will test if the service detail page loads properly and shows the "Book Service" button.
            </p>
          </div>

          {/* Current Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Current Status</h2>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Booking Data:</span> 
                <span className={bookingData ? 'text-green-600' : 'text-red-600'}>
                  {bookingData ? ' ✅ Set' : ' ❌ Not Set'}
                </span>
              </p>
              <p className="text-sm">
                <span className="font-medium">Service Detail Page:</span> 
                <span className="text-yellow-600"> ⚠️ Needs Testing</span>
              </p>
              <p className="text-sm">
                <span className="font-medium">Checkout Page:</span> 
                <span className="text-yellow-600"> ⚠️ Needs Testing</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Test the Checkout Flow:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Click "Set Test Booking Data" to simulate a user selecting a service</li>
            <li>Click "Go to Checkout" to test the checkout page with the booking data</li>
            <li>Alternatively, click "Go to Service Detail" to test the service detail page and its "Book Service" button</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
