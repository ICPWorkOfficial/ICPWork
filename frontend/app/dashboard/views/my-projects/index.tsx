"use client";

import React, { useEffect, useState } from 'react';
import { StatCard } from '../components';
// ProjectFlowView will be opened by the parent dashboard when requested

type Project = {
  id: string;
  title?: string;
  description?: string;
  tier?: string;
  type?: string;
  price?: string;
  orderedOn?: string;
  image?: string;
  status?: string;
  client?: { name: string; email?: string };
};
import { Keyboard, BarChart3, Calendar, TrendingUp, PlusCircle, FileText, Eye } from 'lucide-react';

type DashboardViewProps = {
  onBrowseAll?: () => void;
  onOpenProject?: (project: Project) => void;
  onProjectUpdated?: (project: Project) => void;
};

const DashboardView: React.FC<DashboardViewProps> = ({ onBrowseAll, onOpenProject, onProjectUpdated }) => {
  const stats = [
    {
      title: 'Active Projects',
      value: '5',
      subtitle: '',
      trend: '',
      icon: <Keyboard size={18} className="text-[#6F6F6F]" />
    },
    {
      title: 'PENDING PROPOSALS',
      value: '21',
      subtitle: '',
      trend: '',
      icon: <BarChart3 size={18} className="text-[#6F6F6F]" />
    },
    {
      title: 'Completed',
      value: '98.5%',
      subtitle: '',
      trend: '',
      icon: <Calendar size={18} className="text-[#6F6F6F]" />
    },
    {
      title: 'TOTAL VALUE',
      value: '100',
      subtitle: '',
      trend: '',
      icon: <TrendingUp size={18} className="text-[#A8A8A8]" />
    }
  ];

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'posted' | 'proposals'>('posted');
  const [postedSubTab, setPostedSubTab] = useState<'new' | 'orders' | 'complete' | 'cancelled'>('new');
  

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/projects');
        const json = await res.json();
        if (!mounted || !json?.ok) return;
          setProjects(json.projects || []);
      } catch (e) {}
    })();
    return () => { mounted = false; };
  }, []);

    const handleProjectUpdate = (updated: Project) => {
      setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
      onProjectUpdated?.(updated);
    };

  // selectedProject will render inside the projects section below (in-place view)

  // Small reusable project detail component so we can render it in-column (md+) and as an overlay on mobile
  const ProjectDetail: React.FC<{ project: Project; onClose: () => void }> = ({ project, onClose }) => {
    return (
      <div className="p-4 border rounded-lg bg-white">
        <button onClick={onClose} className="md:hidden absolute right-4 top-4 text-sm text-[#6F6F6F] px-2 py-1 rounded hover:bg-gray-100">✕</button>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{project.client?.name}</div>
            <div className="text-sm text-[#6F6F6F]">{project.client?.email}</div>
          </div>
          <div className="text-sm text-[#6F6F6F]">Ordered on {project.orderedOn ? new Date(project.orderedOn).toLocaleString() : ''}</div>
        </div>
        <div className="mt-4">
          <div className="font-medium">Project Description</div>
          <div className="text-sm text-[#6F6F6F] mt-2">{project.description}</div>
        </div>

        <div className="mt-4">
          <div className="font-medium">Timeline</div>
          <div className="mt-2 space-y-3">
            {['Payment In Escrow', 'Order Placed', 'Work Completion', 'Revision', 'Project Completion'].map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${i <= 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>✓</div>
                <div>
                  <div className="font-medium">{step}</div>
                  <div className="text-xs text-[#6F6F6F]">{i <= 1 ? 'Done' : 'Pending'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="p-3 border rounded">
            <div className="font-medium">Work Submission</div>
            <div className="text-sm text-[#6F6F6F] mt-2">Files/code submitted by freelancer. (Demo)</div>
            <div className="mt-2">
              <button className="px-3 py-1 rounded-md bg-[#041D37] text-white mr-2">Mark as Reviewed</button>
              <button className="px-3 py-1 rounded-md border">Request Revision</button>
            </div>
          </div>

          <div className="p-3 border rounded flex items-center justify-between">
            <div>
              <div className="font-medium">Review</div>
              <div className="text-sm text-[#6F6F6F]">If project is completed, ask for review.</div>
            </div>
            <div className="flex flex-col items-end">
              <button className="px-3 py-1 rounded-md bg-green-600 text-white mb-2">Complete Project</button>
              <button className="px-3 py-1 rounded-md border">Raise Dispute</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl text-gray-800 font-bold">My Projects</h1>
          <p className="text-md text-gray-600">Manage your projects and proposals</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm  px-4 py-2 rounded-md text-white flex items-center gap-2" style={{ background: 'linear-gradient(30deg, #44B0FF 0%, #973EEE 25%, #F12AE6 50%, #FF7039 75%, #F3BC3B 100%)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Post New Project
            </button>
          <div className="bg-gray-100 px-2 py-1 rounded-lg h-[28px] flex items-center justify-center">
          <span className="text-[11px] md:text-[12px] font-medium text-black capitalize">Analytics</span>
        </div>
            
        </div>
      </div>

      {/* Stats Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 items-stretch">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      {/* Projects section with tabs */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4 ">
          <div className="flex items-center gap-3 p-2 bg-gray-100 border-gray-900 border-2">
            <button onClick={() => setActiveTab('posted')} className={`px-3 py-1 rounded-full ${activeTab === 'posted' ? 'bg-white text-[#041D37]' : 'text-[#6F6F6F]'}`}>My Posted Projects</button>
            <button onClick={() => setActiveTab('proposals')} className={`px-3 py-1 rounded-full ${activeTab === 'proposals' ? 'bg-white text-[#041D37]' : 'text-[#6F6F6F]'}`}>My Proposals</button>
          </div>
          <div>
            <button className="text-sm px-3 py-1 rounded-md border" onClick={() => { /* hook to post new project */ }}>New Project</button>
          </div>
        </div>

  {activeTab === 'posted' ? (
          <div>
            <div className="border-b border-gray-200 mb-4">
              <div className="flex -mb-px gap-4">
                <button onClick={() => setPostedSubTab('new')} className={`px-3 py-2 -mb-px ${postedSubTab === 'new' ? 'border-b-4 border-green-500 text-[#041D37]' : 'text-[#6F6F6F]'}`}>New Orders</button>
                <button onClick={() => setPostedSubTab('complete')} className={`px-3 py-2 -mb-px ${postedSubTab === 'complete' ? 'border-b-4 border-green-500 text-[#041D37]' : 'text-[#6F6F6F]'}`}>Complete</button>
                <button onClick={() => setPostedSubTab('cancelled')} className={`px-3 py-2 -mb-px ${postedSubTab === 'cancelled' ? 'border-b-4 border-green-500 text-[#041D37]' : 'text-[#6F6F6F]'}`}>Cancelled</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3 space-y-4">
                  {selectedProject ? (
                    <div>
                      <div className="mb-4 flex items-center gap-3">
                        <button onClick={() => setSelectedProject(null)} className="px-3 py-1 border rounded">← Back to list</button>
                        <div className="font-semibold">Viewing: {selectedProject?.title ?? selectedProject?.description}</div>
                      </div>
                      <div className="bg-white p-4 rounded">
                        <ProjectDetail project={selectedProject} onClose={() => setSelectedProject(null)} />
                      </div>
                    </div>
                  ) : (
                    projects.filter(p => {
                    if (postedSubTab === 'new') return p.status === 'new';
                    if (postedSubTab === 'complete') return p.status === 'completed';
                    if (postedSubTab === 'cancelled') return p.status === 'cancelled';
                    return true;
                    }).map(p => {
                    
                    const num = Number(String(p.price).replace(/[^0-9.-]+/g, ''));
                    const formattedPrice = Number.isFinite(num) ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num) : p.price;
                    type StatusKey = 'new' | 'pending' | 'completed' | 'cancelled';
                    const statusMap: Record<StatusKey, { label: string; cls: string }> = {
                      new: { label: 'Pending', cls: 'text-yellow-600' },
                      pending: { label: 'Pending', cls: 'text-yellow-600' },
                      completed: { label: 'Completed', cls: 'text-green-600' },
                      cancelled: { label: 'Cancelled', cls: 'text-red-600' }
                    };
                    const statusKey: StatusKey = (p.status as StatusKey) || 'new';
                    const status = statusMap[statusKey] || { label: String(p.status || 'Unknown'), cls: 'text-gray-600' };

                    return (
                      <div key={p.id} className="border rounded-lg hover:shadow-sm overflow-hidden">
                        <button
                          onClick={() => onOpenProject ? onOpenProject(p) : undefined}
                          className="w-full text-left p-4 flex items-start gap-4 bg-white"
                        >
                          <div className="w-20 h-20 bg-[#F3F7FA] rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
                            {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="text-sm">No image</div>}
                          </div>
                          <div className="flex-1">
                            {/* <div className="">{p.title}</div> */}
                            
                            <div className=" flex flex-col sm:flex-row sm:items-ce sm:justify-between ">
                              <div>
                              <div className="font-semibold text-[#041D37] text-sm sm:text-xl max-w-xl">{p.description}</div>
                              <div className="text-xs sm:text-lg text-[#6F6F6F]">{p.tier} • {p.type}</div>
                              <div className="text-xs sm:text-md text-[#6F6F6F]">Ordered on {p.orderedOn ? new Date(p.orderedOn).toLocaleDateString() : ''}</div>
                              </div>
                              <div className="text-sm text-right">
                                <div className="font-medium text-2xl">{formattedPrice}</div>
                                           <div className="mt-2">
                              <span className={`text-md font-medium ${status.cls}`}>{status.label}</span>
                            </div>
                                
                              </div>
                            </div>
                            
                              
                 
                          </div>
                        </button>
                      </div>
                      );
                    })
                  )}
                </div>
              </div>
          </div>
        ) : (
          <div className="p-4">{/* Proposals tab content - simple list for demo */}
            <div className="space-y-3">
              {projects.map(p => (
                <div key={p.id} className="p-3 border rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-sm text-[#6F6F6F]">Proposal for {p.type} • {p.tier}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{p.price}</div>
                    <div className="text-xs text-[#6F6F6F]">{p.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </>
  );
};

export default DashboardView;
