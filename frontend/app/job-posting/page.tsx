"use client";

import React, { useState, useEffect } from 'react';
import { FileText, FolderOpen, MapPin, DollarSign, Send } from 'lucide-react';

interface TabData {
  id: string;
  name: string;
  icon: any;
}

const tabs: TabData[] = [
  { id: 'overview', name: 'Overview', icon: FileText },
  { id: 'details', name: 'Job Details', icon: FolderOpen },
  { id: 'location', name: 'Location & Contract', icon: MapPin },
  { id: 'budget', name: 'Budget', icon: DollarSign },
  { id: 'application', name: 'Application', icon: Send },
];

export default function JobPostingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState<any>({});

  const handleSave = (tabId: string) => {
    // simple client-side save and navigate to next tab
    const currentTabIndex = tabs.findIndex(t => t.id === tabId);
    if (currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1].id);
    }
  };

  const publishJob = async () => {
    try {
      // Map local form data to API payload shape
      const payload = {
        clientEmail: formData.clientEmail || 'client@example.com',
        category: formData.category || formData.jobType || 'General',
        subCategory: formData.subCategory || '',
        jobTitle: formData.jobTitle || '',
        rolesAndResponsibilities: Array.isArray(formData.rolesAndResponsibilities) ? formData.rolesAndResponsibilities : (formData.roles ? [formData.roles] : []),
        skillsRequired: (typeof formData.skills === 'string' && formData.skills.length) ? formData.skills.split(',').map((s: string) => s.trim()) : (Array.isArray(formData.skills) ? formData.skills : (formData.skills ? [formData.skills] : [])),
        benefits: Array.isArray(formData.benefits) ? formData.benefits : (formData.benefits ? [formData.benefits] : []),
        jobRoles: formData.jobRoles || [],
        duration: formData.duration || '',
        isContractToHire: !!formData.contractToHire || !!formData.isContractToHire,
        workplaceType: formData.workplaceType || '',
        location: formData.location || '',
        budget: formData.amount || formData.budget || '',
        budgetType: formData.budgetType || formData.paymentPeriod || '',
        applicationType: formData.applicationType || '',
        applicationDetails: formData.applicationInstructions || formData.applicationDetails || ''
      };

      const res = await fetch('/api/job-postings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.success) {
        alert('Job published — ID: ' + (data.id || data.jobId || 'unknown'));
      } else {
        console.error('Publish failed', data);
        alert('Failed to publish job');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to publish job');
    }
  };

  // Prefill form if any existing job postings are returned by the API
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/job-postings', { method: 'GET' });
        if (!mounted) return;
        if (!res.ok) return;
        const json = await res.json();
        // Support either { success, postings: [...] } or an array response
        const postings = json?.postings || (Array.isArray(json) ? json : null);
        if (postings && postings.length) {
          const first = postings[0];
          // Map API response back to local formData keys
          setFormData({
            clientEmail: first.clientEmail || '',
            category: first.category || '',
            subCategory: first.subCategory || '',
            jobTitle: first.jobTitle || '',
            roles: Array.isArray(first.rolesAndResponsibilities) ? first.rolesAndResponsibilities.join('\n') : (first.rolesAndResponsibilities || ''),
            skills: Array.isArray(first.skillsRequired) ? first.skillsRequired.join(', ') : (first.skillsRequired || ''),
            benefits: Array.isArray(first.benefits) ? first.benefits : (first.benefits || []),
            jobRoles: first.jobRoles || [],
            duration: first.duration || '',
            contractToHire: !!first.isContractToHire,
            workplaceType: first.workplaceType || '',
            location: first.location || '',
            amount: first.budget || '',
            budgetType: first.budgetType || '',
            applicationMethod: first.applicationType || '',
            applicationInstructions: first.applicationDetails || ''
          });
        }
      } catch (e) {
        // ignore
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="rounded-lg p-6">
              <h3 className="text-lg mb-4 text-black pb-2">Job Overview</h3>
              <div className="space-y-4">
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <label className="text-[14px] font-medium text-[#6F6F6F] block">What type of job is it?</label>
                  <select
                    value={formData.jobType || ''}
                    onChange={(e) => setFormData({...formData, jobType: e.target.value})}
                    className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF] bg-white"
                  >
                    <option value="">Select job type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </div>

                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <label className="text-[14px] font-medium text-[#6F6F6F] block">Category</label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g., Engineering, Design"
                    className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                  />
                </div>

                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <label className="text-[14px] font-medium text-[#6F6F6F] block">Sub Category</label>
                  <input
                    type="text"
                    value={formData.subCategory || ''}
                    onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                    placeholder="e.g., Frontend Development"
                    className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActiveTab('overview')} className="w-40 py-3 bg-gray-200 text-gray-700 font-thin rounded-full">Save</button>
              <button onClick={() => handleSave('overview')} className="w-40 py-3 bg-black text-white font-thin rounded-full">Next</button>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            <div className="rounded-lg p-6">
              <h3 className="text-lg font-bold text-black pb-2">Job Details</h3>
              <div className="space-y-4">
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <label className="text-[14px] font-medium text-[#6F6F6F] block">Job Title</label>
                  <input
                    type="text"
                    value={formData.jobTitle || ''}
                    onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                    placeholder="e.g., Senior Frontend Engineer"
                    className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                  />
                </div>

                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <label className="text-[14px] font-medium text-[#6F6F6F] block">Roles & Responsibilities</label>
                  <textarea
                    value={formData.roles || ''}
                    onChange={(e) => setFormData({...formData, roles: e.target.value})}
                    rows={5}
                    placeholder="Describe roles and responsibilities"
                    className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                  />
                </div>

                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <label className="text-[14px] font-medium text-[#6F6F6F] block">Skills Required</label>
                  <input
                    type="text"
                    value={formData.skills || ''}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    placeholder="Comma-separated skills e.g., React, TypeScript"
                    className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                  />
                </div>

                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <label className="text-[14px] font-medium text-[#6F6F6F] block">Benefits</label>
                  <textarea
                    value={formData.benefits || ''}
                    onChange={(e) => setFormData({...formData, benefits: e.target.value})}
                    rows={4}
                    placeholder="List benefits offered"
                    className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActiveTab('overview')} className="w-40 py-3 bg-gray-200 text-gray-700 font-thin rounded-full">Back</button>
              <button onClick={() => handleSave('details')} className="w-40 py-3 bg-black text-white font-thin rounded-full">Next</button>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-6">
            <div className="rounded-lg p-6">
              <h3 className="text-lg mb-4 text-black pb-2">Location & Contract</h3>
              <div className="space-y-4">
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <label className="text-[14px] font-medium text-[#6F6F6F] block">Role</label>
                  <input
                    type="text"
                    value={formData.positionRole || ''}
                    onChange={(e) => setFormData({...formData, positionRole: e.target.value})}
                    placeholder="e.g., Frontend Engineer"
                    className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                  />
                </div>

                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <label className="text-[14px] font-medium text-[#6F6F6F] block">Duration</label>
                  <input
                    type="text"
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g., 6 months, ongoing"
                    className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                  />
                </div>

                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <label className="text-[14px] font-medium text-[#6F6F6F] block">Level of Experience</label>
                  <select
                    value={formData.experienceLevel || ''}
                    onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}
                    className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF] bg-white"
                  >
                    <option value="">Select experience level</option>
                    <option value="Entry">Entry</option>
                    <option value="Mid">Mid</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>

                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <label className="flex items-center gap-2 text-[14px] font-medium text-[#6F6F6F] block">
                    <input
                      type="checkbox"
                      checked={!!formData.contractToHire}
                      onChange={(e) => setFormData({...formData, contractToHire: e.target.checked})}
                      className="mr-2"
                    />
                    Contract to hire position?
                  </label>
                </div>

                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <label className="text-[14px] font-medium text-[#6F6F6F] block">Workplace Type</label>
                  <select
                    value={formData.workplaceType || ''}
                    onChange={(e) => setFormData({...formData, workplaceType: e.target.value})}
                    className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF] bg-white"
                  >
                    <option value="">Select workplace type</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <label className="text-[14px] font-medium text-[#6F6F6F] block">Enter your location</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="City, State / Remote"
                    className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActiveTab('details')} className="w-40 py-3 bg-gray-200 text-gray-700 font-thin rounded-full">Back</button>
              <button onClick={() => handleSave('location')} className="w-40 py-3 bg-black text-white font-thin rounded-full">Next</button>
            </div>
          </div>
        );

      case 'budget':
        return (
          <div className="space-y-6">
            <div className="rounded-lg p-6">
              <h3 className="text-lg mb-4 text-black pb-2">Budget</h3>
              <div className="space-y-4">
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <label className="text-[14px] font-medium text-[#6F6F6F] block">Enter your amount</label>
                  <input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="e.g., 2000"
                    className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                  />
                </div>

                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <label className="text-[14px] font-medium text-[#6F6F6F] block">Time period of payment</label>
                  <select
                    value={formData.paymentPeriod || ''}
                    onChange={(e) => setFormData({...formData, paymentPeriod: e.target.value})}
                    className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF] bg-white"
                  >
                    <option value="">Select period</option>
                    <option value="One-time">One-time</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Per milestone">Per milestone</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white w-full mb-4">
                    <label className="text-[14px] font-medium text-[#6F6F6F] block">Min amount</label>
                    <input
                      type="number"
                      value={formData.minAmount || ''}
                      onChange={(e) => setFormData({...formData, minAmount: e.target.value})}
                      placeholder="e.g., 1000"
                      className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                    />
                  </div>

                  <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white w-full mb-4">
                    <label className="text-[14px] font-medium text-[#6F6F6F] block">Max amount</label>
                    <input
                      type="number"
                      value={formData.maxAmount || ''}
                      onChange={(e) => setFormData({...formData, maxAmount: e.target.value})}
                      placeholder="e.g., 5000"
                      className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                    />
                  </div>
                </div>

                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <label className="flex items-center gap-2 text-[14px] font-medium text-[#6F6F6F] block">
                    <input
                      type="checkbox"
                      checked={!!formData.isUnpaidInternship}
                      onChange={(e) => setFormData({...formData, isUnpaidInternship: e.target.checked})}
                      className="mr-2"
                    />
                    MARK AS UNPAID INTERNSHIP
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActiveTab('location')} className="w-40 py-3 bg-gray-200 text-gray-700 font-thin rounded-full">Back</button>
              <button onClick={() => handleSave('budget')} className="w-40 py-3 bg-black text-white font-thin rounded-full">Next</button>
            </div>
          </div>
        );

      case 'application':
        return (
          <div className="space-y-6">
            <div className="rounded-lg p-6">
              <h3 className="text-lg mb-4 text-black pb-2">How Can People Apply?</h3>
              <div className="space-y-4">
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <label className="text-[14px] font-medium text-[#6F6F6F] block">APPLICATION METHOD</label>
                  <select
                    value={formData.applicationMethod || ''}
                    onChange={(e) => setFormData({...formData, applicationMethod: e.target.value})}
                    className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF] bg-white"
                  >
                    <option value="">Select method</option>
                    <option value="Email">Apply via Email</option>
                    <option value="Website">Apply via Website</option>
                    <option value="Portal">Apply via Portal</option>
                    <option value="Message">Apply via Message</option>
                  </select>
                </div>

                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <label className="text-[14px] font-medium text-[#6F6F6F] block">APPLICATION INSTRUCTIONS</label>
                  <textarea
                    value={formData.applicationInstructions || ''}
                    onChange={(e) => setFormData({...formData, applicationInstructions: e.target.value})}
                    rows={6}
                    placeholder="E.g., Send resume to hr@example.com or apply via link"
                    className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActiveTab('budget')} className="w-40 py-3 bg-gray-200 text-gray-700 font-thin rounded-full">Back</button>
              <button onClick={publishJob} className="w-40 py-3 bg-black text-white font-thin rounded-full">Publish Job</button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <nav className="bg-white shadow-lg border-b px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <img src="/logo.svg" alt="ICPWork Logo" className="w-36 " />
        </div>
      </nav>
      <div className="min-h-screen max-w-7xl mx-auto ">
        <div className="p-6">
          <div className="mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-10">Post A Job</h1>

            <div className="mb-8">
              <div className="flex w-full justify-between border-b overflow-x-auto px-5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 font-thin whitespace-nowrap transition-colors ${
                        activeTab === tab.id ? 'text-blue-600 border-b-2' : 'text-gray-600'
                      }`}
                      style={
                        activeTab === tab.id
                          ? {
                              borderBottom: '2px solid',
                              borderImage: 'linear-gradient(90deg, #44B0FF 0%, #973EEE 25%, #F12AE6 50%, #FF7039 75%, #F3BC3B 100%) 1'
                            }
                          : undefined
                      }
                    >
                      <Icon className="w-5 h-5" />
                      <span className="hidden md:flex">{tab.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="h-px bg-gray-200 -mt-px"></div>
            </div>

            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
