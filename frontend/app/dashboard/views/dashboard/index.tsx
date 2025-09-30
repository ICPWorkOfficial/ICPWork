"use client";

import React, { useState, useEffect } from 'react';
import { StatCard, ProjectRow, OrdersDisplay } from '../components';
import { Keyboard, BarChart3, Calendar, TrendingUp, PlusCircle, FileText, Eye } from 'lucide-react';
import { freelancerService, FreelancerStats } from '@/lib/freelancer-service';
import { useRouter } from 'next/navigation';
import { useLocalStorageAuth } from '@/hooks/useLocalStorageAuth';
type DashboardViewProps = {
  onBrowseAll?: () => void;
};

const DashboardView: React.FC<DashboardViewProps> = ({ onBrowseAll }) => {
  const [stats, setStats] = useState<FreelancerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useLocalStorageAuth();
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await freelancerService.getStats();
        if (response.success) {
          setStats(response.stats);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    {
      title: 'Total Services',
      value: stats?.totalProfiles?.toString() || '0',
      subtitle: 'PUBLISHED',
      trend: '↑ +12.5%',
      icon: <Keyboard size={18} className="text-[#6F6F6F]" />
    },
    {
      title: 'Active Services',
      value: stats?.activeProfiles?.toString() || '0',
      subtitle: 'LIVE',
      trend: '↑ +12.5%',
      icon: <BarChart3 size={18} className="text-[#6F6F6F]" />
    },
    {
      title: 'Activation Rate',
      value: `${stats?.activationRate || '0'}%`,
      subtitle: 'SERVICES ACTIVE',
      trend: '↑ +12.5%',
      icon: <Calendar size={18} className="text-[#6F6F6F]" />
    },
    {
      title: 'Success Rate',
      value: '↑ 100%',
      subtitle: 'CLIENT SATISFACTION',
      trend: '↑ +12.5%',
      icon: <TrendingUp size={18} className="text-[#A8A8A8]" />
    }
  ];

  const projects = [
    {
      id: '1',
      title: 'Payment for DeFi Dashboard project',
      amount: '+1250 ICP',
      status: 'completed',
      date: 'Jan 15, 2024 16:00',
      from: 'client@example.com'
    },
    {
      id: '2',
      title: 'Payment for DeFi Dashboard project',
      amount: '+455 ICP',
      status: 'completed',
      date: 'Jan 15, 2024 16:00',
      from: 'client@example.com'
    },
    {
      id: '3',
      title: 'Payment for DeFi Dashboard project',
      amount: '+1335 ICP',
      status: 'completed',
      date: 'Jan 15, 2024 16:00',
      from: 'client@example.com'
    },
    {
      id: '4',
      title: 'Payment for DeFi Dashboard project',
      amount: '+1250 ICP',
      status: 'completed',
      date: 'Jan 15, 2024 16:00',
      from: 'client@example.com'
    }
  ];

  return (
    <div className="overflow-hidden flex flex-col h-full">
      <div className="mb-6 flex flex-col sm:flex-row items-start justify-between gap-4 flex-shrink-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl text-gray-800 font-bold truncate">Browse Projects</h1>
          <p className="text-sm sm:text-md text-gray-600 truncate">Join Exciting Hackathons and win prizes</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="bg-[rgba(104,255,102,0.14)] px-2 py-1 rounded-lg h-[28px] flex items-center justify-center shadow-sm">
          <span className="text-[11px] md:text-[12px] font-medium text-[#058700] capitalize truncate">Available</span>
        </div>
            <button onClick={() => router.push("/service/register")} className="text-sm font-semibold px-4 py-2 rounded-md cursor-pointer text-white flex items-center gap-2 whitespace-nowrap shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-105" style={{ background: 'linear-gradient(30deg, #44B0FF 0%, #973EEE 25%, #F12AE6 50%, #FF7039 75%, #F3BC3B 100%)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="truncate">New Service</span>
            </button>
        </div>
      </div>

      {/* Stats Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 items-stretch flex-shrink-0">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl border border-[#EDEDED] p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))
        ) : (
          statsCards.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Recent Orders */}
        <div className="col-span-2 overflow-hidden flex flex-col">
          <OrdersDisplay 
            userEmail={user?.email || ''} 
            userType="client"
            onViewAll={() => router.push('/orders')}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6 overflow-hidden flex flex-col">
          {/* Performance Card */}
          <div className="bg-white rounded-2xl border border-[#EAEAEA] p-5 overflow-hidden flex-shrink-0 shadow-sm transition-all duration-300 hover:shadow-md">
            <h3 className="text-lg sm:text-[20px] font-medium text-black tracking-[-0.4px] leading-[32px] mb-2 truncate">Performance</h3>
            <div className="space-y-6">
              <div className="space-y-[23px]">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-[#535353] leading-[22px] truncate">Category</span>
                  <span className="text-[14px] font-medium text-[#4C4C4C] leading-[22px] truncate">ICP Development</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-[#535353] leading-[22px] truncate">Timeline</span>
                  <span className="text-[14px] font-medium text-[#535353] leading-[22px] truncate">3–4 weeks</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-[#535353] leading-[22px] truncate">Level</span>
                  <span className="text-[14px] font-medium text-green-500 bg-clip-text leading-[22px] truncate">$75K - $100K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-[#535353] leading-[22px] truncate">Proposals</span>
                  <span className="text-[14px] font-medium text-[#535353] leading-[22px] truncate">5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-[#EDEDED] p-5 overflow-hidden flex-1 flex flex-col shadow-sm transition-all duration-300 hover:shadow-md">
            <h3 className="text-lg sm:text-[20px] font-medium text-black tracking-[-0.4px] leading-[32px] mb-6 truncate">Quick Actions</h3>
            <div className="space-y-4 flex-1">
              <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-all duration-200 hover:shadow-sm">
                <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center flex-shrink-0 bg-gray-50"><PlusCircle size={18} /></div>
                <span className="text-base sm:text-lg truncate">Create New Proposal</span>
              </button>

              <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-all duration-200 hover:shadow-sm">
                <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center flex-shrink-0 bg-gray-50"><FileText size={16} /></div>
                <span className="text-base sm:text-lg truncate">View Active Projects</span>
              </button>

              <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-all duration-200 hover:shadow-sm">
                <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center flex-shrink-0 bg-gray-50"><Eye size={16} /></div>
                <span className="text-base sm:text-lg truncate">Check Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
