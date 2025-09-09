"use client";

import React, { useState, useEffect } from 'react';
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
}

// Social icons mapping
const SocialIcons: { [key: string]: any } = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  globe: Globe
};

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [currentReview, setCurrentReview] = useState(0);
  const [currentWork, setCurrentWork] = useState(0);
  const [currentService, setCurrentService] = useState(0);
  const [currentExperience, setCurrentExperience] = useState(0);

  useEffect(() => {
    // Fetch profile data
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        const result = await response.json();
        if (result.ok) {
          setProfileData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    // Auto-rotate reviews
    if (profileData?.reviews) {
      const interval = setInterval(() => {
        setCurrentReview((prev) => (prev + 1) % profileData.reviews.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [profileData]);

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const { personal, skills, stats, workExperience, services, reviews, portfolio } = profileData;

  const nextWork = () => {
    setCurrentWork((prev) => (prev + 1) % portfolio.length);
  };

  const prevWork = () => {
    setCurrentWork((prev) => (prev - 1 + portfolio.length) % portfolio.length);
  };

  const nextService = () => {
    setCurrentService((prev) => (prev + 1) % services.length);
  };

  const prevService = () => {
    setCurrentService((prev) => (prev - 1 + services.length) % services.length);
  };

  const nextExperience = () => {
    setCurrentExperience((prev) => (prev + 1) % workExperience.length);
  };

  const prevExperience = () => {
    setCurrentExperience((prev) => (prev - 1 + workExperience.length) % workExperience.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ICPWork
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-gray-900">About</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Services</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Portfolio</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Contact</a>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
            Get in Touch
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Left Content */}
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {personal.name}
              </h1>
              <h2 className="text-lg sm:text-xl text-gray-600 mb-6 leading-relaxed">
                {personal.title}
              </h2>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-8">
                {personal.about}
              </p>
              
              {/* Socials */}
              <div className="flex flex-wrap gap-8 mb-8">
                {personal.socials.map((social, index) => {
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
            <div className="w-full lg:w-80 xl:w-96">
              <img
                src={personal.profileImage}
                alt={personal.name}
                className="w-full h-80 lg:h-full object-cover rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Skills Strip */}
      <section className="bg-[#FFE1B8] py-6 overflow-hidden mb-16">
        <div className="flex animate-scroll whitespace-nowrap">
          {[...skills, ...skills, ...skills].map((skill, index) => (
            <span key={index} className="inline-block px-4 text-lg font-medium text-gray-800">
              {skill} •
            </span>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black py-16 px-4 sm:px-6 lg:px-8 w-3/4 mx-auto rounded-2xl mb-16">
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
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl   mb-12">Work Experience</h2>
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
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-12">Book My Services</h2>
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
                <div key={service.id} className="bg-white rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="text-lg font-semibold mb-2">{service.personName}</div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg mb-4 hover:bg-blue-700 transition-colors">
                      View
                    </button>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
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
                        <span className="ml-2 text-sm text-gray-600">{service.rating}</span>
                      </div>
                      <div className="text-lg font-bold text-blue-600">{service.price}</div>
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
            <blockquote className="text-xl sm:text-2xl text-gray-700 mb-8 leading-relaxed">
              "{reviews[currentReview].text}"
            </blockquote>
            <div className="mb-4">
              <div className="font-semibold text-lg">{reviews[currentReview].reviewer}</div>
              <div className="text-gray-600">{reviews[currentReview].designation}</div>
            </div>
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
      <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">My Works</h2>
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
                <div key={work.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
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
