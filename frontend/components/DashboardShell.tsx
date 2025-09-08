"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ChevronDown, Menu, X } from 'lucide-react';

type SidebarItemType = {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
};

const SidebarItem: React.FC<{ item: SidebarItemType; onClick: () => void }> = ({ item, onClick }) => {
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
      <div className="w-6 h-6 flex items-center justify-center">{item.icon}</div>
      <span className={`text-[16px] leading-[24px] ${item.active ? 'text-[#041D37]' : item.disabled ? 'text-[#525252]' : 'text-[#555555]'}`}>{item.label}</span>
    </button>
  );
};

const Logo: React.FC = () => (
  <div className="flex items-center gap-2">
    <div className="w-[57px] h-[33px]">
      {/* small colorful logo (kept simple) */}
      <img src="/logo.svg" alt="logo" className="w-full h-full" />
    </div>
    <span className="text-[16px] font-normal text-black">®</span>
  </div>
);

const DashboardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const sidebarItems: SidebarItemType[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <></> },
    { id: 'browse-projects', label: 'Browse Projects', icon: <></> },
    { id: 'bounties', label: 'Bounties', icon: <></> },
    { id: 'my-projects', label: 'My Projects', icon: <></> },
    { id: 'messages', label: 'Messages', icon: <></> },
    { id: 'hackathons', label: 'Hackathons', icon: <></> },
    { id: 'payments', label: 'Payments', icon: <></> },
    { id: 'analytics', label: 'Analytics', icon: <></> }
  ];

  const handleNavClick = (navId: string) => setActiveNav(navId);

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
              <SidebarItem key={item.id} item={{ ...item, active: activeNav === item.id }} onClick={() => handleNavClick(item.id)} />
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-[#E0E0E0] h-[84px] flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 rounded-md" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div className="hidden md:block flex-1" />
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={() => setShowNotifications((s) => !s)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors duration-150" aria-label="Notifications">
                <Bell size={20} className="text-[#130F26]" />
              </button>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF3B30] rounded-full flex items-center justify-center">
                <span className="text-[12.5px] font-semibold text-white uppercase tracking-[0.28px]">1</span>
              </div>
            </div>

            <div className="bg-[#FCFCFC] rounded-[30px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] h-10 px-5 flex items-center gap-2 hover:bg-gray-100 transition-colors duration-150 cursor-pointer">
              <div className="w-6 h-6 rounded-full bg-gray-200" />
              <span className="hidden sm:inline text-[14px] text-black tracking-[-0.1px]">Client</span>
              <ChevronDown size={12} className="text-black rotate-[270deg]" />
            </div>

            <button onClick={() => router.push('/profile')} className="bg-white rounded-[30px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] h-10 px-4 flex items-center gap-2 hover:bg-gray-100 transition-colors duration-150" aria-label="Open profile">
              <div className="w-[37px] h-[37px] rounded-full bg-gray-200" />
              <span className="hidden sm:inline text-[14px] font-medium text-[#272D37] tracking-[-0.1px]">Darshana</span>
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
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-md hover:bg-gray-100"><X size={18} /></button>
              </div>
              <nav className="mt-6">
                <div className="space-y-2">
                  {sidebarItems.map((item) => (
                    <SidebarItem key={item.id} item={{ ...item, active: activeNav === item.id }} onClick={() => { setSidebarOpen(false); handleNavClick(item.id); }} />
                  ))}
                </div>
              </nav>
            </div>
          </div>
        )}

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;
