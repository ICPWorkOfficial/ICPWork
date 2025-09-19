"use client"

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { serviceAPI, ServiceData } from '@/lib/service-api'

// PreviewSection component (carousel) copied from register preview
const previewImages = [
  'https://mirrorful-production.s3.us-west-1.amazonaws.com/patterns/files/40d474c8-8c9f-4f67-a0cd-268006eaeab0/figma-preview.jpg',
  'https://mirrorful-production.s3.us-west-1.amazonaws.com/patterns/files/40d474c8-8c9f-4f67-a0cd-268006eaeab0/figma-preview.jpg',
  'https://mirrorful-production.s3.us-west-1.amazonaws.com/patterns/files/40d474c8-8c9f-4f67-a0cd-268006eaeab0/figma-preview.jpg',
]

function PreviewSection() {
  const [currentImage, setCurrentImage] = useState(0)
  const nextImage = () => setCurrentImage((prev) => (prev + 1) % previewImages.length)
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + previewImages.length) % previewImages.length)

  return (
    <section className="bg-gray-100 rounded-lg p-4">
      <div className="relative">
        <div className="overflow-hidden rounded-lg">
          <img src={previewImages[currentImage]} alt="Preview" className="w-full h-auto" />
        </div>
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
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {previewImages.map((_, index) => (
          <button key={index} onClick={() => setCurrentImage(index)} className={`w-16 h-12 rounded-md overflow-hidden border-2 ${currentImage === index ? 'border-[#29aae1]' : 'border-transparent'}`}>
            <img src={previewImages[index]} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </section>
  )
}

// PricingPlans (simple cards) copied from register preview
function PricingPlans({ projectTiers }: { projectTiers: any }) {
  const cards = ['Basic', 'Advanced', 'Premium']

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((key, idx) => {
        const pkg = projectTiers?.[key] || {}
        const priceVal = pkg?.price || (idx === 0 ? '49' : idx === 1 ? '79' : '129')
        const title = pkg?.title || key
        const desc = pkg?.description || 'Better insights for growing businesses that want more customers.'

        return (
          <div key={key} className="border border-gray-200 rounded-lg p-6 bg-white">
            <h3 className="text-lg font-medium mb-2">{title}</h3>
            <div className="text-3xl font-bold text-[#33363a] mb-4">
              ${' '}
              <span className="text-4xl">{priceVal}</span>
              <span className="text-lg font-normal">/mo</span>
            </div>
            <p className="text-sm text-gray-600 mb-6">{desc}</p>
            <div className="mb-6">
              <h4 className="font-medium mb-3">Features include:</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-[#10b981] mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>50 Placeholder text commonly</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-[#10b981] mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Consectetur adipiscing elit</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-[#10b981] mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Excepteur sint occaecat cupidatat</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-[#10b981] mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Officia deserunt mollit anim</span>
                </li>
              </ul>
            </div>
            <button className="w-full bg-[#041d37] text-white py-3 rounded-md font-medium">Buy Plan</button>
          </div>
        )
      })}
    </div>
  )
}

export default function ServiceViewPage() {
  // Using client component so we can use hooks and show loading state
  const params = useParams() as { id?: string }
  const id = params?.id
  const [service, setService] = useState<ServiceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    ;(async () => {
      try {
        const res = await fetch(`/api/service/${id}`, { credentials: 'same-origin' })
        if (!res.ok) {
          console.error('Failed to fetch service', res.status)
          setService(null)
          return
        }
        const data = await res.json()
        console.debug('service api response:', data)

        let svc: any = null
        // common shapes: { success, service }, { service }, { data: { service } }, direct service object, or array
        if (data?.service) svc = data.service
        else if (data?.data?.service) svc = data.data.service
        else if (data?.data) svc = data.data
        else if (Array.isArray(data) && data.length > 0) svc = data[0]
        else svc = data

        setService(svc)
      } catch (err) {
        console.error('Failed to fetch service by id:', err)
        setService(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>
  if (!service) return <div className="p-6">Service not found.</div>

  const { overview = {}, projectTiers = {}, additionalCharges = [], questions = [], portfolioImages = [] } = service

  const tiers = ['Basic', 'Advanced', 'Premium']

  return (
    <div className="min-h-screen max-w-7xl mx-auto p-6">
      <nav className="bg-white shadow-lg border-b px-4 sm:px-6 lg:px-8 py-4 mb-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <img src="/logo.svg" alt="ICPWork Logo" className="w-36" />
        </div>
      </nav>

      <div className="rounded-lg p-6 bg-white">
        <h1 className="text-2xl font-bold mb-4">{overview.serviceTitle || 'Service'}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-xl p-6 border">
              <h2 className="text-xl font-medium text-[#33363a] mb-4">Description</h2>
              <p className="text-[#33363a] mb-4">{overview.serviceTitle || overview.description || 'No description provided.'}</p>
              <ul className="list-disc pl-5 space-y-2 text-[#33363a] mb-6">
                <li>Modern</li>
                <li>Eye-Catching & elegant designs</li>
                <li>Premium & responsive designs</li>
              </ul>
            </section>
            <section className="mt-6 bg-white rounded-xl p-6 border">
              <h3 className="text-lg font-medium mb-4">Portfolio Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {portfolioImages.length > 0 ? (
                  portfolioImages.map((img: string, i: number) => (
                    <div key={i} className="overflow-hidden rounded-lg border">
                      <img src={img} alt={`pf-${i}`} className="w-full h-40 object-cover" />
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-gray-500">No portfolio images available.</div>
                )}
              </div>

              <div className="mt-6">
                <PreviewSection />
              </div>
            </section>

            <section className="mt-6 bg-white rounded-xl p-6 border">
              <h3 className="text-lg font-medium mb-4">Pricing Plans</h3>
              <PricingPlans projectTiers={projectTiers} />
            </section>
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-xl p-4 border">
              <h4 className="font-medium">Overview</h4>
              <p className="text-sm text-gray-700">Title: {overview.serviceTitle}</p>
              <p className="text-sm text-gray-700">Category: {overview.mainCategory} / {overview.subCategory}</p>
            </div>

            <div className="bg-white rounded-xl p-4 border">
              <h4 className="font-medium">Additional Charges</h4>
              {additionalCharges.length > 0 ? (
                additionalCharges.map((c: any, i: number) => (
                  <div key={i} className="flex justify-between py-2">
                    <div>{c.name}</div>
                    <div>${c.price}</div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No additional charges</div>
              )}
            </div>

            <div className="bg-white rounded-xl p-4 border">
              <h4 className="font-medium">Questions</h4>
              {questions.map((q: any, i: number) => (
                <div key={i} className="py-2">
                  <div className="font-medium">Q{i + 1}: {q.question}</div>
                  <div className="text-sm text-gray-600">Type: {q.type}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
