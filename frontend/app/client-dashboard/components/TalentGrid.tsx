import React, { useState, useEffect } from 'react'
import { TalentCard } from './TalentCard'

interface Service {
  id: string;
  overview: {
    serviceTitle: string;
    mainCategory: string;
    subCategory: string;
    description: string;
    email?: string;
  };
  projectTiers: {
    Basic: {
      title: string;
      description: string;
      price: string;
    };
    Advanced: {
      title: string;
      description: string;
      price: string;
    };
    Premium: {
      title: string;
      description: string;
      price: string;
    };
  };
  portfolioImages: string[];
  isActive: boolean;
  createdAt: string;
}

interface TalentGridProps {
  category: string
  filters: {
    topRated: boolean
    bestSeller: boolean
  }
  onSelect?: (id: string) => void
}

export function TalentGrid({ category, filters, onSelect }: TalentGridProps) {
  const [services, setServices] = useState<Service[]>([]);
  console.log('Current services state:', services, 'Count:', services.length);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, [category]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from freelancer dashboard API first (real data from canister)
      let response;
      try {
        const params = new URLSearchParams();
        if (category && category !== 'All') {
          params.append('category', category);
        }
        params.append('limit', '50'); // Get more services
        
        response = await fetch(`/api/services`);
        const result = await response.json();
        console.log('Services API result:', result);
        
        if (result.success && result.services) {
          console.log('Services API result:', result);
          console.log('Services count:', result.services.length);
          
          // The services are already in the correct format from the API
          const transformedServices: Service[] = result.services.map((service: any) => ({
            id: service.id,
            overview: service.overview,
            projectTiers: service.projectTiers,
            portfolioImages: service.portfolioImages || [],
            isActive: service.isActive !== false,
            createdAt: service.createdAt || new Date().toISOString(),
            additionalCharges: service.additionalCharges || []
          }));
          
          console.log('Transformed services:', transformedServices);
          setServices(transformedServices);
          return;
        }
      } catch (apiError) {
        console.warn('Failed to fetch from freelancer dashboard API, trying services API:', apiError);
      }
      
      // Fallback to services API
      response = await fetch('/api/services');
      const result = await response.json();
      
      if (result.success && result.services) {
        setServices(result.services);
      } else {
        setError('Failed to load services');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  // Filter services based on active category
  const filteredServices = services.filter(
    (service) => {
      if (category === 'All') return true;
      return service.overview.mainCategory === category;
    }
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchServices}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (filteredServices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No services found for the selected category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredServices.map((service) => (
        <TalentCard
          key={service.id}
          id={service.createdAt}
          name={service.overview.email || 'Anonymous'}
          title={service.overview.serviceTitle}
          description={service.overview.description}
          category={service.overview.mainCategory}
          subCategory={service.overview.subCategory}
          rating={4.5} // Default rating since we don't have this data yet
          reviews="(0)"
          price={`$${service.projectTiers.Basic.price}`}
          images={service.portfolioImages.length > 0 ? service.portfolioImages : ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80']}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
