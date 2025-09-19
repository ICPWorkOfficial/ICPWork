import React from 'react'
import { Star, ChevronRight, ChevronLeft, Tag } from 'lucide-react'

interface TalentCardProps {
  id: string
  name: string
  title?: string
  description: string
  category?: string
  subCategory?: string
  rating: number
  reviews: string
  price: string
  images: string[]
  onSelect?: (id: string) => void
}

export function TalentCard({
  id,
  name,
  title,
  description,
  category,
  subCategory,
  rating,
  reviews,
  price,
  images,
  onSelect,
}: TalentCardProps) {
  const displayTitle = title || name;
  const displayDescription = description.length > 120 ? description.substring(0, 120) + '...' : description;

  return (
    <div onClick={() => onSelect && onSelect(id)} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="relative h-48 bg-gray-100">
        <img
          src={images[0] || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}
          alt={displayTitle}
          className="w-full h-full object-cover"
        />
        {images.length > 1 && (
          <>
            <button className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
              <ChevronLeft size={18} />
            </button>
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
              <ChevronRight size={18} />
            </button>
          </>
        )}
        {category && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs flex items-center">
            <Tag size={12} className="mr-1" />
            {category}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 overflow-hidden">
                <img
                  src={`https://i.pravatar.cc/32?u=${id}`}
                  alt={`${name} avatar`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm text-gray-600">{name}</h3>
              </div>
            </div>
            <h4 className="font-semibold text-lg mb-1 line-clamp-2">{displayTitle}</h4>
            {subCategory && (
              <p className="text-xs text-gray-500 mb-2">{subCategory}</p>
            )}
          </div>
          <a
            href="#"
            className="text-sm text-[#437ef7] flex items-center hover:underline ml-2"
          >
            View <ChevronRight size={16} />
          </a>
        </div>
        <p className="text-[#525252] text-sm mb-3 line-clamp-3">{displayDescription}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-medium mr-1">{rating}</span>
            <Star size={16} fill="#FFD700" stroke="#FFD700" className="mr-1" />
            <span className="text-sm text-gray-500">{reviews}</span>
          </div>
          <div className="font-bold text-lg text-blue-600">{price}</div>
        </div>
      </div>
    </div>
  )
}
