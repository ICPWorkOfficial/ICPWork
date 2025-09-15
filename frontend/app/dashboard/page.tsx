'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  ChevronDown, 
  Grid3x3, 
  Users, 
  Briefcase, 
  Megaphone, 
  MessageSquare,
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
  TrendingUp,
  Menu, X
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

// Shared view components
import DashboardView from './views/dashboard';
import BountiesView from './views/bounties';
import HackathonsView from './views/hackathons';
import ProjectsView from './views/projects';
import BountiesDashboard from './views/bounties';
import PaymentView from './views/payments';
// import MessageView from './views/messages';
import MessageView from './views/messages';
import MyProjectsView from './views/my-projects';
import ProjectFlowView from './views/project-flow';
import SwapInterface from './views/icpswap';
import Analytics from './views/analytics';
import { StatCard, ProjectRow } from './views/components';
import CaffineAI from './views/caffine-ai';

const SidebarItem: React.FC<{ item: SidebarItem; onClick: () => void }> = ({ item, onClick }) => {
  // logo gradient used for active background
  const gradient = 'linear-gradient(30deg, #44B0FF 0%, #973EEE 25%, #F12AE6 50%, #FF7039 75%, #F3BC3B 100%)';
  const activeStyle: React.CSSProperties = item.active
    ? {
        background: `linear-gradient(30deg, rgba(68,176,255,0.08) 0%, rgba(151,62,238,0.08) 25%, rgba(241,42,230,0.08) 50%, rgba(255,112,57,0.08) 75%, rgba(243,188,59,0.08) 100%)`,
        border: '2px solid',
        borderImage: 'linear-gradient(30deg, #44B0FF 0%, #973EEE 25%, #F12AE6 50%, #FF7039 75%, #F3BC3B 100%) 1',
        borderRadius: '12px',
      }
    : {};

  return (
    <button
      onClick={onClick}
      className={`w-52 pl-5 pr-[45px] py-3 rounded-lg flex items-center gap-2 ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${!item.active ? 'hover:bg-gray-50' : ''}`}
      disabled={item.disabled}
      style={activeStyle}
    >
      <div className="w-6 h-6 flex items-center justify-center">
        {item.icon}
      </div>
      <span className={`text-[16px] leading-[24px] ${item.active ? 'text-[#041D37]' : item.disabled ? 'text-[#525252]' : 'text-[#555555]'}`}>
        {item.label}
      </span>
    </button>
  );
};

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
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeProject, setActiveProject] = useState<any | null>(null);

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
    { id: 'dashboard', label: 'Dashboard', icon: <Grid3x3 size={20} className="text-[#041D37]" /> },
    { id: 'browse-projects', label: 'Browse Projects', icon: <Briefcase size={20} className="text-[#555555]" /> },
    { id: 'bounties', label: 'Bounties', icon: <Megaphone size={20} className="text-[#555555]" /> },
    { id: 'my-projects', label: 'My Projects', icon: <User size={20} className="text-[#525252]" /> },
    { id: 'messages', label: 'Messages', icon: <Mail size={20} className="text-[#555555]" /> },
    { id: 'hackathons', label: 'Hackathons', icon: <Code size={20} className="text-[#525252]" /> },
    { id: 'payments', label: 'Payments', icon: <DollarSign size={20} className="text-[#525252]" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} className="text-[#525252]" /> },
  { id: 'caffine-ai', label: 'Caffine AI', icon: <MessageSquare size={20} className="text-[#525252]" /> },
    // { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} className="text-[#525252]" /> },
    { id: 'icp-swap', label: 'ICP Swap', icon: <ArrowDownLeft size={20} className="text-[#525252]" /> },
    

  ];
  const handleNavClick = (navId: string) => {
    if (!sidebarItems.find(item => item.id === navId)?.disabled) {
      setActiveNav(navId);
    }
  };

  // Main content renderers for each nav option
 








  const renderContent = (navId: string) => {
  if (activeProject) {
      return (
        <div>
          <div className="mb-4">
            <button onClick={() => setActiveProject(null)} className="px-3 py-1 border rounded">← Back</button>
          </div>
      <ProjectFlowView project={activeProject as any} onUpdate={(p) => { setActiveProject(p as any); }} />
        </div>
      );
    }

    switch (navId) {
      case 'dashboard': return <DashboardView onBrowseAll={() => setActiveNav('browse-projects')} />;
      case 'browse-projects': return <ProjectsView />;
      case 'bounties': return <BountiesDashboard />;
  case 'my-projects': return <MyProjectsView onOpenProject={(p) => setActiveProject(p as any)} onProjectUpdated={(p) => { /* keep activeProject in sync if needed */ setActiveProject(p as any); }} />;
      case 'messages': return <MessageView />;
      case 'hackathons': return <HackathonsView />;
      case 'payments': return <PaymentView />;
      case 'analytics': return <Analytics />;
  case 'caffine-ai': return <CaffineAI />;
      case 'icp-swap': return <SwapInterface />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] flex">
      {/* Sidebar (desktop) */}
      <div className="hidden md:flex w-64 bg-white border-r border-[#E0E0E0] flex flex-col">
        <div className="p-6">
          <Logo />
        </div>
        
        <nav className="flex-1 px-4 py-5">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.id}
                item={{ ...item, active: activeNav === item.id }}
                onClick={() => handleNavClick(item.id)}
              />
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-[#E0E0E0] h-[84px] flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-md" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div className="hidden md:block flex-1" />
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notification */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications((s) => !s)}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors duration-150"
                aria-label="Notifications"
              >
                <Bell size={20} className="text-[#130F26]" />
              </button>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF3B30] rounded-full flex items-center justify-center">
                <span className="text-[12.5px] font-semibold text-white uppercase tracking-[0.28px]">1</span>
              </div>

              {/* Notifications dropdown */}
              {showNotifications && (
                <>
                  {/* backdrop to close */}
                  <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-10 w-[320px] z-50 bg-white rounded-lg shadow-lg border border-[#E6E6E6] overflow-hidden">
                    <div className="p-3 border-b border-[#F2F2F2] flex items-center justify-between">
                      <span className="text-sm font-medium">Notifications</span>
                      <button onClick={() => setShowNotifications(false)} className="text-gray-500 hover:text-gray-700">Close</button>
                    </div>
                    <div className="divide-y">
                      <div className="p-3 flex gap-3 items-start">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">🔔</div>
                        <div>
                          <div className="text-[14px] font-medium">New message from client</div>
                          <div className="text-sm text-gray-500">You received a new message regarding your proposal.</div>
                        </div>
                      </div>
                      <div className="p-3 flex gap-3 items-start">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">🏆</div>
                        <div>
                          <div className="text-[14px] font-medium">Hackathon win</div>
                          <div className="text-sm text-gray-500">Your submission was shortlisted — check details.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Client Dropdown */}
            <div className="bg-[#FCFCFC] rounded-[30px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] h-10 px-5 flex items-center gap-2 hover:bg-gray-100 transition-colors duration-150 cursor-pointer">
              <div className="w-6 h-6 rounded-full bg-gray-200" />
              <span className="hidden sm:inline text-[14px] text-black tracking-[-0.1px]">Client</span>
              <ChevronDown size={12} className="text-black rotate-[270deg]" />
            </div>
            
            {/* User Dropdown */}
            <button
              onClick={() => router.push('/profile')}
              className="bg-white rounded-[30px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] h-10 px-4 flex items-center gap-2 hover:bg-gray-100 transition-colors duration-150"
              aria-label="Open profile"
            >
              <div className="w-[37px] h-[37px] rounded-full bg-gray-200" />
              <span className="hidden sm:inline text-[14px] font-medium text-[#272D37] tracking-[-0.1px]">Darshana</span>
              <ChevronDown size={12} className="text-black rotate-[270deg]" />
            </button>
          </div>
        </header>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-[#E0E0E0] p-6 overflow-auto">
              <div className="flex items-center justify-between">
                <Logo />
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-md hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
              <nav className="mt-6">
                <div className="space-y-2">
                  {sidebarItems.map((item) => (
                    <SidebarItem
                      key={item.id}
                      item={{ ...item, active: activeNav === item.id }}
                      onClick={() => { setSidebarOpen(false); handleNavClick(item.id); }}
                    />
                  ))}
                </div>
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent(activeNav)}
        </main>
      </div>
    </div>
  );
};

export default FreelancerDashboard;