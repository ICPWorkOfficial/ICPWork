"use client";

import React, { useState } from 'react';
import { FileText, FolderOpen, DollarSign, Image, MoreHorizontal } from 'lucide-react';
import { serviceAPI, ServiceData } from '@/lib/service-api';
import { useLocalStorageAuth } from '@/hooks/useLocalStorageAuth';
import { ImageUploader } from '@/components/ImageUploader';
interface TabData {
  id: string;
  name: string;
  icon: any;
  mobileIcon: any;
}

const tabs: TabData[] = [
  { id: 'overview', name: 'Overview', icon: FileText, mobileIcon: FileText },
  { id: 'projects', name: 'Projects', icon: FolderOpen, mobileIcon: FolderOpen },
  { id: 'pricing', name: 'Pricing', icon: DollarSign, mobileIcon: DollarSign },
  { id: 'portfolio', name: 'Portfolio', icon: Image, mobileIcon: Image },
  { id: 'others', name: 'Others', icon: MoreHorizontal, mobileIcon: MoreHorizontal },
  { id: 'preview', name: 'Preview', icon: FileText, mobileIcon: FileText }
];

const tiers = ['Basic', 'Advanced', 'Premium'];

const previewImages = [
  'https://mirrorful-production.s3.us-west-1.amazonaws.com/patterns/files/40d474c8-8c9f-4f67-a0cd-268006eaeab0/figma-preview.jpg',
  'https://mirrorful-production.s3.us-west-1.amazonaws.com/patterns/files/40d474c8-8c9f-4f67-a0cd-268006eaeab0/figma-preview.jpg',
  'https://mirrorful-production.s3.us-west-1.amazonaws.com/patterns/files/40d474c8-8c9f-4f67-a0cd-268006eaeab0/figma-preview.jpg',
  'https://mirrorful-production.s3.us-west-1.amazonaws.com/patterns/files/40d474c8-8c9f-4f67-a0cd-268006eaeab0/figma-preview.jpg',
  'https://mirrorful-production.s3.us-west-1.amazonaws.com/patterns/files/40d474c8-8c9f-4f67-a0cd-268006eaeab0/figma-preview.jpg',
  'https://mirrorful-production.s3.us-west-1.amazonaws.com/patterns/files/40d474c8-8c9f-4f67-a0cd-268006eaeab0/figma-preview.jpg',
];

export function PreviewSection({ portfolioImages }: { portfolioImages: string[] }) {
  const [currentImage, setCurrentImage] = useState(0);
  const images = portfolioImages.length > 0 ? portfolioImages : previewImages;
  
  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  if (images.length === 0) {
    return (
      <section className="bg-gray-100 rounded-lg p-4">
        <div className="text-center py-8 text-gray-500">
          <Image className="mx-auto mb-2" size={48} />
          <p>No images uploaded yet</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-100 rounded-lg p-4">
      <div className="relative">
        <div className="overflow-hidden rounded-lg">
          <img src={images[currentImage]} alt="Preview" className="w-full h-auto" />
        </div>
        {images.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md" aria-label="Previous image">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md" aria-label="Next image">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {images.map((_, index) => (
            <button key={index} onClick={() => setCurrentImage(index)} className={`w-16 h-12 rounded-md overflow-hidden border-2 ${currentImage === index ? 'border-[#29aae1]' : 'border-transparent'}`}>
              <img src={images[index]} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default function ServiceRegisterPage() {
  const {user, isLoading: authLoading, isAuthenticated} = useLocalStorageAuth();
  console.log(user,"testing");
  
  const [activeTab, setActiveTab] = useState('overview');
  const [activeTier, setActiveTier] = useState('Basic'); // For mobile tier toggle
  const [formData, setFormData] = useState<any>({});
  const [projectTiers, setProjectTiers] = useState({
    Basic: { title: '', description: '', price: '' },
    Advanced: { title: '', description: '', price: '' },
    Premium: { title: '', description: '', price: '' }
  });
  const [additionalCharges, setAdditionalCharges] = useState([
    { name: '', price: '' }
  ]);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [questions, setQuestions] = useState([
    { question: '', answer: '', questionType: 'text', options: [''], isRequired: false }
  ]);

  const handleSave = async (tabId: string) => {
    try {
      console.log('Saving service data for tab:', tabId);
      // API call would go here
      
      // Move to next tab
      const currentTabIndex = tabs.findIndex(tab => tab.id === tabId);
      if (currentTabIndex < tabs.length - 1) {
        setActiveTab(tabs[currentTabIndex + 1].id);
      }
    } catch (error) {
      console.error('Failed to save service data:', error);
    }
  };

  const publishService = async () => {
    try {
      // Map UI form state to API shape expected by /api/service/publish
      const title = formData.serviceTitle || projectTiers?.Basic?.title || ''
      const description = formData.description || formData.serviceDescription || projectTiers?.Basic?.description || ''
      const rawPrice = projectTiers?.Basic?.price || projectTiers?.Advanced?.price || projectTiers?.Premium?.price || ''
      const price = rawPrice ? (rawPrice.toString().startsWith('$') ? rawPrice.toString() : `$${rawPrice}`) : ''
      const category = formData.mainCategory || ''
      const skills = formData.skills || formData.tags || []

      const apiPayload = {
        email:user?.email,
        title,
        description,
        price,
        category,
        skills,
        // keep a fallback full payload so backend that expects more fields still receives them
        meta: {
          overview: formData,
          projectTiers,
          additionalCharges,
          portfolioImages: portfolioImages,
          questions,
        }
      }

      const res = await fetch('/api/service/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(apiPayload),
      })

      const data = await res.json()
      if (data?.success) {
        // navigate to created service page using slug
        const serviceSlug = data.slug || data.id || data.serviceId || data._id;
        alert('Service published — Slug: ' + (serviceSlug || 'unknown'))
        
      } else {
        console.error('Publish failed:', data)
        alert('Failed to publish')
      }
    } catch (err) {
      console.error('Publish service error:', err)
      alert('Failed to publish service')
    }
  }

  const updateProjectTier = (tier: string, field: string, value: string) => {
    setProjectTiers(prev => ({
      ...prev,
      [tier]: {
        ...prev[tier as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const addAdditionalCharge = () => {
    setAdditionalCharges([...additionalCharges, { name: '', price: '' }]);
  };

  const updateAdditionalCharge = (index: number, field: string, value: string) => {
    const updated = [...additionalCharges];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalCharges(updated);
  };

  const removeAdditionalCharge = (index: number) => {
    if (additionalCharges.length > 1) {
      setAdditionalCharges(additionalCharges.filter((_, i) => i !== index));
    }
  };

  const handleImageUploadSuccess = (result: any) => {
    if (portfolioImages.length < 3) {
      setPortfolioImages([...portfolioImages, result.url]);
    }
  };

  const removeImage = (index: number) => {
    setPortfolioImages(portfolioImages.filter((_, i) => i !== index));
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', answer: '', questionType: 'text', options: [''], isRequired: false }]);
  };

  const updateQuestion = (index: number, field: string, value: string | boolean) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const addQuestionOption = (questionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options.push('');
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="rounded-lg p-6">
              <h3 className="text-lg mb-4 text-black pb-2">Service Overview</h3>
              <div className="space-y-4">
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <div>
                    <label className="text-[14px] font-medium text-[#6F6F6F] block">SERVICE TITLE</label>
                    <input
                      type="text"
                      value={formData.serviceTitle || ''}
                      onChange={(e) => setFormData({...formData, serviceTitle: e.target.value})}
                      placeholder="Enter your service title"
                      className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                    />
                  </div>
                </div>
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <div>
                    <label className="text-[14px] font-medium text-[#6F6F6F] block">MAIN CATEGORY</label>
                    <select
                      value={formData.mainCategory || ''}
                      onChange={(e) => setFormData({...formData, mainCategory: e.target.value})}
                      className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF] bg-white"
                    >
                      <option value="">Select main category</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile Development">Mobile Development</option>
                      <option value="Blockchain Development">Blockchain Development</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Writing">Writing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <div>
                    <label className="text-[14px] font-medium text-[#6F6F6F] block">SUB CATEGORY</label>
                    <select
                      value={formData.subCategory || ''}
                      onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                      className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF] bg-white"
                    >
                      <option value="">Select sub category</option>
                      <option value="Frontend Development">Frontend Development</option>
                      <option value="Backend Development">Backend Development</option>
                      <option value="Full Stack Development">Full Stack Development</option>
                      <option value="Smart Contracts">Smart Contracts</option>
                      <option value="DeFi Applications">DeFi Applications</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Logo Design">Logo Design</option>
                    </select>
                  </div>
                </div>
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <div>
                    <label className="text-[14px] font-medium text-[#6F6F6F] block">SERVICE DESCRIPTION</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe your service in detail"
                      rows={4}
                      className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                    />
                  </div>
                </div>
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <div>
                    <label className="text-[14px] font-medium text-[#6F6F6F] block">SKILLS (comma separated)</label>
                    <input
                      type="text"
                      value={formData.skillsInput || ''}
                      onChange={(e) => {
                        const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                        setFormData({...formData, skillsInput: e.target.value, skills: skills});
                      }}
                      placeholder="e.g., React, Node.js, MongoDB, TypeScript"
                      className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                    />
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleSave('overview')}
              className="w-40 py-3 bg-black text-white font-thin rounded-full hover:opacity-90 transition-opacity"
            >
              Next
            </button>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-6">
            <div className="rounded-lg p-6">
              <h3 className="text-lg font-bold text-black pb-2">Client Requirements</h3>
              <p className='text-gray-600 mb-4'>Please provide detailed information about your project requirements.</p>

              {/* Mobile Tier Toggle */}
              <div className="md:hidden mb-6">
                <div className="flex rounded-lg border overflow-hidden">
                  {tiers.map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setActiveTier(tier)}
                      className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                        activeTier === tier
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop: Three columns side by side */}
              <div className="hidden md:grid md:grid-cols-3 gap-6">
                {tiers.map((tier) => (
                  <div key={tier} className="space-y-4">
                    <h4 className="text-lg font-semibold text-center text-[#6F6F6F] py-4 px-2 bg-blue-100 shadow-lg rounded-2xl">{tier}</h4>
                    <div >
                      <div className="space-y-4">
                        <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white">
                          <label className="text-[14px] font-medium text-[#6F6F6F] block">TITLE</label>
                          <input
                            type="text"
                            value={projectTiers[tier as keyof typeof projectTiers].title}
                            onChange={(e) => updateProjectTier(tier, 'title', e.target.value)}
                            placeholder={`${tier} package title`}
                            className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                          />
                        </div>
                        <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white">
                          <label className="text-[14px] font-medium text-[#6F6F6F] block">DESCRIPTION</label>
                          <textarea
                            value={projectTiers[tier as keyof typeof projectTiers].description}
                            onChange={(e) => updateProjectTier(tier, 'description', e.target.value)}
                            rows={4}
                            placeholder={`Describe your ${tier.toLowerCase()} package`}
                            className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                          />
                        </div>
                        <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white">
                          <label className="text-[14px] font-medium text-[#6F6F6F] block">PRICE ($)</label>
                          <input
                            type="number"
                            value={projectTiers[tier as keyof typeof projectTiers].price}
                            onChange={(e) => updateProjectTier(tier, 'price', e.target.value)}
                            placeholder="0"
                            className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile: Single column with toggle */}
              <div className="md:hidden">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-center text-[#6F6F6F]">{activeTier}</h4>
                  <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[14px] font-medium text-[#6F6F6F] block">TITLE</label>
                        <input
                          type="text"
                          value={projectTiers[activeTier as keyof typeof projectTiers].title}
                          onChange={(e) => updateProjectTier(activeTier, 'title', e.target.value)}
                          placeholder={`${activeTier} package title`}
                          className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                        />
                      </div>
                      <div>
                        <label className="text-[14px] font-medium text-[#6F6F6F] block">DESCRIPTION</label>
                        <textarea
                          value={projectTiers[activeTier as keyof typeof projectTiers].description}
                          onChange={(e) => updateProjectTier(activeTier, 'description', e.target.value)}
                          rows={4}
                          placeholder={`Describe your ${activeTier.toLowerCase()} package`}
                          className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                        />
                      </div>
                      <div>
                        <label className="text-[14px] font-medium text-[#6F6F6F] block">PRICE ($)</label>
                        <input
                          type="number"
                          value={projectTiers[activeTier as keyof typeof projectTiers].price}
                          onChange={(e) => updateProjectTier(activeTier, 'price', e.target.value)}
                          placeholder="0"
                          className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleSave('projects')}
              className="w-40 py-3 bg-black text-white font-thin rounded-full hover:opacity-90 transition-opacity"
            >
              Next
            </button>
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-6">
            <div className="rounded-lg p-6">
              <h3 className="text-lg  text-black font-bold pb-2">Additional Charges</h3>
              <p className='text-gray-600 mb-4'>Specify any additional charges that may apply to this project.</p>
              <div className="space-y-4">
                {additionalCharges.map((charge, index) => (
                  <div key={index} >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        {/* <h4 className="text-sm font-medium text-[#6F6F6F]">Additional Charge {index + 1}</h4> */}
                        {additionalCharges.length > 1 && (
                          <button
                            onClick={() => removeAdditionalCharge(index)}
                            className="px-3 py-1 border-2 text-3xl border-red-500 text-red-500 rounded-full text-sm hover:bg-red-600"
                          >
                          Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                          <label className="text-[14px] font-medium text-[#6F6F6F] block">SERVICE NAME</label>
                          <input
                            type="text"
                            value={charge.name}
                            onChange={(e) => updateAdditionalCharge(index, 'name', e.target.value)}
                            placeholder="e.g., Fast Delivery"
                            className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                          />
                        </div>
                        <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                          <label className="text-[14px] font-medium text-[#6F6F6F] block">PRICE ($)</label>
                          <input
                            type="number"
                            value={charge.price}
                            onChange={(e) => updateAdditionalCharge(index, 'price', e.target.value)}
                            placeholder="0"
                            className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addAdditionalCharge}
                  className="w-40 py-3 bg-gray-200 text-gray-700 font-thin rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="text-xl">+</span>
                  Add Charge
                </button>
              </div>
            </div>
            <button
              onClick={() => handleSave('pricing')}
              className="w-40 py-3 bg-black text-white font-thin rounded-full hover:opacity-90 transition-opacity"
            >
              Next
            </button>
          </div>
        );

      case 'portfolio':
        return (
          <div className="space-y-6">
            <div className="rounded-lg p-6">
              <h3 className="text-lg mb-4 text-black pb-2">Portfolio Images</h3>
              <div className="space-y-4">
                <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                  <div>
                    <label className="text-[14px] font-medium text-[#6F6F6F] block mb-2">UPLOAD IMAGES (2-3 images max)</label>
                    <ImageUploader
                      userId={user?.email || 'anonymous'}
                      folder="portfolio-images"
                      maxFiles={3 - portfolioImages.length}
                      onUploadSuccess={handleImageUploadSuccess}
                      onUploadError={(error) => {
                        console.error('Portfolio image upload failed:', error);
                      }}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {portfolioImages.length}/3 images uploaded
                    </p>
                  </div>
                </div>

                {/* Image Preview */}
                {portfolioImages.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolioImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg border"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => handleSave('portfolio')}
              className="w-40 py-3 bg-black text-white font-thin rounded-full hover:opacity-90 transition-opacity"
            >
              Next
            </button>
          </div>
        );

      case 'others':
        return (
          <div className="space-y-6">
            <div className="rounded-lg p-6">
              <h3 className="text-xl  text-black font-bold ">Client Requirements & Questions</h3>
              <p className="text-gray-600 mb-6">Please provide any specific requirements, questions, and their expected answers for this project.</p>
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={index} className="rounded-xl border-[0.6px] border-[#8D8D8D] p-4 bg-white max-w-[700px] w-full mb-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-[#6F6F6F]">Question {index + 1}</h4>
                        {questions.length > 1 && (
                          <button
                            onClick={() => removeQuestion(index)}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="text-[14px] font-medium text-[#6F6F6F] block">QUESTION</label>
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                          placeholder="Enter your question"
                          className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                        />
                      </div>
                      <div>
                        <label className="text-[14px] font-medium text-[#6F6F6F] block">ANSWER</label>
                        <textarea
                          value={question.answer}
                          onChange={(e) => updateQuestion(index, 'answer', e.target.value)}
                          placeholder="Enter the answer or expected response"
                          rows={3}
                          className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                        />
                      </div>
                      <div>
                        <label className="text-[14px] font-medium text-[#6F6F6F] block">ANSWER TYPE</label>
                        <select
                          value={question.questionType}
                          onChange={(e) => updateQuestion(index, 'questionType', e.target.value)}
                          className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF] bg-white"
                        >
                          <option value="text">Text Answer</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="dropdown">Dropdown</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`required-${index}`}
                          checked={question.isRequired}
                          onChange={(e) => updateQuestion(index, 'isRequired', e.target.checked)}
                          className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={`required-${index}`} className="text-[14px] font-medium text-[#6F6F6F]">
                          Required Question
                        </label>
                      </div>
                      
                      {(question.questionType === 'checkbox' || question.questionType === 'dropdown') && (
                        <div>
                          <label className="text-[14px] font-medium text-[#6F6F6F] block mb-2">OPTIONS</label>
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateQuestionOption(index, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="flex-1 p-3 rounded border border-transparent focus:border-[#44B0FF]"
                              />
                              {question.options.length > 1 && (
                                <button
                                  onClick={() => {
                                    const updated = [...questions];
                                    updated[index].options = updated[index].options.filter((_, i) => i !== optionIndex);
                                    setQuestions(updated);
                                  }}
                                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => addQuestionOption(index)}
                            className="text-blue-600 text-sm hover:text-blue-800"
                          >
                            + Add Option
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addQuestion}
                  className="w-40 py-3 bg-gray-200 text-gray-700 font-thin rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="text-xl">+</span>
                  Add Question
                </button>
              </div>
            </div>
            <button
              onClick={() => handleSave('others')}
              className="w-40 py-3 bg-black text-white font-thin rounded-full hover:opacity-90 transition-opacity"
            >
              Submit Service
            </button>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="rounded-lg p-6 bg-white">
              <div className="max-w-7xl mx-auto">
                <div className="w-full bg-white border-b border-gray-200 py-4">
                  <div className="max-w-7xl mx-auto px-4 flex items-center">
                    <div className="flex items-center">
                      <svg
                        width="40"
                        height="28"
                        viewBox="0 0 40 28"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M29.9991 0L19.9991 16.9999L10 0H0L19.9991 27.9999L40 0H29.9991Z"
                          fill="url(#paint0_linear)"
                        />
                        <defs>
                          <linearGradient
                            id="paint0_linear"
                            x1="20"
                            y1="0"
                            x2="20"
                            y2="28"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="#FF5757" />
                            <stop offset="1" stopColor="#8C52FF" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className="ml-2 text-[#041d37] font-bold text-xl">ICPWork</span>
                    </div>
                    <div className="ml-auto">
                      <button className="bg-[#041d37] text-white px-4 py-2 rounded-md font-medium">
                        <div className="flex items-center">Publish</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main preview content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Description Section */}
                <section className="mt-0 bg-white rounded-xl p-6 border">
                  <h2 className="text-xl font-medium text-[#33363a] mb-4">Description</h2>
                  <PreviewSection portfolioImages={portfolioImages} />

                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-[#33363a] mb-3">Service Title</h3>
                    <p className="text-[#33363a] mb-4">
                      {formData.serviceTitle || 'No service title provided'}
                    </p>
                    
                    <h3 className="text-lg font-medium text-[#33363a] mb-3">Service Description</h3>
                    <p className="text-[#33363a] mb-4">
                      {formData.description || formData.serviceDescription || 'No description provided'}
                    </p>

                    <h3 className="text-lg font-medium text-[#33363a] mb-3">Category</h3>
                    <p className="text-[#33363a] mb-4">
                      {formData.mainCategory && formData.subCategory 
                        ? `${formData.mainCategory} / ${formData.subCategory}`
                        : formData.mainCategory || 'No category selected'
                      }
                    </p>

                    {formData.skills && formData.skills.length > 0 && (
                      <>
                        <h3 className="text-lg font-medium text-[#33363a] mb-3">Skills</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {formData.skills.map((skill: string, index: number) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </>
                    )}

                    {formData.tags && formData.tags.length > 0 && (
                      <>
                        <h3 className="text-lg font-medium text-[#33363a] mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {formData.tags.map((tag: string, index: number) => (
                            <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Pricing cards */}
                  <div className="mt-12">
                    <h3 className="text-xl font-medium text-[#33363a] mb-6">Pricing Packages</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {tiers.map((t, idx) => {
                        const pkg = projectTiers[t as keyof typeof projectTiers];
                        const hasContent = pkg?.title || pkg?.description || pkg?.price;
                        
                        if (!hasContent) {
                          return (
                            <div key={t} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                              <h3 className="text-lg font-medium mb-2 text-gray-500">{t} Package</h3>
                              <div className="text-3xl font-bold text-gray-400 mb-4">
                                Not configured
                              </div>
                              <p className="text-sm text-gray-500 mb-6">No details provided for this package</p>
                              <button className="w-full bg-gray-300 text-gray-500 py-3 rounded-md font-medium cursor-not-allowed" disabled>
                                Not Available
                              </button>
                            </div>
                          );
                        }

                        const price = pkg?.price || '0';
                        const title = pkg?.title || `${t} Package`;
                        const desc = pkg?.description || 'Package details not provided';
                        
                        return (
                          <div key={t} className="border border-gray-200 rounded-lg p-6 bg-white">
                            <h3 className="text-lg font-medium mb-2">{title}</h3>
                            <div className="text-3xl font-bold text-[#33363a] mb-4">
                              ${price}
                              <span className="text-lg font-normal">/project</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-6">{desc}</p>
                            <div className="mb-6">
                              <h4 className="font-medium mb-3">Package includes:</h4>
                              <ul className="space-y-2">
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-[#10b981] mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span>Custom {t.toLowerCase()} solution</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-[#10b981] mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span>Professional quality delivery</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-[#10b981] mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span>Timely delivery</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-[#10b981] mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span>Support & revisions</span>
                                </li>
                              </ul>
                            </div>
                            <button className="w-full bg-[#041d37] text-white py-3 rounded-md font-medium">Select Plan</button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </section>

  
              </div>

              {/* Right column */}
              <aside className="space-y-6">
                <div className="bg-white rounded-xl p-4 border">
                  <h4 className="font-medium mb-3">Service Overview</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Title:</span>
                      <p className="text-sm text-gray-800">{formData.serviceTitle || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Category:</span>
                      <p className="text-sm text-gray-800">
                        {formData.mainCategory && formData.subCategory 
                          ? `${formData.mainCategory} / ${formData.subCategory}`
                          : formData.mainCategory || 'Not selected'
                        }
                      </p>
                    </div>
                    {formData.skills && formData.skills.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Skills:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.skills.slice(0, 3).map((skill: string, index: number) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                          {formData.skills.length > 3 && (
                            <span className="text-xs text-gray-500">+{formData.skills.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border">
                  <h4 className="font-medium mb-3">Pricing Summary</h4>
                  <div className="space-y-2">
                    {tiers.map((tier) => {
                      const pkg = projectTiers[tier as keyof typeof projectTiers];
                      if (pkg?.price) {
                        return (
                          <div key={tier} className="flex justify-between items-center py-1">
                            <span className="text-sm text-gray-600">{tier}:</span>
                            <span className="text-sm font-medium">${pkg.price}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border">
                  <h4 className="font-medium mb-3">Additional Charges</h4>
                  {additionalCharges.filter(c => c.name && c.price).length > 0 ? (
                    <div className="space-y-2">
                      {additionalCharges.filter(c => c.name && c.price).map((c, i) => (
                        <div key={i} className="flex justify-between items-center py-1">
                          <span className="text-sm text-gray-600">{c.name}</span>
                          <span className="text-sm font-medium">${c.price}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No additional charges</div>
                  )}
                </div>

                <div className="bg-white rounded-xl p-4 border">
                  <h4 className="font-medium mb-3">Client Questions & Answers</h4>
                  {questions.filter(q => q.question).length > 0 ? (
                    <div className="space-y-3">
                      {questions.filter(q => q.question).map((q, i) => (
                        <div key={i} className="py-2 border-b border-gray-100 last:border-b-0">
                          <div className="text-sm font-medium text-gray-800 mb-1">
                            Q{i + 1}: {q.question}
                            {q.isRequired && <span className="text-red-500 ml-1">*</span>}
                          </div>
                          {q.answer && (
                            <div className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">Answer:</span> {q.answer}
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            Type: {q.questionType}
                            {q.options && q.options.length > 0 && q.options[0] && (
                              <span className="ml-2">({q.options.length} options)</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No questions added</div>
                  )}
                </div>

                <div className="bg-white rounded-xl p-4 border">
                  <h4 className="font-medium mb-3">Portfolio</h4>
                  <div className="text-sm text-gray-600">
                    {portfolioImages.length > 0 ? (
                      <div>
                        <p>{portfolioImages.length} image{portfolioImages.length !== 1 ? 's' : ''} uploaded</p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {portfolioImages.slice(0, 4).map((img, index) => (
                            <img key={index} src={img} alt={`Portfolio ${index + 1}`} className="w-full h-16 object-cover rounded" />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No images uploaded</p>
                    )}
                  </div>
                </div>
              </aside>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setActiveTab('others')} className="w-40 py-3 bg-gray-200 text-gray-700 font-thin rounded-full">Back</button>
              <button onClick={publishService} className="w-40 py-3 bg-black text-white font-thin rounded-full">Publish</button>
            </div>
          </div>
        )

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
        
      {/* Content Area */}
      <div className="p-6">
        <div className="mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-10">Add Your Service</h1>

          {/* Tabs */}
          <div className="mb-8">
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
    </div></div>
  );
}
