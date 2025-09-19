"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, ChevronRight, Star, Github, Linkedin, Twitter, Globe } from 'lucide-react';

// Types
interface Social {
  platform: string;
  url: string;
  icon: string;
}

interface Personal {
  name: string;
  title: string;
  description: string;
  about: string;
  profileImage: string;
  socials: Social[];
}

interface Stats {
  companiesServed: number;
  projectsDone: number;
  hackathonsParticipated: number;
}

interface WorkExperience {
  id: number;
  designation: string;
  company: string;
  description: string;
  duration: string;
  timeWorked: string;
}

interface Service {
  id: number;
  title: string;
  image: string;
  personName: string;
  description: string;
  rating: number;
  price: string;
}

interface Review {
  id: number;
  text: string;
  reviewer: string;
  designation: string;
}

interface PortfolioWork {
  id: number;
  title: string;
  image: string;
  description: string;
}

interface ProfileData {
  personal: Personal;
  skills: string[];
  stats: Stats;
  workExperience: WorkExperience[];
  services: Service[];
  reviews: Review[];
  portfolio: PortfolioWork[];
  status?: string;
}

// Social icons mapping
const SocialIcons: { [key: string]: any } = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  globe: Globe
};

// Transform user data from API to profile format
function transformUserDataToProfile(userData: any): ProfileData {
  // Helper function to get first value from array or return empty string
  const getFirstValue = (arr: any[] | undefined): string => {
    return Array.isArray(arr) && arr.length > 0 ? arr[0] : '';
  };

  const firstName = getFirstValue(userData.firstName);
  const lastName = getFirstValue(userData.lastName);
  const fullName = `${firstName} ${lastName}`.trim() || userData.email;
  
  return {
    personal: {
      name: fullName,
      title: getFirstValue(userData.description) || 'Professional',
      description: getFirstValue(userData.description) || 'No description available',
      about: getFirstValue(userData.description) || 'No about information available',
      profileImage: '/caffine.png', // Default profile image
      socials: [
        {
          platform: 'linkedin',
          url: getFirstValue(userData.linkedinProfile) || '#',
          icon: 'linkedin'
        }
      ]
    },
    skills: userData.skills || [],
    stats: {
      companiesServed: 0,
      projectsDone: 0,
      hackathonsParticipated: 0
    },
    workExperience: [
      {
        id: 1,
        designation: 'Web Developer',
        company: getFirstValue(userData.companyName) || 'Freelancer',
        description: getFirstValue(userData.description) || 'Professional web development services',
        duration: '2023 - Present',
        timeWorked: '1+ years'
      }
    ],
    services: [
      {
        id: 1,
        title: 'Web Development',
        image: '/caffine.png',
        personName: fullName,
        description: getFirstValue(userData.description) || 'Professional web development services',
        rating: 5,
        price: '$50/hr'
      }
    ],
    reviews: [
      {
        id: 1,
        text: 'Great work! Very professional and delivered on time.',
        reviewer: 'Client Name',
        designation: 'Project Manager'
      }
    ],
    portfolio: [
      {
        id: 1,
        title: 'Sample Project',
        image: '/caffine.png',
        description: 'A sample project showcasing web development skills'
      }
    ],
    status: 'complete'
  };
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [draftPersonal, setDraftPersonal] = useState<Personal | null>(null);
  const [openedId, setOpenedId] = useState('');
  const [currentReview, setCurrentReview] = useState(0);
  const [currentWork, setCurrentWork] = useState(0);
  const [currentService, setCurrentService] = useState(0);
  const [currentExperience, setCurrentExperience] = useState(0);
  const auth = useAuth();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    // Fetch profile data (support ?id= query param)
    const fetchProfile = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        let id = params.get('id');
        // fallback: support /profile/:id path
        if (!id) {
          const m = window.location.pathname.match(/\/profile\/(.+?)(?:\/|$)/);
          if (m) id = decodeURIComponent(m[1]);
        }
        
        let response;
        if (id) {
          response = await fetch(`/api/profile?id=${encodeURIComponent(id)}`);
        } else {
          // Use the profile API which handles session authentication
          response = await fetch('/api/profile');
        }

        if (response) {
          const result = await response.json();
          // API may return { success: true, profile } or { ok, profiles } or { ok, profile } or legacy { ok, data }
          if (result.success && result.profile) {
            setProfileData(result.profile);
          } else if (result.ok) {
            if (result.profile) setProfileData(result.profile);
            else if (result.profiles) setProfileData(result.profiles[0] || null);
            else if (result.data) setProfileData(result.data);
            else setProfileData(null);
          } else {
            setProfileData(null);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    // Auto-rotate reviews (only when there is at least one review)
    if (profileData?.reviews && profileData.reviews.length > 0) {
      const len = profileData.reviews.length;
      const interval = setInterval(() => {
        setCurrentReview((prev) => (prev + 1) % len);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [profileData]);

  useEffect(() => {
    if (!auth || !auth.user) return;
    (async () => {
      try {
        const user = auth.user as any;
        const sid = user?.sessionId || user?.id || user?.userId || user?.email;
        if (!sid) return;
        const res = await fetch(`/api/freelancer-dashboard?sessionId=${encodeURIComponent(sid)}`, { credentials: 'same-origin' });
        if (!res.ok) return;
        const data = await res.json();
        // backend may return { ok, profile } or { ok, profiles } or array
        let profileObj = null as any;
        if (data.profile) profileObj = data.profile;
        else if (data.profiles && Array.isArray(data.profiles)) profileObj = data.profiles[0] || null;
        else if (Array.isArray(data) && data.length > 0) profileObj = data[0];
        else if (data.data) profileObj = data.data;

        if (!profileObj) {
          setIsOwner(false);
          return;
        }

        const ownerMatch = Boolean(
          (profileObj.sessionId && user?.sessionId && profileObj.sessionId === user.sessionId) ||
          (profileObj.userId && (profileObj.userId === user.id || profileObj.userId === user.userId)) ||
          (profileObj.email && user?.email && profileObj.email === user.email) ||
          (profileObj.id && (profileObj.id === user.id || profileObj.id === user.userId))
        );

        setIsOwner(ownerMatch);
      } catch (err) {
        console.error('Failed to check freelancer ownership:', err);
        setIsOwner(false);
      }
    })();
  }, [auth?.user]);

  // compute opened id on client only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    let id = params.get('id');
    if (!id) {
      const m = window.location.pathname.match(/\/profile\/(.+?)(?:\/|$)/);
      if (m) id = decodeURIComponent(m[1]);
    }
    setOpenedId(id || '');
  }, []);

  // keep draft in sync with loaded profile (must be declared before any early returns)
  useEffect(() => {
    setDraftPersonal(profileData?.personal || null);
  }, [profileData]);

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // If profile is incomplete, redirect to complete profile page
  if (profileData.status === 'incomplete') {
    return (
      <div className="min-h-screen bg-white">
        <nav className="bg-white shadow-sm border-b px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ICPWork
            </div>
          </div>
        </nav>
        
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Profile</h1>
            <p className="text-gray-600 mb-6">Your profile is incomplete. Please complete your profile to get discovered by clients.</p>
            <a 
              href="/profile/complete"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Complete Profile
            </a>
          </div>
        </div>
      </div>
    );
  }

  const { personal, skills, stats, workExperience, services, reviews, portfolio } = profileData;

  const editable = openedId === 'p2';

  const saveDraft = () => {
    if (!draftPersonal) return;
    // client-side only: update UI state. Persistence API not implemented here.
    setProfileData((p) => (p ? { ...p, personal: draftPersonal } : p));
    setEditing(false);
  };

  const nextWork = () => {
  if (!portfolio || portfolio.length === 0) return;
  setCurrentWork((prev) => (prev + 1) % portfolio.length);
  };

  const prevWork = () => {
  if (!portfolio || portfolio.length === 0) return;
  setCurrentWork((prev) => (prev - 1 + portfolio.length) % portfolio.length);
  };

  const nextService = () => {
  if (!services || services.length === 0) return;
  setCurrentService((prev) => (prev + 1) % services.length);
  };

  const prevService = () => {
  if (!services || services.length === 0) return;
  setCurrentService((prev) => (prev - 1 + services.length) % services.length);
  };

  const nextExperience = () => {
  if (!workExperience || workExperience.length === 0) return;
  setCurrentExperience((prev) => (prev + 1) % workExperience.length);
  };

  const prevExperience = () => {
  if (!workExperience || workExperience.length === 0) return;
  setCurrentExperience((prev) => (prev - 1 + workExperience.length) % workExperience.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white shadow-lg border-b px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <img src="/logo.svg" alt="ICPWork Logo" className="w-36 " />
         
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Left Content */}
            <div className="flex-1">
              {editable && isOwner && !editing ? (
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">{personal.name}</h1>
                    <div className="text-lg sm:text-xl text-gray-600">{personal.title}</div>
                  </div>
                  <div>
                    <button onClick={() => setEditing(true)} className="px-4 py-2 bg-indigo-600 text-white rounded">Edit</button>
                  </div>
                </div>
              ) : editing ? (
                <div className="space-y-3 mb-4">
                  <input className="w-full p-3 border rounded" value={draftPersonal?.name || ''} onChange={(e) => setDraftPersonal((d) => d ? { ...d, name: e.target.value } : d)} />
                  <input className="w-full p-3 border rounded" value={draftPersonal?.title || ''} onChange={(e) => setDraftPersonal((d) => d ? { ...d, title: e.target.value } : d)} />
                  <textarea className="w-full p-3 border rounded" value={draftPersonal?.about || ''} onChange={(e) => setDraftPersonal((d) => d ? { ...d, about: e.target.value } : d)} />
                  <div className="flex gap-3">
                    <button onClick={saveDraft} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
                    <button onClick={() => { setEditing(false); setDraftPersonal(profileData.personal); }} className="px-4 py-2 border rounded">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl  text-gray-900 mb-4">
                    {personal.name}
                  </h1>
                  <h2 className="text-lg sm:text-3xl font-bold text-black mb-6 leading-relaxed max-w-2xl">
                    I am {personal.name},<br />
                    {personal.title}
                  </h2>
                  <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl">
                    {personal.about}
                  </p>
                </>
              )}
              
              {/* Socials */}
              <div className="flex flex-wrap gap-8 mb-8">
                {(draftPersonal?.socials || personal.socials).map((social, index) => {
                  const IconComponent = SocialIcons[social.icon];
                  return (
                    <a
                      key={index}
                      href={social.url}
                      className="  hover:bg-gray-200 rounded-lg transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconComponent className="w-10 h-10 text-gray-700" />
                    </a>
                  );
                })}
              </div>

              {/* Hire Me Button */}
              <button className="px-16 py-3 bg-black text-white rounded-full text-lg  hover:shadow-lg transition-shadow">
                Hire Me
              </button>
            </div>

            {/* Right Photo */}
            <div className="w-full lg:w-80 xl:w-96 h-80 lg:h-96">
              <img
                src={personal.profileImage}
                alt={personal.name}
                className="w-full h-80 lg:h-full object-cover rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Skills Strip •  */}
      <section className="bg-[#FFE1B8] py-8 overflow-hidden mb-16">
        <div className="flex gap-10 animate-scroll whitespace-nowrap px-6">
          {[...skills, ...skills, ...skills].map((skill, index) => (
            <div>
            <span key={index} className="inline-block px-4 font-medium text-2xl text-gray-800">
              {skill+" "}
            </span>
             <span className="inline-block px-4 font-medium text-4xl text-gray-800">
              •
            </span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black py-10 px-4 sm:px-3 lg:px-4 w-3/4 mx-auto rounded-4xl my-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                {stats.companiesServed}+
              </div>
              <div className="text-gray-400 text-lg">Companies Served</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                {stats.projectsDone}+
              </div>
              <div className="text-gray-400 text-lg">Projects Done</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                {stats.hackathonsParticipated}+
              </div>
              <div className="text-gray-400 text-lg">Hackathons Participated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Work Experience */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-5">
          <h2 className="text-xl sm:text-3xl   mb-12">Work Experience</h2>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevExperience}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextExperience}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workExperience.slice(currentExperience, currentExperience + 3).map((experience) => (
                <div key={experience.id} className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">
                    {experience.designation}
                  </h3>
                  <h4 className="text-lg text-blue-600 mb-4">
                    {experience.company}
                  </h4>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {experience.description}
                  </p>
                  <div className="text-sm text-gray-500">
                    {experience.duration} • {experience.timeWorked}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-2 mt-8">
              {Array.from({ length: Math.ceil(workExperience.length / 3) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentExperience(index * 3)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    Math.floor(currentExperience / 3) === index ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Book My Services */}
      <section className="bg-[#393939] py-16 px-4 sm:px-6 lg:px-8">
        <div className=" md:mx-24">
          <h2 className="text-3xl sm:text-4xl font-bold  text-white mb-12">Book My Services</h2>
          <p className='max-w-2xl text-gray-400'>Experienced Product Designer, previously a key contributor to web product design in collaboration with the founders at Post News.</p>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevService}
                className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextService}
                className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
              {services.slice(currentService, currentService + 3).map((service) => (
                <div key={service.id} className="rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="text-lg font-semibold mb-2">{service.personName}</div>
                    <button className="px-4 py-1 border-red-500 border rounded-full text-red-500  mb-4  transition-colors">
                      View
                    </button>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(service.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-300">{service.rating}</span>
                      </div>
                      <div className="text-lg font-bold text-white">{service.price}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12">What Clients Say</h2>
          <div className="relative">
            {reviews && reviews.length > 0 ? (
              <>
                <blockquote className="text-xl sm:text-2xl text-gray-700 mb-8 leading-relaxed">
                  "{reviews[currentReview].text}"
                </blockquote>
                <div className="mb-4">
                  <div className="font-semibold text-lg">{reviews[currentReview].reviewer}</div>
                  <div className="text-gray-600">{reviews[currentReview].designation}</div>
                </div>
              </>
            ) : (
              <div className="text-gray-600 mb-8">No reviews yet.</div>
            )}
            <div className="flex justify-center space-x-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentReview(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentReview ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Works */}
      <section className="bg-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl  mb-4">Work Portfolio</h2>
          <p className='max-w-2xl text-gray-400 mb-5'>Experienced Product Designer, previously a key contributor to web product design in collaboration with the founders at Post News.</p>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevWork}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextWork}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
              {portfolio.slice(currentWork, currentWork + 3).map((work) => (
                <div key={work.id} className=" rounded-xl overflow-hidden  hover:shadow-xl transition-shadow">
                  <img
                    src={work.image}
                    alt={work.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3">{work.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{work.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-2 mt-8">
              {Array.from({ length: Math.ceil(portfolio.length / 3) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentWork(index * 3)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    Math.floor(currentWork / 3) === index ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
          width: max-content;
        }
        
        @media (max-width: 640px) {
          .animate-scroll {
            animation: scroll 20s linear infinite;
          }
        }
      `}</style>
    </div>
  );
}
