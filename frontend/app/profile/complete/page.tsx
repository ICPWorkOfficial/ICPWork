"use client";

import React, { useState, useEffect } from 'react';
import { User, Globe, GraduationCap, Briefcase, MoreHorizontal, Eye, X } from 'lucide-react';

interface ProfileData {
  id: string;
  status: string;
  personal: {
    name: string;
    title: string;
    about: string;
    profileImage: string;
    socials: any[];
  };
  skills: string[];
  education: any[];
  workExperience: any[];
}

interface TabData {
  id: string;
  name: string;
  icon: any;
  mobileIcon: any;
}

const tabs: TabData[] = [
  { id: 'about', name: 'About', icon: User, mobileIcon: User },
  { id: 'social', name: 'Social', icon: Globe, mobileIcon: Globe },
  { id: 'education', name: 'Education', icon: GraduationCap, mobileIcon: GraduationCap },
  { id: 'work', name: 'Work Experience', icon: Briefcase, mobileIcon: Briefcase },
  { id: 'others', name: 'Others', icon: MoreHorizontal, mobileIcon: MoreHorizontal }
];

export default function CompleteProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [activeTab, setActiveTab] = useState('about');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [educationEntries, setEducationEntries] = useState([
    { institution: '', degree: '', startYear: '', endYear: '' }
  ]);
  const [workEntries, setWorkEntries] = useState([
    { jobTitle: '', company: '', jobDescription: '', startYear: '', endYear: '' }
  ]);
  const [socialLinks, setSocialLinks] = useState([
    { platform: '', url: '' }
  ]);
  const [languages, setLanguages] = useState([
    { language: '', proficiency: '' }
  ]);

  useEffect(() => {
    // Fetch p4 profile data
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile?id=p4');
        const result = await response.json();
        if (result.ok && result.profile) {
          setProfileData(result.profile);
          setFormData({
            name: result.profile.personal.name || '',
            title: result.profile.personal.title || '',
            about: result.profile.personal.about || '',
            skills: result.profile.skills || [],
            education: result.profile.education || [],
            workExperience: result.profile.workExperience || []
          });
          setEducationEntries(result.profile.education && result.profile.education.length > 0 
            ? result.profile.education 
            : [{ institution: '', degree: '', startYear: '', endYear: '' }]
          );
          setWorkEntries(result.profile.workExperience && result.profile.workExperience.length > 0 
            ? result.profile.workExperience.map((work: any) => ({
                jobTitle: work.designation || '',
                company: work.company || '',
                jobDescription: work.description || '',
                startYear: '',
                endYear: ''
              }))
            : [{ jobTitle: '', company: '', jobDescription: '', startYear: '', endYear: '' }]
          );
          setSocialLinks(result.profile.personal.socials && result.profile.personal.socials.length > 0 
            ? result.profile.personal.socials.map((social: any) => ({
                platform: social.platform || '',
                url: social.url || ''
              }))
            : [{ platform: '', url: '' }]
          );
          setLanguages([{ language: '', proficiency: '' }]);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (tabId: string) => {
    try {
      let dataToSave = formData;
      if (tabId === 'about') {
        // Convert skillsText to skills array
        const skillsArray = formData.skillsText ? formData.skillsText.split(',').map((skill: string) => skill.trim()).filter((skill: string) => skill) : [];
        dataToSave = { ...formData, skills: skillsArray };
      } else if (tabId === 'education') {
        dataToSave = { ...formData, education: educationEntries };
      } else if (tabId === 'work') {
        dataToSave = { ...formData, workExperience: workEntries };
      } else if (tabId === 'social') {
        dataToSave = { ...formData, socialLinks: socialLinks };
      } else if (tabId === 'others') {
        dataToSave = { ...formData, languages: languages };
      }
      
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: 'p4',
          tab: tabId,
          data: dataToSave
        })
      });

      if (response.ok) {
        console.log('Profile data saved successfully');
        
        // Move to next tab
        const currentTabIndex = tabs.findIndex(tab => tab.id === tabId);
        if (currentTabIndex < tabs.length - 1) {
          setActiveTab(tabs[currentTabIndex + 1].id);
        }
      }
    } catch (error) {
      console.error('Failed to save profile data:', error);
    }
  };

  const addEducationEntry = () => {
    setEducationEntries([...educationEntries, { institution: '', degree: '', startYear: '', endYear: '' }]);
  };

  const updateEducationEntry = (index: number, field: string, value: string) => {
    const updated = [...educationEntries];
    updated[index] = { ...updated[index], [field]: value };
    setEducationEntries(updated);
  };

  const removeEducationEntry = (index: number) => {
    if (educationEntries.length > 1) {
      setEducationEntries(educationEntries.filter((_, i) => i !== index));
    }
  };

  const addWorkEntry = () => {
    setWorkEntries([...workEntries, { jobTitle: '', company: '', jobDescription: '', startYear: '', endYear: '' }]);
  };

  const updateWorkEntry = (index: number, field: string, value: string) => {
    const updated = [...workEntries];
    updated[index] = { ...updated[index], [field]: value };
    setWorkEntries(updated);
  };

  const removeWorkEntry = (index: number) => {
    if (workEntries.length > 1) {
      setWorkEntries(workEntries.filter((_, i) => i !== index));
    }
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }]);
  };

  const updateSocialLink = (index: number, field: string, value: string) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  };

  const removeSocialLink = (index: number) => {
    if (socialLinks.length > 1) {
      setSocialLinks(socialLinks.filter((_, i) => i !== index));
    }
  };

  const addLanguage = () => {
    setLanguages([...languages, { language: '', proficiency: '' }]);
  };

  const updateLanguage = (index: number, field: string, value: string) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [field]: value };
    setLanguages(updated);
  };

  const removeLanguage = (index: number) => {
    if (languages.length > 1) {
      setLanguages(languages.filter((_, i) => i !== index));
    }
  };

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div className="space-y-6">
            <div className="rounded-lg p-6">
              <h3 className="text-lg mb-4 text-black pb-2">Basic Information</h3>
              <div className="space-y-4">
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <div>
                    <label className="text-[14px] font-medium text-[#6F6F6F] block">FULL NAME</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter your full name"
                      className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                    />
                  </div>
                </div>
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <div>
                    <label className="text-[14px] font-medium text-[#6F6F6F] block">JOB ROLE</label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Senior Smart Contract Developer"
                      className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                    />
                  </div>
                </div>
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <div>
                    <label className="text-[14px] font-medium text-[#6F6F6F] block">JOB DESCRIPTION</label>
                    <textarea
                      value={formData.about || ''}
                      onChange={(e) => setFormData({...formData, about: e.target.value})}
                      rows={4}
                      placeholder="Tell us about yourself and your expertise"
                      className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                    />
                  </div>
                </div>
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <div>
                    <label className="text-[14px] font-medium text-[#6F6F6F] block">SKILLS (2-5 SKILLS)</label>
                    <input
                      type="text"
                      value={formData.skillsText || ''}
                      onChange={(e) => setFormData({...formData, skillsText: e.target.value})}
                      placeholder="e.g., Solidity, React, TypeScript"
                      className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                    />
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleSave('about')}
              className="w-40 py-3 bg-black text-white font-thin rounded-full hover:opacity-90 transition-opacity"
            >
              Next
            </button>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-6">
            <div className="rounded-lg p-6">
              <h3 className="text-lg mb-4 text-black pb-2">Social & Portfolio</h3>
              <div className="space-y-4">
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <div>
                    <label className="text-[14px] font-medium text-[#6F6F6F] block">PORTFOLIO LINK</label>
                    <input
                      type="url"
                      value={formData.portfolioLink || ''}
                      onChange={(e) => setFormData({...formData, portfolioLink: e.target.value})}
                      placeholder="https://your-portfolio.com"
                      className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-[#6F6F6F]">SOCIAL LINKS</h4>
                  {socialLinks.map((link, index) => (
                    <div key={index} className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="text-[14px] font-medium text-[#6F6F6F] block">PLATFORM</label>
                          <select
                            value={link.platform}
                            onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                            className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF] bg-white"
                          >
                            <option value="">Select platform</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="GitHub">GitHub</option>
                            <option value="Twitter">Twitter</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="text-[14px] font-medium text-[#6F6F6F] block">URL</label>
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                            placeholder="https://..."
                            className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                          />
                        </div>
                        {socialLinks.length > 1 && (
                          <button
                            onClick={() => removeSocialLink(index)}
                            className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={addSocialLink}
                    className="w-40 py-3 bg-gray-200 text-gray-700 font-thin rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">+</span>
                    Add More
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleSave('social')}
              className="w-40 py-3 bg-black text-white font-thin rounded-full hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-6">
            <div className="rounded-lg p-6">
              <h3 className="text-lg mb-4 text-black pb-2">Education</h3>
              <div className="space-y-6">
                {educationEntries.map((entry, index) => (
                  <div key={index} className="space-y-4 border-b pb-6 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-gray-700">Education #{index + 1}</h4>
                      {educationEntries.length > 1 && (
                        <button
                          onClick={() => removeEducationEntry(index)}
                          className="text-red-500 text-sm hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white max-w-[700px] w-full mb-4">
                      <div>
                        <label className="text-[14px] font-medium text-[#6F6F6F] block">SCHOOL</label>
                        <input 
                          type="text" 
                          value={entry.institution}
                          onChange={(e) => updateEducationEntry(index, 'institution', e.target.value)}
                          placeholder='Enter School Name' 
                          className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]" 
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white max-w-[700px] w-full mb-4">
                      <div>
                        <label className="text-[14px] font-medium text-[#6F6F6F] block">DEGREE</label>
                        <input 
                          type="text" 
                          value={entry.degree}
                          onChange={(e) => updateEducationEntry(index, 'degree', e.target.value)}
                          placeholder="e.g., Bachelor of Computer Science" 
                          className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white w-full mb-4">
                        <div>
                          <label className="text-[14px] font-medium text-[#6F6F6F] block">START YEAR</label>
                          <input 
                            type="text" 
                            value={entry.startYear}
                            onChange={(e) => updateEducationEntry(index, 'startYear', e.target.value)}
                            placeholder="e.g., 2016" 
                            className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]" 
                          />
                        </div>
                      </div>

                      <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white w-full mb-4">
                        <div>
                          <label className="text-[14px] font-medium text-[#6F6F6F] block">END YEAR</label>
                          <input 
                            type="text" 
                            value={entry.endYear}
                            onChange={(e) => updateEducationEntry(index, 'endYear', e.target.value)}
                            placeholder="e.g., 2020" 
                            className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addEducationEntry}
                  className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 hover:text-gray-800 transition-colors"
                >
                  + Add Another Education
                </button>
              </div>
            </div>
            <button
              onClick={() => handleSave('education')}
              className="w-40 py-3 bg-black text-white font-thin rounded-full hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </div>
        );

      case 'work':
        return (
          <div className="space-y-6">
            <div className="rounded-lg p-6">
              <h3 className="text-lg mb-4 text-black pb-2">Work Experience</h3>
              <div className="space-y-4">
                {workEntries.map((work, index) => (
                  <div key={index} className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-[#6F6F6F]">Work Experience {index + 1}</h4>
                        {workEntries.length > 1 && (
                          <button
                            onClick={() => removeWorkEntry(index)}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="text-[14px] font-medium text-[#6F6F6F] block">JOB TITLE</label>
                        <input
                          type="text"
                          value={work.jobTitle}
                          onChange={(e) => updateWorkEntry(index, 'jobTitle', e.target.value)}
                          placeholder="e.g., Smart Contract Developer"
                          className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                        />
                      </div>
                      <div>
                        <label className="text-[14px] font-medium text-[#6F6F6F] block">COMPANY</label>
                        <input
                          type="text"
                          value={work.company}
                          onChange={(e) => updateWorkEntry(index, 'company', e.target.value)}
                          placeholder="Company name"
                          className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[14px] font-medium text-[#6F6F6F] block">START YEAR</label>
                          <input
                            type="number"
                            value={work.startYear}
                            onChange={(e) => updateWorkEntry(index, 'startYear', e.target.value)}
                            placeholder="2020"
                            className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                          />
                        </div>
                        <div>
                          <label className="text-[14px] font-medium text-[#6F6F6F] block">END YEAR</label>
                          <input
                            type="number"
                            value={work.endYear}
                            onChange={(e) => updateWorkEntry(index, 'endYear', e.target.value)}
                            placeholder="2023"
                            className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[14px] font-medium text-[#6F6F6F] block">DESCRIPTION</label>
                        <textarea
                          value={work.jobDescription}
                          onChange={(e) => updateWorkEntry(index, 'jobDescription', e.target.value)}
                          rows={3}
                          placeholder="Describe your role and achievements"
                          className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addWorkEntry}
                  className="w-40 py-3 bg-gray-200 text-gray-700 font-thin rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="text-xl">+</span>
                  Add Work
                </button>
              </div>
            </div>
            <button
              onClick={() => handleSave('work')}
              className="w-40 py-3 bg-black text-white font-thin rounded-full hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </div>
        );

      case 'others':
        return (
          <div className="space-y-6">
            <div className="rounded-lg p-6">
              <h3 className="text-lg mb-4 text-black pb-2">Additional Information</h3>
              <div className="space-y-4">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-[#6F6F6F]">LANGUAGES</h4>
                  {languages.map((lang, index) => (
                    <div key={index} className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h5 className="text-sm font-medium text-[#6F6F6F]">Language {index + 1}</h5>
                          {languages.length > 1 && (
                            <button
                              onClick={() => removeLanguage(index)}
                              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[14px] font-medium text-[#6F6F6F] block">LANGUAGE</label>
                            <select
                              value={lang.language}
                              onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                              className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF] bg-white"
                            >
                              <option value="">Select language</option>
                              <option value="English">English</option>
                              <option value="Spanish">Spanish</option>
                              <option value="French">French</option>
                              <option value="German">German</option>
                              <option value="Chinese">Chinese</option>
                              <option value="Japanese">Japanese</option>
                              <option value="Korean">Korean</option>
                              <option value="Portuguese">Portuguese</option>
                              <option value="Italian">Italian</option>
                              <option value="Russian">Russian</option>
                              <option value="Arabic">Arabic</option>
                              <option value="Hindi">Hindi</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[14px] font-medium text-[#6F6F6F] block">PROFICIENCY</label>
                            <select
                              value={lang.proficiency}
                              onChange={(e) => updateLanguage(index, 'proficiency', e.target.value)}
                              className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF] bg-white"
                            >
                              <option value="">Select proficiency</option>
                              <option value="Native">Native</option>
                              <option value="Fluent">Fluent</option>
                              <option value="Conversational">Conversational</option>
                              <option value="Basic">Basic</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={addLanguage}
                    className="w-40 py-3 bg-gray-200 text-gray-700 font-thin rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">+</span>
                    Add Language
                  </button>
                </div>
                
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <div>
                    <label className="text-[14px] font-medium text-[#6F6F6F] block">ADDITIONAL NOTES</label>
                    <textarea
                      value={formData.additionalNotes || ''}
                      onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                      rows={3}
                      placeholder="Any additional information you'd like to share"
                      className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                    />
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleSave('others')}
              className="w-40 py-3 bg-black text-white font-thin rounded-full hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen ">
      {/* Mobile Preview Modal */}
      {showMobilePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 md:hidden">
          <div className="bg-white rounded-lg w-full  max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Profile Preview</h3>
              <button onClick={() => setShowMobilePreview(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <ProfileSidebar profileData={profileData} formData={formData} />
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-80 bg-white ">
        <div className="border border-gray-100 m-4 rounded-lg shadow-lg h-[95vh]">
          <ProfileSidebar profileData={profileData} formData={formData} />
        </div></div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Header */}
          <div className="md:hidden bg-white border-b p-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Complete Profile</h1>
            <button
              onClick={() => setShowMobilePreview(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>

          {/* Content Area */}
          <div className="p-6">
            <div className=" mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 mb-10">Complete Your Profile</h1>

              {/* Tabs */}
              <div className="mb-8 ">
                <div className="flex w-full justify-between border-b overflow-x-auto px-5">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const MobileIcon = tab.mobileIcon;
                    return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 font-thin whitespace-nowrap transition-colors ${
                            activeTab === tab.id
                                ? 'text-blue-600 border-b-2'
                                : 'text-gray-600'
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
                        <span className="md:hidden">
                            <MobileIcon className="w-5 h-5" />
                        </span>
                        <span className="hidden md:flex items-center gap-2">
                            <Icon className="w-5 h-5" />
                            {tab.name}
                        </span>
                    </button>
                    );
                  })}
                </div>
                {/* Connecting line under tabs */}
                <div className="h-px bg-gray-200 -mt-px"></div>
              </div>

              {/* Tab Content */}
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSidebar({ profileData, formData }: { profileData: any; formData: any }) {
  return (
    <div className="p-6">
      {/* Logo */}
    <div className="flex flex-col items-center ">
      <img src="/logo.svg" alt="ICPWork Logo" className="w-36 h-24 mb-2" />
      
    </div>

      {/* User Info */}
      <div className="text-center mb-6">
        <img
          src={profileData.personal.profileImage}
          alt="Profile"
          className="w-20 h-20 rounded-full mx-auto  object-cover"
        />
        <h3 className="font-semibold text-gray-900">{formData.name || profileData.personal.name || 'Your Name'}</h3>
        {/* <p className="text-sm text-gray-600 mt-1">{formData.title || 'Your Title'}</p> */}
      </div>

      {/* Toggle Available for Work */}
      <div className="mb-2 px-3 b rounded-lg">
        <div className="flex items-center gap-2 ">
            <button className="w-10 h-6 bg-green-500 rounded-full relative">
            <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
          </button>
          <span className="text-sm font-medium text-gray-700">Available for Work</span>
          
        </div>
      </div>

      <hr className="mb-4" />

      {/* Job Role Section */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-1">JOB ROLE</h4>
          <p className="text-md text-black mt-5">{formData.title || 'Not specified'}</p>
        </div>

        <hr />

        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-1">JOB DESCRIPTION</h4>
          <p className="text-md text-black mt-5">{formData.about || 'Not specified'}</p>
        </div>

        <hr />

        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-1">SKILLS</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {(formData.skillsText ? formData.skillsText.split(',').map((s: string) => s.trim()).slice(0, 5) : profileData.skills.slice(0, 5)).map((skill: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
