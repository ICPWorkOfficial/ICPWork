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
      title: 'Total Earnings',
      value: '$17,500.90',
      subtitle: 'USD EQUIVALENT',
      trend: '↑ +12.5%',
      icon: <Keyboard size={18} className="text-[#6F6F6F]" />
    },
    {
      title: 'Active Projects',
      value: '5',
      subtitle: 'IN PROGRESS',
      trend: '↑ +12.5%',
      icon: <BarChart3 size={18} className="text-[#6F6F6F]" />
    },
    {
      title: 'Completed',
      value: '98.5%',
      subtitle: 'PROJECTS FINISHED',
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
    <>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl text-gray-800 font-bold">Browse Projects</h1>
          <p className="text-md text-gray-600">Join Exciting Hackathons and win prizes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[rgba(104,255,102,0.14)] px-2 py-1 rounded-lg h-[28px] flex items-center justify-center">
          <span className="text-[11px] md:text-[12px] font-medium text-[#058700] capitalize">Available</span>
        </div>
            <button className="text-sm font-semibold px-4 py-2 rounded-md text-white flex items-center gap-2" style={{ background: 'linear-gradient(30deg, #44B0FF 0%, #973EEE 25%, #F12AE6 50%, #FF7039 75%, #F3BC3B 100%)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              New Project
            </button>
        </div>
      </div>

      {/* Stats Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 items-stretch">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl border border-[#EDEDED] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[22px] md:text-[24px] font-semibold text-gray-800">Recent Projects</h2>
                  <button onClick={() => onBrowseAll?.()} className="flex items-center gap-2 text-[12px] md:text-[13px] font-medium uppercase tracking-[0.4px] text-black bg-transparent rounded-full px-3 py-2 hover:bg-gray-100 transition-colors">
                    <Eye size={14} />
                    Browse All
                  </button>
                </div>

            <div className="space-y-4">
              {projects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Performance Card */}
          <div className="bg-white rounded-2xl border border-[#EAEAEA] p-5">
            <h3 className="text-[20px] font-medium text-black tracking-[-0.4px] leading-[32px] mb-2">Performance</h3>
            <div className="space-y-6">
              <div className="space-y-[23px]">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-[#535353] leading-[22px]">Category</span>
                  <span className="text-[14px] font-medium text-[#4C4C4C] leading-[22px]">ICP Development</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-[#535353] leading-[22px]">Timeline</span>
                  <span className="text-[14px] font-medium text-[#535353] leading-[22px]">3–4 weeks</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-[#535353] leading-[22px]">Level</span>
                  <span className="text-[14px] font-medium text-green-500 bg-clip-text leading-[22px]">$75K - $100K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-[#535353] leading-[22px]">Proposals</span>
                  <span className="text-[14px] font-medium text-[#535353] leading-[22px]">5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-[#EDEDED] p-5">
            <h3 className="text-[20px] font-medium text-black tracking-[-0.4px] leading-[32px] mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-all">
                <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center"><PlusCircle size={18} /></div>
                <span className="text-lg">Create New Proposal</span>
              </button>

              <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-all">
                <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center"><FileText size={16} /></div>
                <span className="text-lg">View Active Projects</span>
              </button>

              <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-all">
                <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center"><Eye size={16} /></div>
                <span className="text-lg">Check Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardView;
