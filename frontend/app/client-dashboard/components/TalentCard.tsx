import React from 'react'
import { Star, ChevronRight, ChevronLeft } from 'lucide-react'
interface TalentCardProps {
  id: number
  name: string
  description: string
  rating: number
  reviews: string
  price: string
  images: string[]
  onSelect?: (id: number) => void
}
export function TalentCard({
  id,
  name,
  description,
  rating,
  reviews,
  price,
  images,
  onSelect,
}: TalentCardProps) {
  return (
    <div onClick={() => onSelect && onSelect(id)} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="relative h-48 bg-gray-100">
        <img
          src={images[0]}
          alt={name}
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
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 overflow-hidden">
              <img
                src={`https://i.pravatar.cc/32?u=${id}`}
                alt={`${name} avatar`}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-medium">{name}</h3>
          </div>
          <a
            href="#"
            className="text-sm text-[#437ef7] flex items-center hover:underline"
          >
            View <ChevronRight size={16} />
          </a>
        </div>
        <p className="text-[#525252] text-sm mb-3">{description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-medium mr-1">{rating}</span>
            <Star size={16} fill="#FFD700" stroke="#FFD700" className="mr-1" />
            <span className="text-sm text-gray-500">({reviews})</span>
          </div>
          <div className="font-bold text-lg">{price}</div>
        </div>
      </div>
    </div>
  )
}
