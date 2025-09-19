'use client';

import { useLocalStorageAuth } from '@/hooks/useLocalStorageAuth';
import { useAuth } from '@/context/AuthContext';
import React from 'react';

const TestLocalStoragePage: React.FC = () => {
  const { user: localStorageUser, isLoading: localStorageLoading, isAuthenticated: localStorageAuth } = useLocalStorageAuth();
  const { user: serverUser, isLoading: serverLoading, isAuthenticated: serverAuth } = useAuth();

  if (localStorageLoading || serverLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">LocalStorage Authentication Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LocalStorage Auth */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-green-600">LocalStorage Auth</h2>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {localStorageLoading ? 'Yes' : 'No'}</p>
              <p><strong>Authenticated:</strong> {localStorageAuth ? 'Yes' : 'No'}</p>
              <p><strong>User:</strong></p>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {JSON.stringify(localStorageUser, null, 2)}
              </pre>
            </div>
          </div>

          {/* Server Auth */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Server Auth</h2>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {serverLoading ? 'Yes' : 'No'}</p>
              <p><strong>Authenticated:</strong> {serverAuth ? 'Yes' : 'No'}</p>
              <p><strong>User:</strong></p>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {JSON.stringify(serverUser, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* LocalStorage Raw Data */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Raw LocalStorage Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {typeof window !== 'undefined' ? localStorage.getItem('ICP_USER') || 'No data found' : 'Server-side rendering'}
          </pre>
        </div>

        {/* Actions */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-x-4">
            <button
              onClick={() => {
                const testUser = {
                  email: 'test@example.com',
                  userType: 'freelancer',
                  sessionId: 'test_session_123'
                };
                localStorage.setItem('ICP_USER', JSON.stringify(testUser));
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Set Test User in LocalStorage
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('ICP_USER');
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear LocalStorage
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestLocalStoragePage;
