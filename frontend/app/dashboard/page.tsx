'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Grid3x3, 
  Users, 
  Briefcase, 
  Megaphone, 
  User, 
  Mail, 
  Code, 
  DollarSign, 
  BarChart3,
  Calendar,
  Keyboard,
  ArrowDownLeft,
  Plus,
  Eye,
  TrendingUp
} from 'lucide-react';

// Design tokens from Figma
const designTokens = {
  colors: {
    primary: '#041D37',
    secondary: '#272D37',
    danger: '#FF3B30',
    success: '#1BB152',
    textPrimary: '#16192C',
    textSecondary: '#525252',
    textDisabled: '#A8A8A8',
    borderStrong: '#6F6F6F',
    neutral: '#09090B',
    grey: '#555555',
    background: '#FCFCFC',
    white: '#FFFFFF',
    cardBg: '#FDFDFD',
    border: '#E0E0E0',
    lightBorder: '#F9F9F9'
  },
  typography: {
    heading: 'text-[20px] font-semibold leading-[32px] tracking-[-0.4px]',
    bodyMedium: 'text-[16px] font-medium leading-[24px]',
    bodyRegular: 'text-[16px] leading-[24px]',
    bodySmall: 'text-[14px] leading-[22px]',
    caption: 'text-[10px] font-medium leading-[20px] uppercase tracking-[0.4px]'
  }
};

// Types
interface Project {
  id: string;
  title: string;
  amount: string;
  status: 'completed' | 'in-progress' | 'pending';
  date: string;
  from: string;
}

interface StatCard {
  title: string;
  value: string;
  subtitle: string;
  trend: string;
  icon: React.ReactNode;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}

// Reusable Components
const StatCard: React.FC<{ stat: StatCard }> = ({ stat }) => (
  <div className="bg-white rounded-lg shadow-[4px_4px_16px_2px_rgba(0,0,0,0.08)] p-4 flex flex-col gap-2.5 h-[116px] w-[248px]">
    <div className="flex items-center justify-between">
      <span className={`${designTokens.typography.bodySmall} text-[#525252] capitalize`}>
        {stat.title}
      </span>
      <span className="text-[10px] font-medium leading-[20px] text-transparent bg-clip-text">
        {stat.trend}
      </span>
    </div>
    
    <div className="flex items-center gap-2">
      <div className="w-[30px] h-[30px] bg-[#F8F8F8] rounded-full flex items-center justify-center">
        {stat.icon}
      </div>
      <span className="text-[18px] font-bold leading-[24px] text-[#16192C]">
        {stat.value}
      </span>
    </div>
    
    <span className="text-[10px] font-medium leading-[20px] uppercase text-[#525252]">
      {stat.subtitle}
    </span>
  </div>
);

const ProjectRow: React.FC<{ project: Project }> = ({ project }) => (
  <div className="bg-[#FDFDFD] border border-[#F9F9F9] rounded-xl h-20 p-3 flex items-center justify-between">
    <div className="flex items-center gap-[15px]">
      <div className="w-[57px] h-[57px] bg-[#1BB152] rounded-[6.5px] flex items-center justify-center">
        <ArrowDownLeft size={16} className="text-black rotate-[270deg]" />
      </div>
      
      <div className="w-[243px]">
        <h4 className="text-[14px] font-medium leading-[28px] text-black">
          {project.title}
        </h4>
        <p className="text-[10px] leading-[28px] text-black">
          From: {project.from}
        </p>
      </div>
    </div>
    
    <div className="w-[148px] flex flex-col items-end gap-px">
      <div className="flex items-start gap-[3px] w-full">
        <span className="text-[18px] font-medium leading-[28px] text-transparent bg-clip-text">
          {project.amount}
        </span>
        <div className="bg-[rgba(104,255,102,0.14)] px-1 py-0.5 rounded-lg h-[25px] w-[61px] flex items-center justify-center">
          <span className="text-[10px] font-medium leading-[20px] text-[#058700] capitalize">
            {project.status}
          </span>
        </div>
      </div>
      <span className="text-[10px] leading-[28px] text-black text-center">
        {project.date}
      </span>
    </div>
  </div>
);

const SidebarItem: React.FC<{ item: SidebarItem; onClick: () => void }> = ({ item, onClick }) => (
  <button
    onClick={onClick}
    className={`w-52 pl-5 pr-[45px] py-3 rounded-lg flex items-center gap-2 ${
      item.active 
        ? 'border-[1.5px] border-[#44B0FF] bg-transparent' 
        : 'hover:bg-gray-50'
    } ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    disabled={item.disabled}
  >
    <div className="w-6 h-6 flex items-center justify-center">
      {item.icon}
    </div>
    <span className={`text-[16px] leading-[24px] ${
      item.active ? 'text-[#041D37]' : item.disabled ? 'text-[#525252]' : 'text-[#555555]'
    }`}>
      {item.label}
    </span>
  </button>
);

const Logo: React.FC = () => (
  <div className="flex items-center gap-2">
    <div className="w-[57px] h-[33px]">
      <svg viewBox="0 0 57 33" fill="none" className="w-full h-full">
        <path d="M40.1879 8.63504L32.2559 10.2732L25.8785 16.0471L18.2052 8.3738L18.2457 8.33328L11.1216 1.20916C9.50931 -0.403096 6.89434 -0.403096 5.28209 1.20916L1.20919 5.28206C-0.403065 6.89432 -0.403065 9.50928 1.20919 11.1215L18.4285 28.3408C23.8524 33.7647 32.6474 33.7647 38.0713 28.3408L38.1213 28.2908L55.0284 11.3836L50.0424 6.47868L40.1879 8.63504Z" fill="url(#paint0_linear)" />
        <path d="M50.1 6.4793L43.8062 7.68634L39.4091 8.63473L38.6832 9.0296L31.0349 1.38128C29.4226 -0.230975 26.8077 -0.230975 25.1954 1.38128L18.2437 8.33297L30.7409 20.8301C34.8379 24.9272 41.4809 24.9272 45.5788 20.8301L48.0317 18.3773L55.0265 11.3825L50.1009 6.4793H50.1Z" fill="url(#paint1_linear)" />
        <path d="M18.2441 8.33384L18.2039 8.37407L38.1198 28.29L38.1601 28.2498L18.2441 8.33384Z" fill="#FDB131" />
        <path d="M55.0284 11.3825C51.1668 15.2441 44.9057 15.2441 41.0432 11.3825L38.1635 8.5028L45.1557 1.5106C46.768 -0.101657 49.3829 -0.101657 50.9952 1.5106L55.0276 5.54297C56.6398 7.15523 56.6398 9.7702 55.0276 11.3825H55.0284Z" fill="#29AAE1" />
        <defs>
          <linearGradient id="paint0_linear" x1="15.066" y1="-1.80067" x2="47.4853" y2="30.6187" gradientUnits="userSpaceOnUse">
            <stop offset="0.21" stopColor="#F05A24" />
            <stop offset="0.68" stopColor="#FAAF3B" />
          </linearGradient>
          <linearGradient id="paint1_linear" x1="26.2265" y1="-0.549979" x2="55.4515" y2="28.675" gradientUnits="userSpaceOnUse">
            <stop offset="0.22" stopColor="#EC1E79" />
            <stop offset="0.89" stopColor="#522784" />
          </linearGradient>
        </defs>
      </svg>
    </div>
    <span className="text-[24px] font-bold text-black">ICPWork</span>
    <span className="text-[16px] font-normal text-black">®</span>
  </div>
);

// Main Dashboard Component
const FreelancerDashboard: React.FC = () => {
  const [activeNav, setActiveNav] = useState('dashboard');

  // Mock data
  const stats: StatCard[] = [
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

  const projects: Project[] = [
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

  const sidebarItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Grid3x3 size={20} className="text-[#041D37]" />, active: true },
    { id: 'hire-talent', label: 'Hire Talent', icon: <Users size={20} className="text-[#555555]" /> },
    { id: 'browse-projects', label: 'Browse Projects', icon: <Briefcase size={20} className="text-[#555555]" /> },
    { id: 'bounties', label: 'Bounties', icon: <Megaphone size={20} className="text-[#555555]" /> },
    { id: 'my-projects', label: 'My Projects', icon: <User size={20} className="text-[#525252]" />, disabled: true },
    { id: 'messages', label: 'Messages', icon: <Mail size={20} className="text-[#555555]" /> },
    { id: 'hackathons', label: 'Hackathons', icon: <Code size={20} className="text-[#525252]" />, disabled: true },
    { id: 'payments', label: 'Payments', icon: <DollarSign size={20} className="text-[#525252]" />, disabled: true },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} className="text-[#525252]" />, disabled: true },
    { id: 'caffeine-ai', label: 'Caffeine AI', icon: <div className="w-[25px] h-[27px] bg-gray-200 rounded-[12.5px]" />, disabled: true }
  ];

  const handleNavClick = (navId: string) => {
    if (!sidebarItems.find(item => item.id === navId)?.disabled) {
      setActiveNav(navId);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-[#E0E0E0] flex flex-col">
        <div className="p-6">
          <Logo />
        </div>
        
        <nav className="flex-1 px-4 py-5">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                onClick={() => handleNavClick(item.id)}
              />
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-[#E0E0E0] h-[84px] flex items-center justify-between px-6">
          <div className="flex-1" />
          
          <div className="flex items-center gap-4">
            {/* Notification */}
            <div className="relative">
              <div className="w-8 h-8 flex items-center justify-center">
                <Bell size={20} className="text-[#130F26]" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF3B30] rounded-full flex items-center justify-center">
                <span className="text-[12.5px] font-semibold text-white uppercase tracking-[0.28px]">1</span>
              </div>
            </div>
            
            {/* Client Dropdown */}
            <div className="bg-[#FCFCFC] rounded-[30px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] h-10 px-5 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200" />
              <span className="text-[14px] text-black tracking-[-0.1px]">Client</span>
              <ChevronDown size={12} className="text-black rotate-[270deg]" />
            </div>
            
            {/* User Dropdown */}
            <div className="bg-white rounded-[30px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] h-10 px-4 flex items-center gap-2">
              <div className="w-[37px] h-[37px] rounded-full bg-gray-200" />
              <span className="text-[14px] font-medium text-[#272D37] tracking-[-0.1px]">Darshana</span>
              <ChevronDown size={12} className="text-black rotate-[270deg]" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-[20px] font-semibold leading-[24px] text-gray-800 mb-2">
              Browse Projects
            </h1>
            <p className="text-sm text-gray-600">
              Join Exciting Hackathons and win prizes
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Recent Projects */}
            <div className="col-span-2">
              <div className="bg-white rounded-xl border border-[#EDEDED] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[20px] font-semibold text-gray-800">Recent Projects</h2>
                  <button className="text-[8px] font-medium uppercase tracking-[0.4px] text-black bg-transparent rounded-[222px] px-0 py-1">
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
                <h3 className="text-[20px] font-medium text-black tracking-[-0.4px] leading-[32px] mb-2">
                  Performance
                </h3>
                
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
                      <span className="text-[14px] font-medium text-transparent bg-clip-text leading-[22px]">$75K - $100K</span>
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
                <h3 className="text-[20px] font-medium text-black tracking-[-0.4px] leading-[32px] mb-6">
                  Quick Actions
                </h3>
                
                <div className="space-y-4">
                  <button className="w-full flex items-center gap-2 p-3 text-left hover:bg-gray-50 rounded-lg">
                    <Plus size={16} className="text-gray-600" />
                    <span className="text-sm">Create New Proposal</span>
                  </button>
                  
                  <button className="w-full flex items-center gap-2 p-3 text-left hover:bg-gray-50 rounded-lg">
                    <Eye size={16} className="text-gray-600" />
                    <span className="text-sm">View Active Projects</span>
                  </button>
                  
                  <button className="w-full flex items-center gap-2 p-3 text-left hover:bg-gray-50 rounded-lg">
                    <BarChart3 size={16} className="text-gray-600" />
                    <span className="text-sm">Check Analytics</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FreelancerDashboard;