import React from 'react'
import { TalentCard } from './TalentCard'
interface TalentGridProps {
  category: string
  filters: {
    topRated: boolean
    bestSeller: boolean
  }
  onSelect?: (id: number) => void
}
export function TalentGrid({ category, filters, onSelect }: TalentGridProps) {
  // Mock data for talent profiles
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
    },
    {
      id: 3,
      name: 'Kenneth Allen',
      description:
        'It is a long established fact that a reader will be distracted by the readable content',
      rating: 4.8,
      reviews: '(1.2K+)',
      price: 'USD $100',
      images: [
        'https://images.unsplash.com/photo-1555421689-3f034debb7a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      ],
      category: 'Marketing',
    },
    {
      id: 4,
      name: 'Kenneth Allen',
      description:
        'It is a long established fact that a reader will be distracted by the readable content',
      rating: 4.8,
      reviews: '(1.2K+)',
      price: 'USD $100',
      images: [
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      ],
      category: 'Admin',
    },
    {
      id: 5,
      name: 'Kenneth Allen',
      description:
        'It is a long established fact that a reader will be distracted by the readable content',
      rating: 4.8,
      reviews: '(1.2K+)',
      price: 'USD $100',
      images: [
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      ],
      category: 'Technology',
    },
    {
      id: 6,
      name: 'Kenneth Allen',
      description:
        'It is a long established fact that a reader will be distracted by the readable content',
      rating: 4.8,
      reviews: '(1.2K+)',
      price: 'USD $100',
      images: [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      ],
      category: 'Portfolio',
    },
  ]
  // Filter talents based on active category
  const filteredTalents = talents.filter(
    (talent) => talent.category === category || category === 'All',
  )
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTalents.map((talent) => (
        <TalentCard
          key={talent.id}
          id={talent.id}
          name={talent.name}
          description={talent.description}
          rating={talent.rating}
          reviews={talent.reviews}
          price={talent.price}
          images={talent.images}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
