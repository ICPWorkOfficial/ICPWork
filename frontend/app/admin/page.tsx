'use client';

import React, { useState } from 'react';
import { 
  Grid3x3,
  Users,
  Briefcase,
  Building,
  CreditCard,
  Menu,
  X,
  PlusIcon,
  Eye,
  PlusCircle,
  FileText,
  ChevronDown
} from 'lucide-react';
import { MetricCards } from '../../components/MetricsCards'
import { UsersTable } from '../../components/UsersTable'
import { useRouter } from 'next/navigation';

const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="w-[57px] h-[33px] bg-gradient-to-r from-orange-400 to-purple-600 rounded" />
    <span className="text-[24px] font-bold text-black">ICPWork</span>
  </div>
);

const UsersListView: React.FC<{ title: string; filter?: string }> = ({ title, filter }) => {
  const [search, setSearch] = useState('')
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#041d37]">{title}</h1>
          <p className="text-gray-500">Manage and search users in this category.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded-md w-64"
            placeholder="Search by name or user id"
          />
          <button
            onClick={() => {}}
            className="px-4 py-2 bg-black text-white rounded-md"
          >
            Search
          </button>
        </div>
      </div>
      <UsersTable filter={filter} search={search} />
    </div>
  )
}

const ProjectRow: React.FC<{ project: { id: string; title: string; client: string; budget: string; status: string } }> = ({ project }) => {
  return (
    <div className="flex items-start gap-4 bg-white rounded-lg p-4 border border-[#F2F2F2]">
      <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-sm font-medium">P</div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[15px] font-medium text-gray-900">{project.title}</div>
            <div className="text-sm text-gray-500">{project.client}</div>
          </div>
          <div className="text-sm text-gray-600">{project.budget}</div>
        </div>
        <div className="mt-2 text-sm text-gray-500">Status: {project.status}</div>
      </div>
    </div>
  )
}



function DashboardView() {
  return (
      <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#041d37]">
                Browse Projects
              </h1>
              <p className="text-gray-500">
                Join Exciting Hackathons and win prizes
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-green-500 bg-green-50 px-3 py-1 rounded-full text-sm">
                Available
              </span>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-md text-white font-medium cusror-pointer"
                style={{ background: 'linear-gradient(30deg, #44B0FF 0%, #973EEE 25%, #F12AE6 50%, #FF7039 75%, #F3BC3B 100%)' }}
              >
                <PlusIcon size={20} />
                New Project
              </button>
            </div>
          </div>
          <MetricCards />
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Users</h2>
              <button className="text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                Browse All
              </button>
            </div>
            <UsersTable />
          </div>
        </div>
  );
}

function FreelancersView() {
  return <UsersListView title="Browse Freelancers" filter="Freelancers" />
}

function CustomersView() {
  return <UsersListView title="Browse Customers" filter="Customers" />
}

function EnterpriseView() {
  return <UsersListView title="Browse Enterprise" filter="Enterprise" />
}

function SubscriptionsView() {
  const projects = [
    { id: 'p1', title: 'ICP Wallet Integration', client: 'Acme Corp', budget: '$85K', status: 'Active' },
    { id: 'p2', title: 'Canister Deployment', client: 'Beta Labs', budget: '$45K', status: 'Completed' },
    { id: 'p3', title: 'Tokenomics Audit', client: 'Delta Inc', budget: '$25K', status: 'In Review' },
  ]

  const onBrowseAll = () => {
    // placeholder - in a real app this would navigate to a projects page
    alert('Browse all projects')
  }

  return (
    <div>
      <MetricCards />

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
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
      </div>
    </div>
  )
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}

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
      className={`w-52 pl-5 pr-[45px] py-3 rounded-lg flex items-center gap-2 transition-colors duration-150 ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${!item.active ? 'hover:bg-gray-50' : ''} ${item.active ? 'ring-1 ring-indigo-100 bg-gradient-to-r from-blue-50 to-purple-50' : ''}`}
      disabled={item.disabled}
      style={activeStyle}
      aria-pressed={item.active}
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

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [active, setActive] = useState('dashboard');
  const [open, setOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

  const renderContent = () => {
    switch (active) {
      case 'dashboard': return <DashboardView />;
      case 'freelancers': return <FreelancersView />;
      case 'customers': return <CustomersView />;
      case 'enterprise': return <EnterpriseView />;
      case 'subscriptions': return <SubscriptionsView />;
      default: return <DashboardView />;
    }
  }

  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: <Grid3x3 size={18} /> },
    { id: 'freelancers', label: 'Freelancers', icon: <Users size={18} /> },
    { id: 'customers', label: 'Customers', icon: <Briefcase size={18} /> },
    { id: 'enterprise', label: 'Enterprise', icon: <Building size={18} /> },
    { id: 'subscriptions', label: 'Subscriptions', icon: <CreditCard size={18} /> },
  ];

  return (
    <div className="min-h-screen  bg-[#FCFCFC] flex">
       <div className="min-h-screen bg-[#FCFCFC] flex w-screen">
            {/* Sidebar (desktop) */}
            <div className="hidden md:flex w-64 bg-white border-r border-[#E0E0E0] flex flex-col">
              <div className="p-6">
                <Logo />
              </div>
              
              <nav className="flex-1 px-4 py-5">
                <div className="space-y-1">
                  {items.map((it) => (
                    <SidebarItem
                      key={it.id}
                      item={{ ...it, active: it.id === active }}
                      onClick={() => setActive(it.id)}
                    />
                  ))}
                </div>
              </nav>
            </div>
      
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <header className="bg-white border-b border-[#E0E0E0] h-[90px] w-full flex items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-4">
                  {/* Mobile menu button */}
                  <button className="md:hidden p-2 rounded-md" onClick={() => setOpen(true)} aria-label="Open menu">
                    <Menu size={20} />
                  </button>
                  <div className="hidden md:block flex-1" />
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Notification */}
                  {/* <div className="relative">
                    <button
                      onClick={() => setShowNotifications((s) => !s)}
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors duration-150"
                      aria-label="Notifications"
                    >
                      <Bell size={20} className="text-[#130F26]" />
                    </button>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF3B30] rounded-full flex items-center justify-center">
                      <span className="text-[12.5px] font-semibold text-white uppercase tracking-[0.28px]">1</span>
                    </div> */}
      
                    {/* Notifications dropdown {showNotifications && (
                      <>
                        {/* backdrop to close 
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
                  </div> */}
                  
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
              {open && (
                <div className="fixed inset-0 z-50 md:hidden">
                  <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
                  <div className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-[#E0E0E0] p-6 overflow-auto">
                    <div className="flex items-center justify-between">
                      <Logo />
                      <button onClick={() => setOpen(false)} className="p-2 rounded-md hover:bg-gray-100">
                        <X size={18} />
                      </button>
                    </div>
                    <nav className="mt-6">
                      <div className="space-y-2">
                        {items.map((item) => (
                          <SidebarItem
                            key={item.id}
                            item={{ ...item, active: item.id === active }}
                            onClick={() => { setActive(item.id); setOpen(false); }}
                          />
                        ))}
                      </div>
                    </nav>
                  </div>
                </div>
              )}
      
              {/* Main Content */}
             <main className="flex-1 p-6">{renderContent()}</main>
            </div>
          </div>

        </div>
   
  )
}

export default AdminDashboard;
