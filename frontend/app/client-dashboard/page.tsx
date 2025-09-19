"use client";
import React, { useState } from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { CategoryTabs } from './components/CategoryTabs'
import { Filters } from './components/Filters'
import { TalentGrid } from './components/TalentGrid'
export function App() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [filters, setFilters] = useState({
    topRated: false,
    bestSeller: false,
  })
  console.log(activeCategory,"testing");

  const talents = [
    {
      id: 1,
      name: 'Kenneth Allen',
      description:
        'It is a long established fact that a reader will be distracted by the readable content',
      rating: 4.8,
      reviews: '(1.2K+)',
      price: 'USD $100',
      images: [
        'https://mirrorful-production.s3.us-west-1.amazonaws.com/patterns/files/78e70aff-af3a-4c7c-89a9-16e6b3bb390a/figma-preview.jpg',
      ],
      category: 'Business',
      title: 'Professional UI/UX Designer',
      provider: 'Kenneth Allen',
      image: 'https://mirrorful-production.s3.us-west-1.amazonaws.com/patterns/files/78e70aff-af3a-4c7c-89a9-16e6b3bb390a/figma-preview.jpg',
    },
    {
      id: 2,
      name: 'Kenneth Allen',
      description:
        'It is a long established fact that a reader will be distracted by the readable content',
      rating: 4.8,
      reviews: '(1.2K+)',
      price: 'USD $100',
      images: [
        'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      ],
      category: 'Business',
      title: 'Website Designer',
      provider: 'Kenneth Allen',
      image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
  ]

  return (
    <div className="flex h-screen bg-[#f6f8f9]">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <CategoryTabs
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
          <Filters filters={filters} setFilters={setFilters} />
          <TalentGrid
            category={activeCategory}
            filters={filters}
          />
        </main>
      </div>
    </div>
  )
}

export default App
