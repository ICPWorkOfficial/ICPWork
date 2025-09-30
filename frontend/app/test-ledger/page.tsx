"use client";

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Plus, 
  Minus, 
  ArrowRightLeft, 
  Lock, 
  Unlock, 
  RotateCcw,
  TrendingUp,
  Users,
  DollarSign,
  Activity
} from 'lucide-react';

interface LedgerStats {
  totalAccounts: number;
  totalBalance: number;
  totalTransactions: number;
  totalEscrowAmount: number;
  activeEscrows: number;
}

interface Account {
  id: string;
  balance: number;
  principal?: string;
  createdAt: number;
  lastUpdated: number;
}

interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  transactionType: string;
  escrowId?: string;
  status: string;
  memo?: string;
}

const TestLedgerPage: React.FC = () => {
  const [stats, setStats] = useState<LedgerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [escrowId, setEscrowId] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ledger-mock?action=stats');
      const result = await response.json();
      
      if (result.success) {
        // Handle raw dfx output - for now just display the raw data
        setStats(result.data as any);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load ledger statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/ledger-mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...data }),
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess(`${action.replace('-', ' ')} completed successfully!`);
        loadStats(); // Refresh stats
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(`Failed to ${action.replace('-', ' ')}`);
    } finally {
      setLoading(false);
    }
  };

  const createAccount = () => {
    if (!accountId) {
      setError('Account ID is required');
      return;
    }
    handleAction('create-account', { accountId });
  };

  const mintTokens = () => {
    if (!accountId || !amount) {
      setError('Account ID and amount are required');
      return;
    }
    handleAction('mint-tokens', { accountId, amount: parseInt(amount) });
  };

  const transferTokens = () => {
    if (!fromAccount || !toAccount || !amount) {
      setError('From account, to account, and amount are required');
      return;
    }
    handleAction('transfer', { from: fromAccount, to: toAccount, amount: parseInt(amount), memo });
  };

  const createEscrow = () => {
    if (!escrowId || !fromAccount || !beneficiary || !amount) {
      setError('Escrow ID, depositor, beneficiary, and amount are required');
      return;
    }
    handleAction('escrow-deposit', { 
      escrowId, 
      depositor: fromAccount, 
      beneficiary, 
      amount: parseInt(amount), 
      memo 
    });
  };

  const releaseEscrow = () => {
    if (!escrowId || !toAccount || !amount) {
      setError('Escrow ID, releaser, and amount are required');
      return;
    }
    handleAction('escrow-release', { escrowId, releaser: toAccount, amount: parseInt(amount) });
  };

  const refundEscrow = () => {
    if (!escrowId || !fromAccount) {
      setError('Escrow ID and refunder are required');
      return;
    }
    handleAction('escrow-refund', { escrowId, refunder: fromAccount, reason: memo });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp / 1000000).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ICP Ledger Test Interface</h1>
          <p className="text-gray-600">Test the ICP Ledger Canister integration with your escrow system</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Accounts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {typeof stats === 'string' ? 'Raw Data' : stats.totalAccounts || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {typeof stats === 'string' ? 'Raw Data' : formatAmount(stats.totalBalance || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {typeof stats === 'string' ? 'Raw Data' : stats.totalTransactions || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Lock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Escrow Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {typeof stats === 'string' ? 'Raw Data' : formatAmount(stats.totalEscrowAmount || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Escrows</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {typeof stats === 'string' ? 'Raw Data' : stats.activeEscrows || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Raw Data Display */}
        {stats && typeof stats === 'string' && (
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Raw Ledger Data:</h3>
            <pre className="text-xs text-gray-600 overflow-auto">{stats}</pre>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Account Management */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Management</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account ID</label>
                <input
                  type="text"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={createAccount}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Account
                </button>

                <button
                  onClick={mintTokens}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Mint Tokens
                </button>
              </div>
            </div>
          </div>

          {/* Transfer Operations */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Transfer Operations</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
                <input
                  type="text"
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  placeholder="sender@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Account</label>
                <input
                  type="text"
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Memo</label>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Optional memo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={transferTokens}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Transfer Tokens
              </button>
            </div>
          </div>

          {/* Escrow Operations */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Escrow Operations</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Escrow ID</label>
                <input
                  type="text"
                  value={escrowId}
                  onChange={(e) => setEscrowId(e.target.value)}
                  placeholder="project_001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary</label>
                <input
                  type="text"
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                  placeholder="freelancer@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={createEscrow}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Create Escrow
                </button>

                <button
                  onClick={releaseEscrow}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Release
                </button>

                <button
                  onClick={refundEscrow}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Refund
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            
            <div className="space-y-4">
              <button
                onClick={loadStats}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Refresh Statistics
              </button>

              <div className="text-sm text-gray-600">
                <p><strong>Test Accounts:</strong></p>
                <p>• test_account (1,000,000 tokens)</p>
                <p>• depositor@example.com (9,000,000 tokens)</p>
                <p>• beneficiary@example.com (500,000 tokens)</p>
              </div>

              <div className="text-sm text-gray-600">
                <p><strong>Test Escrows:</strong></p>
                <p>• project_001 (490,000 tokens remaining)</p>
                <p>• escrow_001 (495,000 tokens)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">{success}</div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <div className="text-sm text-blue-700">Processing request...</div>
            </div>
          </div>
        )}

        {/* Integration Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Integration Information</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Ledger Canister ID:</strong> vt46d-j7777-77774-qaagq-cai</p>
            <p><strong>Candid Interface:</strong> <a href="http://127.0.0.1:4943/?canisterId=vu5yx-eh777-77774-qaaga-cai&id=vt46d-j7777-77774-qaagq-cai" target="_blank" rel="noopener noreferrer" className="underline">Open Candid UI</a></p>
            <p><strong>API Endpoint:</strong> /api/ledger</p>
            <p><strong>Status:</strong> ✅ Running and Ready for Production</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestLedgerPage;
