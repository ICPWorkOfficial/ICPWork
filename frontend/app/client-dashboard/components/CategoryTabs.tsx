import React from 'react'
interface CategoryTabsProps {
  activeCategory: string
  setActiveCategory: (category: string) => void
}
export function CategoryTabs({
  activeCategory,
  setActiveCategory,
}: CategoryTabsProps) {
  const categories = [
    'All',
    'Design',
    'Web Development',
    'Marketing',
    'Business',
    'Technology',
    'Writing',
    'Data Entry',
    'Admin',
    'Portfolio',
    'User Experience',
  ]
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setActiveCategory(category)}
          className={`px-6 py-2 rounded-full transition-colors ${activeCategory === category ? 'bg-[#28a745] text-white' : 'bg-white text-[#525252] hover:bg-gray-100'}`}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
