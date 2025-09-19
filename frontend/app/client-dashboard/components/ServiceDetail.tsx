"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Star, BookmarkPlus, Share2, Check, ChevronUp, ChevronDown } from 'lucide-react'

interface Service {
  id: string
  overview: {
    serviceTitle: string
    mainCategory: string
    subCategory: string
    description: string
    email?: string
  }
  projectTiers: {
    Basic: {
      title: string
      description: string
      price: string
    }
    Advanced: {
      title: string
      description: string
      price: string
    }
    Premium: {
      title: string
      description: string
      price: string
    }
  }
  portfolioImages: string[]
  isActive: boolean
  createdAt: string
}

export default function ServiceDetail({ service, onBack }: { service: Service; onBack: () => void }) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-800">
            <ChevronLeft size={20} className="mr-1" />
            <span>Back</span>
          </button>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg p-6 mb-8">
              <h1 className="text-2xl font-semibold text-[#272d37] mb-4">{service.overview.serviceTitle}</h1>
              <div className="flex items-center mb-6">
                <img src={`https://i.pravatar.cc/40?u=${service.id}`} alt={service.overview.email || 'Provider'} className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <div className="font-medium">{service.overview.email || 'Anonymous'}</div>
                  <div className="flex items-center text-sm">
                    <Star size={14} className="text-yellow-400 mr-1" fill="#FFD84F" />
                    <span className="mr-3">4.5 (0)</span>
                    <span className="text-gray-600">{service.overview.mainCategory} • {service.overview.subCategory}</span>
                  </div>
                </div>
                <div className="ml-auto flex space-x-2">
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <BookmarkPlus size={20} className="text-gray-600" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Share2 size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {service.portfolioImages.length > 0 ? (
                  service.portfolioImages.slice(0, 4).map((image, index) => (
                    <div key={index} className="rounded-lg overflow-hidden">
                      <img src={image} alt={`Service image ${index + 1}`} className="w-full h-40 object-cover" />
                    </div>
                  ))
                ) : (
                  [1, 2, 3, 4].map((item) => (
                    <div key={item} className="rounded-lg overflow-hidden bg-gray-200">
                      <div className="w-full h-40 flex items-center justify-center text-gray-500">
                        No Image
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">Description</h2>
                <div className="flex space-x-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5">
                    <span className="text-gray-600 text-sm">Save</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5">
                    <span className="text-gray-600 text-sm">Share</span>
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <div className="bg-[#FFF9E6] p-4 rounded-lg mb-4">
                  <p className="text-sm">
                    <span className="font-medium">Professional Service</span> - {service.overview.description}
                  </p>
                </div>
                <p className="text-sm mb-4">{service.overview.description}</p>
                <div className="text-sm text-gray-600">
                  <p><strong>Category:</strong> {service.overview.mainCategory}</p>
                  <p><strong>Sub-category:</strong> {service.overview.subCategory}</p>
                  <p><strong>Service ID:</strong> {service.id}</p>
                  <p><strong>Created:</strong> {new Date(service.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <ServiceTiers service={service} />
              <FAQs />
              <Comments />
              <SimilarServices />
            </div>
          </div>
          {/* Right Sidebar */}
          <div className="w-full lg:w-80 lg:flex-shrink-0">
            <ServiceSidebar service={service} />
          </div>
        </div>
      </div>
    </div>
  )
}

const FAQs = () => {
  const [openFaq, setOpenFaq] = useState<number>(0)
  const faqs = [
    {
      question: "How do I become a part of Organaised's freelance network?",
      answer: 'Joining our network starts with an application. We meticulously review your expertise, portfolio, and professional background.',
    },
    {
      question: 'What does the vetting process involve?',
      answer: 'Our vetting process includes portfolio review, technical assessment, and interviews to ensure you meet our quality standards.',
    },
    {
      question: 'Are there opportunities for professional growth within Organaised?',
      answer: 'Yes, we offer various professional development opportunities, mentorship programs, and advanced project assignments to help you grow.',
    },
  ]
  return (
    <div className="mb-10">
      <h2 className="text-xl font-medium mb-6">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg">
            <button className="flex justify-between items-center w-full px-6 py-4 text-left" onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
              <span className="font-medium">{faq.question}</span>
              {openFaq === index ? <ChevronUp size={18} className="text-[#437ef7]" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>
            {openFaq === index && (
              <div className="px-6 pb-4">
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const Comments = () => {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-medium mb-6">Comments And Rating</h2>
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <span className="text-xl font-medium mr-2">4.8</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={18} className="text-yellow-400" fill="#FFD84F" />
            ))}
          </div>
          <span className="ml-2 text-gray-600">(2355 ratings)</span>
        </div>
        <div className="space-y-2">
          {[1, 2].map((comment) => (
            <div key={comment} className="border-t pt-6">
              <div className="flex items-center mb-3">
                <img src="https://mirrorful-production.s3.us-west-1.amazonaws.com/patterns/files/0b00787f-a5a4-45e3-aecf-ff880488a937/figma-preview.jpg" alt="Jane Doe" className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <div className="font-medium">Jane Doe</div>
                  <div className="flex">{[1, 2, 3, 4, 5].map((star) => (<Star key={star} size={14} className="text-yellow-400" fill="#FFD84F" />))}</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">I really appreciate the insights and perspective shared in this article. It's definitely given me something to think about and has helped me see things from a different angle.</p>
            </div>
          ))}
          <button className="text-[#437ef7] font-medium hover:underline">Load More</button>
        </div>
      </div>
    </div>
  )
}

const ServiceSidebar = ({ service }: { service: Service }) => {
  const router = useRouter()
  return (
    <div className="bg-white rounded-lg p-6 sticky top-6">
      <div className="mb-6">
        <h2 className="text-xl font-medium mb-4">Select service tier</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          <button className="bg-white border border-gray-300 rounded-full px-4 py-1.5 text-sm font-medium hover:bg-gray-50">Basic(${service.projectTiers.Basic.price})</button>
          <button className="bg-white border border-gray-300 rounded-full px-4 py-1.5 text-sm font-medium hover:bg-gray-50">Advanced(${service.projectTiers.Advanced.price})</button>
          <button className="bg-white border border-gray-300 rounded-full px-4 py-1.5 text-sm font-medium hover:bg-gray-50">Premium(${service.projectTiers.Premium.price})</button>
        </div>
      </div>
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <div className="mb-4">
          <h3 className="font-medium mb-1">Service Title</h3>
          <p className="text-sm text-gray-600">{service.overview.serviceTitle}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-medium mb-1">Category</h3>
          <p className="text-sm text-gray-600">{service.overview.mainCategory} • {service.overview.subCategory}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-medium mb-1">Provider</h3>
          <p className="text-sm text-gray-600">{service.overview.email || 'Anonymous'}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-medium mb-1">Status</h3>
          <p className="text-sm text-gray-600">{service.isActive ? 'Active' : 'Inactive'}</p>
        </div>
        <div>
          <h3 className="font-medium mb-1">Starting Price</h3>
          <p className="text-sm text-gray-600">${service.projectTiers.Basic.price}</p>
        </div>
      </div>
      <button
        onClick={() => router.push('/client-dashboard/checkout')}
        className="w-full text-white font-medium py-2 px-8 rounded-full"
        style={{ background: 'linear-gradient(30deg, #44B0FF 0%, #973EEE 25%, #F12AE6 50%, #FF7039 75%, #F3BC3B 100%)' }}
      >
        Continue (${service.projectTiers.Basic.price})
      </button>
    </div>
  )
}

const ServiceTiers = ({ service }: { service: Service }) => {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-medium mb-6">Service Tiers</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-4 px-6 text-left text-sm font-medium text-gray-500">Service Tiers</th>
              <th className="py-4 px-6 text-center text-sm font-medium text-gray-500">Basic</th>
              <th className="py-4 px-6 text-center text-sm font-medium text-gray-500">Advanced</th>
              <th className="py-4 px-6 text-center text-sm font-medium text-gray-500">Premium</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-200">
              <td className="py-4 px-6 text-sm text-gray-700">Price</td>
              <td className="py-4 px-6 text-center text-sm text-gray-700">${service.projectTiers.Basic.price}</td>
              <td className="py-4 px-6 text-center text-sm text-gray-700">${service.projectTiers.Advanced.price}</td>
              <td className="py-4 px-6 text-center text-sm text-gray-700">${service.projectTiers.Premium.price}</td>
            </tr>
            <tr className="border-t border-gray-200">
              <td className="py-4 px-6 text-sm text-gray-700">Description</td>
              <td className="py-4 px-6 text-center text-sm text-gray-700">{service.projectTiers.Basic.description}</td>
              <td className="py-4 px-6 text-center text-sm text-gray-700">{service.projectTiers.Advanced.description}</td>
              <td className="py-4 px-6 text-center text-sm text-gray-700">{service.projectTiers.Premium.description}</td>
            </tr>
            <tr className="border-t border-gray-200">
              <td className="py-4 px-6 text-sm text-gray-700">Available</td>
              <td className="py-4 px-6 text-center text-sm text-gray-700"><Check size={18} className="mx-auto text-green-500" /></td>
              <td className="py-4 px-6 text-center text-sm text-gray-700"><Check size={18} className="mx-auto text-green-500" /></td>
              <td className="py-4 px-6 text-center text-sm text-gray-700"><Check size={18} className="mx-auto text-green-500" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

const SimilarServices = () => {
  const services = [
    { id: 1, title: 'It is a long established fact that a reader will be distracted', provider: 'Kenneth Allen', rating: 4.8, reviews: '1.2K+', price: 'USD $100', image: 'https://mirrorful-production.s3.us-west-1.amazonaws.com/patterns/files/0b00787f-a5a4-45e3-aecf-ff880488a937/figma-preview.jpg' },
    { id: 2, title: 'It is a long established fact that a reader will be distracted', provider: 'Kenneth Allen', rating: 4.9, reviews: '1.2K+', price: 'USD $100', image: 'https://mirrorful-production.s3.us-west-1.amazonaws.com/patterns/files/0b00787f-a5a4-45e3-aecf-ff880488a937/figma-preview.jpg' },
    { id: 3, title: 'It is a long established fact that a reader will be distracted', provider: 'Kenneth Allen', rating: 4.8, reviews: '1.2K+', price: 'USD $100', image: 'https://mirrorful-production.s3.us-west-1.amazonaws.com/patterns/files/0b00787f-a5a4-45e3-aecf-ff880488a937/figma-preview.jpg' },
  ]
  return (
    <div>
      <h2 className="text-xl font-medium mb-6">Explore Similar Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="relative h-48"><img src={service.image} alt={service.title} className="w-full h-full object-cover" /></div>
            <div className="p-4">
              <div className="flex items-center mb-2">
                <img src={service.image} alt={service.provider} className="w-8 h-8 rounded-full mr-2" />
                <span className="text-sm font-medium">{service.provider}</span>
              </div>
              <p className="text-sm font-medium mb-3 line-clamp-2">{service.title}</p>
              <div className="flex items-center mb-3">
                <Star size={14} className="text-yellow-400 mr-1" fill="#FFD84F" />
                <span className="text-xs text-gray-600">{service.rating} ({service.reviews})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">{service.price}</span>
                <button className="text-[#437ef7] text-sm font-medium border border-[#437ef7] rounded-full px-3 py-1 hover:bg-[#437ef7] hover:text-white transition-colors">View</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
