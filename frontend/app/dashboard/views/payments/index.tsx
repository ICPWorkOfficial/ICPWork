"use client";

import React from 'react';
import { StatCard, ProjectRow } from '../components';
import { Keyboard, BarChart3, Calendar, TrendingUp, PlusCircle, FileText, Eye } from 'lucide-react';

type DashboardViewProps = {
  onBrowseAll?: () => void;
};

const DashboardView: React.FC<DashboardViewProps> = ({ onBrowseAll }) => {
  const stats = [
    {
      title: 'Total Earning',
      value: '$10,420.00',
      subtitle: 'USD EQUIVALENT',
      trend: '↑ +3.2%',
      icon: <Keyboard size={18} className="text-[#6F6F6F]" />
    },
    {
      title: 'ICP balance',
      value: '$320.00',
      subtitle: 'FEES',
      trend: '↓ -1.2%',
      icon: <BarChart3 size={18} className="text-[#6F6F6F]" />
    },
    {
      title: 'CkBTC Balance',
      value: '0.50 ckBTC',
      subtitle: 'AWAITING SETTLEMENT',
      trend: '↑ +8.1%',
      icon: <Calendar size={18} className="text-[#6F6F6F]" />
    }
  ];

  const projects = [
    {
      id: '1',
      title: 'Refund to Client - Escrow dispute',
      amount: '-320 ICP',
      status: 'refunded',
      date: 'Sep 01, 2025 10:12',
      from: 'clientA@example.com'
    },
    {
      id: '2',
      title: 'Partial payment for Integration work',
      amount: '+455 ICP',
      status: 'pending',
      date: 'Aug 26, 2025 14:32',
      from: 'clientB@example.com'
    },
    {
      id: '3',
      title: 'Chargeback - Failed milestone',
      amount: '-125 ICP',
      status: 'disputed',
      date: 'Aug 20, 2025 09:03',
      from: 'clientC@example.com'
    }
  ];

  return (
    <>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl text-gray-800 font-bold">Payments & Wallets</h1>
          <p className="text-md text-gray-600">Manage your earnings and transactions on ICP</p>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
           <button className="flex items-center gap-2 px-4 py-2 gap-2 cursor-pointer bg-gray-100 h-[28px]" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 17V7M12 7L8 11M12 7L16 11" stroke="#058700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="4" y="19" width="16" height="2" rx="1" fill="#058700" />
          </svg>
          <span className="text-[11px] md:text-[12px] font-medium text-gray-700 capitalize">Export</span>
        </button>
            <button className="text-sm font-semibold px-4 py-2 rounded-md text-white cursor-pointer flex items-center gap-2" style={{ background: 'linear-gradient(30deg, #44B0FF 0%, #973EEE 25%, #F12AE6 50%, #FF7039 75%, #F3BC3B 100%)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Add Funds
            </button>
        </div>
      </div>

      {/* Stats Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 items-stretch">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      <div>
            {/* Recent Activity (tabs shown above the list) */}
            <div className="bg-white rounded-xl border border-[#EDEDED] p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button className="px-3 py-2 rounded-md bg-[#F3F4F6] text-sm font-medium">Overview</button>
                  <button className="px-3 py-2 rounded-md text-sm font-medium">Transactions</button>
                  <button className="px-3 py-2 rounded-md text-sm font-medium">Escrow</button>
                  <button className="px-3 py-2 rounded-md text-sm font-medium">Settings</button>
                </div>
                <div className="text-sm text-gray-500">Showing recent activity</div>
              </div>

              <h2 className="text-[20px] font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {projects.map((project) => (
                  <ProjectRow key={project.id} project={project} />
                ))}
              </div>

              <div className="mt-6 text-sm text-gray-600">No further actions required. For disputed items, visit Escrow tab to review and resolve.</div>
            </div>

            {/* Summary cards (moved below activity) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-[#EDEDED]">
                <div className="text-sm text-gray-600">This Month</div>
                <div className="text-xl font-semibold mt-2">$8,420.00</div>
                <div className="text-sm text-gray-500 mt-1">Net revenue for current month</div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-[#EDEDED]">
                <div className="text-sm text-gray-600">ICP Platform Fees</div>
                <div className="text-xl font-semibold mt-2">$320.00</div>
                <div className="text-sm text-gray-500 mt-1">Fees collected on platform</div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-[#EDEDED]">
                <div className="text-sm text-gray-600">Pending</div>
                <div className="text-xl font-semibold mt-2">$1,200.50</div>
                <div className="text-sm text-gray-500 mt-1">Awaiting settlement</div>
              </div>
            </div>
          </div>
    </>
  );
};

export default DashboardView;
