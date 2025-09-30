'use client';

import React from 'react';
import { Keyboard, BarChart3, Calendar, TrendingUp, ArrowDownLeft } from 'lucide-react';

export interface StatCardType { title: string; value: string; subtitle: string; trend: string; icon: React.ReactNode }

export const StatCard: React.FC<{ stat: StatCardType }> = ({ stat }) => (
  <div className="bg-white rounded-xl shadow-[4px_4px_16px_2px_rgba(0,0,0,0.08)] p-5 flex flex-col justify-between h-[116px] w-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
    <div className="flex items-start justify-between">
      <span className="text-[14px] font-medium text-[#525252] capitalize truncate">{stat.title}</span>
      <span className="text-[12px] font-semibold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full flex-shrink-0">{stat.trend}</span>
    </div>

    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-[40px] h-[40px] bg-[#F8F8F8] rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
          {stat.icon}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[20px] font-bold text-[#16192C] truncate">{stat.value}</span>
          <span className="text-[10px] font-medium uppercase text-[#525252] truncate">{stat.subtitle}</span>
        </div>
      </div>
    </div>
  </div>
);

const getStatusString = (status: any): string => {
  if (typeof status === 'object' && status !== null) {
    if (status.Open !== undefined) return 'Open';
    if (status.InProgress !== undefined) return 'InProgress';
    if (status.Completed !== undefined) return 'Completed';
    if (status.Cancelled !== undefined) return 'Cancelled';
  }
  return String(status || '');
};

// Export OrdersDisplay component
export { default as OrdersDisplay } from './components/OrdersDisplay';

export const ProjectRow: React.FC<{ project: { id: string; title: string; amount: string; status: string; date: string; from: string } }> = ({ project }) => {
  const isNegative = project.amount.trim().startsWith('-');
  const amountColor = isNegative ? '#D12A2A' : '#058700';
  const statusStr = getStatusString(project.status);
  const statusColor = statusStr === 'completed' ? '#058700' : statusStr === 'pending' ? '#F59E0B' : '#D12A2A';

  return (
    <div className="bg-[#FDFDFD] border border-[#F9F9F9] rounded-xl py-3 px-4 flex items-center justify-between gap-4 md:gap-6 transition-all duration-200 hover:shadow-sm hover:border-gray-200">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="h-10 w-10 md:w-14 md:h-14 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: isNegative ? 'rgba(209,42,42,0.08)' : '#1BB152' }}>
          <ArrowDownLeft size={16} className={`text-black ${isNegative ? 'rotate-90' : 'rotate-[270deg]'}`} />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-[16px] md:text-[18px] sm:font-semibold text-black truncate">{project.title}</h4>
          <p className="text-[12px] md:text-[13px] text-gray-600 truncate">From: {project.from}</p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[14px] md:text-[16px] font-bold truncate" style={{ color: amountColor }}>{project.amount}</span>
          <div className="px-2 py-1 rounded-lg h-[28px] flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: isNegative ? 'rgba(209,42,42,0.12)' : 'rgba(104,255,102,0.14)' }}>
            <span className="text-[11px] md:text-[12px] font-medium truncate" style={{ color: statusColor, textTransform: 'capitalize' }}>{statusStr}</span>
          </div>
        </div>
        <span className="text-[12px] text-gray-500 truncate">{project.date}</span>
      </div>
    </div>
  );
};
