    "use client";
    import React, { useState, useEffect } from 'react';
    import { useParams, useRouter } from 'next/navigation';
    import { ChevronLeft, Star, BookmarkPlus, Share2, Check, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';

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
    additionalCharges?: Array<{
        name: string;
        price: string;
    }>;
    }

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = decodeURIComponent(params.id as string); // Decode URL-encoded service ID
    console.log(serviceId,"serviceId");
    
    const [service, setService] = useState<Service | null>(null);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTier, setSelectedTier] = useState<'Basic' | 'Advanced' | 'Premium'>('Basic');
    const [openFaq, setOpenFaq] = useState<number>(0);
    console.log(service,"testing");
    useEffect(() => {
        fetchServiceDetails();
    }, [serviceId]);

    const fetchServiceDetails = async () => {
        try {
        setLoading(true);
        setError(null);

        console.log('Fetching service with ID:', serviceId);

        // Check if serviceId is a timestamp format (contains T and Z)
        const isTimestamp = serviceId.includes('T') && serviceId.includes('Z');
        
        let response;
        try {
            if (isTimestamp) {
                // Use the service-by-createdat endpoint for timestamp-based lookup
                console.log('Using timestamp-based lookup for:', serviceId);
                response = await fetch(`/api/freelancer-dashboard/service-by-createdat/${encodeURIComponent(serviceId)}`);
                const result = await response.json();
                
                if (result.success && result.profile) {
                    const [email, profile] = [result.email, result.profile];
                    
                    // Transform the profile data to match the expected Service interface
                    const transformedService: Service = {
                        id: serviceId,
                        overview: {
                            serviceTitle: profile.serviceTitle || 'Untitled Service',
                            mainCategory: profile.mainCategory || 'General',
                            subCategory: profile.subCategory || 'General',
                            description: profile.description || 'No description available',
                            email: email
                        },
                        projectTiers: {
                            Basic: {
                                title: 'Basic',
                                description: profile.requirementPlans?.basic?.description || 'Basic service',
                                price: profile.requirementPlans?.basic?.price?.toString() || '50'
                            },
                            Advanced: {
                                title: 'Advanced',
                                description: profile.requirementPlans?.advanced?.description || 'Advanced service',
                                price: profile.requirementPlans?.advanced?.price?.toString() || '100'
                            },
                            Premium: {
                                title: 'Premium',
                                description: profile.requirementPlans?.premium?.description || 'Premium service',
                                price: profile.requirementPlans?.premium?.price?.toString() || '200'
                            }
                        },
                        portfolioImages: profile.portfolioImages || [],
                        isActive: profile.isActive !== false,
                        createdAt: profile.createdAt || new Date().toISOString(),
                        additionalCharges: profile.additionalCharges || []
                    };
                    
                    setService(transformedService);
                    return;
                } else {
                    console.warn('Service not found with timestamp:', serviceId);
                    throw new Error('Service not found');
                }
            } else {
                // Use the services API for regular service ID lookup
                response = await fetch('/api/services');
                const result = await response.json();
                
                if (result.success && result.services && result.services.length > 0) {
                    // Find the service with matching ID
                    const serviceData = result.services.find((service: any) => service.id === serviceId);
                    
                    if (!serviceData) {
                        console.warn('Service not found with ID:', serviceId);
                        throw new Error('Service not found');
                    }
                    
                    // The service data is already in the correct format from the services API
                    const transformedService: Service = {
                        id: serviceData.id,
                        overview: serviceData.overview,
                        projectTiers: serviceData.projectTiers,
                        portfolioImages: serviceData.portfolioImages || [],
                        isActive: serviceData.isActive !== false,
                        createdAt: serviceData.createdAt || new Date().toISOString(),
                        additionalCharges: serviceData.additionalCharges || []
                    };
                    
                    setService(transformedService);
                    return;
                } else {
                    console.warn('No services found');
                    throw new Error('No services found');
                }
            }
        } catch (apiError) {
            console.warn('Failed to fetch from by-date API, trying fallback:', apiError);
        }

        
        
        // Fallback: try to fetch all services and find by createdAt
        try {
            response = await fetch(`/api/services/by-date?limit=100`);
            const result = await response.json();
            
            if (result.success && result.services) {
            // Find the specific service by createdAt (serviceId)
            const foundService = result.services.find((service: any) => 
                new Date(service.createdAt).getTime() === parseInt(serviceId)
            );
            
            if (foundService) {
                const transformedService: Service = {
                id: foundService.id,
                overview: {
                    serviceTitle: foundService.overview.serviceTitle || 'Untitled Service',
                    mainCategory: foundService.overview.mainCategory || 'General',
                    subCategory: foundService.overview.subCategory || 'General',
                    description: foundService.overview.description || 'No description available',
                    email: foundService.overview.email
                },
                projectTiers: {
                    Basic: {
                    title: foundService.projectTiers.Basic.title || 'Basic',
                    description: foundService.projectTiers.Basic.description || 'Basic service',
                    price: foundService.projectTiers.Basic.price || '50'
                    },
                    Advanced: {
                    title: foundService.projectTiers.Advanced.title || 'Advanced',
                    description: foundService.projectTiers.Advanced.description || 'Advanced service',
                    price: foundService.projectTiers.Advanced.price || '100'
                    },
                    Premium: {
                    title: foundService.projectTiers.Premium.title || 'Premium',
                    description: foundService.projectTiers.Premium.description || 'Premium service',
                    price: foundService.projectTiers.Premium.price || '200'
                    }
                },
                portfolioImages: foundService.portfolioImages || [],
                isActive: foundService.isActive !== false,
                createdAt: foundService.createdAt,
                additionalCharges: foundService.additionalCharges || []
                };
                
                setService(transformedService);
                return;
            }
            }
        } catch (apiError) {
            console.warn('Failed to fetch from by-date API, trying services API:', apiError);
        }
        
        // Final fallback to services API
        try {
            response = await fetch('/api/services');
            const result = await response.json();
            
            if (result.success && result.services) {
            const foundService = result.services.find((s: Service) => s.createdAt === serviceId);
            if (foundService) {
                setService(foundService);
            } else {
                setError('Service not found');
            }
            } else {
            setError('Failed to load service');
            }
        } catch (finalError) {
            console.error('All API calls failed:', finalError);
            setError('Failed to load service');
        }
        } catch (err) {
        console.error('Error fetching service:', err);
        setError('Failed to load service');
        } finally {
        setLoading(false);
        }
    };
    

    const handleBookService = () => {
        if (service) {
        // Store selected service and tier in localStorage for checkout
        const bookingData = {
            serviceId: service.id,
            serviceTitle: service.overview.serviceTitle,
            selectedTier,
            price: service.projectTiers[selectedTier].price,
            provider: service.overview.email || 'Anonymous'
        };
        localStorage.setItem('bookingData', JSON.stringify(bookingData));
        router.push('/client-dashboard/checkout');
        }
    };

    if (loading) {
        return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        );
    }

    if (error || !service) {
        return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <p className="text-red-600 mb-4">{error || 'Service not found'}</p>
            <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
            Go Back
            </button>
        </div>
        );
    }

    const faqs = [
        {
        question: "How do I become a part of ICPWork's freelance network?",
        answer: 'Joining our network starts with an application. We meticulously review your expertise, portfolio, and professional background.',
        },
        {
        question: 'What does the vetting process involve?',
        answer: 'Our vetting process includes portfolio review, technical assessment, and interviews to ensure you meet our quality standards.',
        },
        {
        question: 'Are there opportunities for professional growth within ICPWork?',
        answer: 'Yes, we offer various professional development opportunities, mentorship programs, and advanced project assignments to help you grow.',
        },
    ];

    const similarServices = [
        {
        id: '1',
        title: 'Professional UI/UX Design for Web & Mobile',
        provider: service.overview.email || 'Anonymous',
        rating: 4.8,
        reviews: '1.2K+',
        price: '$100',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        },
        {
        id: '2',
        title: 'Modern Website Development Services',
        provider: service.overview.email || 'Anonymous',
        rating: 4.9,
        reviews: '1.2K+',
        price: '$150',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        },
        {
        id: '3',
        title: 'Mobile App Design & Development',
        provider: service.overview.email || 'Anonymous',
        rating: 4.8,
        reviews: '1.2K+',
        price: '$200',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
                >
                    <ChevronLeft size={20} className="mr-1" />
                    <span>Back</span>
                </button>
                <h1 className="text-xl font-semibold text-gray-900">ICPWork</h1>
                </div>
                <div className="flex items-center space-x-4">
                <div className="relative">
                    <input
                    type="text"
                    placeholder="Search your industry here..."
                    className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute right-3 top-2.5">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Client</span>
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">JD</span>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                {/* Service Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {service.overview.serviceTitle}
                    </h1>
                    <div className="flex items-center mb-4">
                        <img 
                        src={`https://i.pravatar.cc/40?u=${service.overview.email || 'provider'}`} 
                        alt={service.overview.email || 'Provider'} 
                        className="w-12 h-12 rounded-full mr-4" 
                        />
                        <div>
                        <div className="font-semibold text-lg">{service.overview.email || 'Anonymous'}</div>
                        <div className="flex items-center text-sm text-gray-600">
                            <Star size={16} className="text-yellow-400 mr-1" fill="#FFD84F" />
                            <span className="mr-3">4.8 (1.2K+)</span>
                            <span>1 contract in queue</span>
                        </div>
                        </div>
                    </div>
                    </div>
                    <div className="flex space-x-2">
                    <button className="p-2 rounded-full hover:bg-gray-100">
                        <BookmarkPlus size={20} className="text-gray-600" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100">
                        <Share2 size={20} className="text-gray-600" />
                    </button>
                    </div>
                </div>

                {/* Portfolio Images */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {service.portfolioImages.length > 0 ? (
                    service.portfolioImages.slice(0, 6).map((image, index) => (
                        <div key={index} className="rounded-lg overflow-hidden">
                        <img 
                            src={image} 
                            alt={`Service image ${index + 1}`} 
                            className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200" 
                        />
                        </div>
                    ))
                    ) : (
                    [1, 2, 3, 4, 5, 6].map((item) => (
                        <div key={item} className="rounded-lg overflow-hidden bg-gray-200">
                        <div className="w-full h-48 flex items-center justify-center text-gray-500">
                            No Image
                        </div>
                        </div>
                    ))
                    )}
                </div>

                {/* Description */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold">Description</h2>
                    <div className="flex space-x-4">
                        <button className="bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-sm hover:bg-gray-100">
                        Save
                        </button>
                        <button className="bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-sm hover:bg-gray-100">
                        Share
                        </button>
                    </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-sm">
                        <span className="font-semibold">3000+ Projects Completed</span> on ICPWork with Client Satisfaction! Expert designer with many years of experience.
                    </p>
                    </div>

                    <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">{service.overview.description}</p>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Service Details:</h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Modern, Eye-Catching & Elegant Designs</li>
                        <li>Minimalist & Responsive Designs</li>
                        <li>User-friendly Interface</li>
                        <li>Custom Prototyping & High-Fidelity Mockups</li>
                        <li>Layered PSD or AI File-Editable Source file</li>
                        <li>Guaranteed Satisfaction & Lifetime Support</li>
                        </ul>
                    </div>

                    <p className="text-sm text-gray-600">
                        <strong>Category:</strong> {service.overview.mainCategory} • {service.overview.subCategory}
                    </p>
                    <p className="text-sm text-gray-600">
                        <strong>Service ID:</strong> {service.id}
                    </p>
                    <p className="text-sm text-gray-600">
                        <strong>Created:</strong> {new Date(service.createdAt).toLocaleDateString()}
                    </p>
                    </div>
                </div>

                {/* Tier Comparison */}
                <div className="mb-10">
                    <h2 className="text-2xl font-semibold mb-6">Tier Comparison</h2>
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
                            <td className="py-4 px-6 text-sm text-gray-700">Delivery Days</td>
                            <td className="py-4 px-6 text-center text-sm text-gray-700">7 Days</td>
                            <td className="py-4 px-6 text-center text-sm text-gray-700">7 Days</td>
                            <td className="py-4 px-6 text-center text-sm text-gray-700">7 Days</td>
                        </tr>
                        <tr className="border-t border-gray-200">
                            <td className="py-4 px-6 text-sm text-gray-700">Source Files</td>
                            <td className="py-4 px-6 text-center text-sm text-gray-700">
                            <Check size={18} className="mx-auto text-green-500" />
                            </td>
                            <td className="py-4 px-6 text-center text-sm text-gray-700">
                            <Check size={18} className="mx-auto text-green-500" />
                            </td>
                            <td className="py-4 px-6 text-center text-sm text-gray-700">
                            <Check size={18} className="mx-auto text-green-500" />
                            </td>
                        </tr>
                        <tr className="border-t border-gray-200">
                            <td className="py-4 px-6 text-sm text-gray-700">Optional Add-ons</td>
                            <td className="py-4 px-6 text-center text-sm text-gray-700">-</td>
                            <td className="py-4 px-6 text-center text-sm text-gray-700">-</td>
                            <td className="py-4 px-6 text-center text-sm text-gray-700">-</td>
                        </tr>
                        </tbody>
                    </table>
                    </div>
                </div>

                {/* FAQs */}
                <div className="mb-10">
                    <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg">
                        <button 
                            className="flex justify-between items-center w-full px-6 py-4 text-left hover:bg-gray-50" 
                            onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                        >
                            <span className="font-medium">{faq.question}</span>
                            {openFaq === index ? 
                            <ChevronUp size={18} className="text-blue-600" /> : 
                            <ChevronDown size={18} className="text-gray-400" />
                            }
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

                {/* Comments and Rating */}
                <div className="mb-10">
                    <h2 className="text-2xl font-semibold mb-6">Comments And Rating</h2>
                    <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <span className="text-3xl font-bold mr-2">4.8</span>
                        <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={20} className="text-yellow-400" fill="#FFD84F" />
                        ))}
                        </div>
                        <span className="ml-2 text-gray-600">(2355 ratings)</span>
                    </div>
                    
                    {/* Rating Breakdown */}
                    <div className="space-y-2 mb-6">
                        {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center">
                            <span className="w-8 text-sm">{rating}★</span>
                            <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-yellow-400 h-2 rounded-full" 
                                style={{ width: `${rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 10 : 0}%` }}
                            ></div>
                            </div>
                            <span className="w-8 text-sm text-gray-600">
                            {rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 10 : 0}%
                            </span>
                        </div>
                        ))}
                    </div>

                    {/* Sample Comments */}
                    <div className="space-y-6">
                        {[1, 2].map((comment) => (
                        <div key={comment} className="border-t pt-6">
                            <div className="flex items-center mb-3">
                            <img 
                                src="https://i.pravatar.cc/40?u=comment" 
                                alt="Jane Doe" 
                                className="w-10 h-10 rounded-full mr-3" 
                            />
                            <div>
                                <div className="font-medium">Jane Doe</div>
                                <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} size={14} className="text-yellow-400" fill="#FFD84F" />
                                ))}
                                </div>
                            </div>
                            </div>
                            <p className="text-gray-600 text-sm">
                            I really appreciate the insights and perspective shared in this article. It's definitely given me something to think about and has helped me see things from a different angle.
                            </p>
                        </div>
                        ))}
                        <button className="text-blue-600 font-medium hover:underline">Load More</button>
                    </div>
                    </div>
                </div>

                {/* Similar Services */}
                <div>
                    <h2 className="text-2xl font-semibold mb-6">Explore Similar Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {similarServices.map((similarService) => (
                        <div key={similarService.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="relative h-48">
                            <img 
                            src={similarService.image} 
                            alt={similarService.title} 
                            className="w-full h-full object-cover" 
                            />
                        </div>
                        <div className="p-4">
                            <div className="flex items-center mb-2">
                            <img 
                                src={`https://i.pravatar.cc/32?u=${similarService.provider || 'provider'}`} 
                                alt={similarService.provider} 
                                className="w-8 h-8 rounded-full mr-2" 
                            />
                            <span className="text-sm font-medium">{similarService.provider}</span>
                            </div>
                            <p className="text-sm font-medium mb-3 line-clamp-2">{similarService.title}</p>
                            <div className="flex items-center mb-3">
                            <Star size={14} className="text-yellow-400 mr-1" fill="#FFD84F" />
                            <span className="text-xs text-gray-600">{similarService.rating} ({similarService.reviews})</span>
                            </div>
                            <div className="flex items-center justify-between">
                            <span className="font-medium">{similarService.price}</span>
                            <button className="text-blue-600 text-sm font-medium border border-blue-600 rounded-full px-3 py-1 hover:bg-blue-600 hover:text-white transition-colors">
                                View
                            </button>
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>
                </div>
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-full lg:w-80 lg:flex-shrink-0">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Select service tier</h2>
                    <div className="space-y-3">
                    {(['Basic', 'Advanced', 'Premium'] as const).map((tier) => (
                        <button
                        key={tier}
                        onClick={() => setSelectedTier(tier)}
                        className={`w-full p-3 rounded-lg border-2 transition-all ${
                            selectedTier === tier
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        >
                        <div className="flex justify-between items-center">
                            <span className="font-medium">{tier}</span>
                            <span className="font-bold">${service.projectTiers[tier].price}</span>
                        </div>
                        </button>
                    ))}
                    </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                    <div className="mb-4">
                    <h3 className="font-medium mb-1">Title</h3>
                    <p className="text-sm text-gray-600">{service.projectTiers[selectedTier].title}</p>
                    </div>
                    <div className="mb-4">
                    <h3 className="font-medium mb-1">Description</h3>
                    <p className="text-sm text-gray-600">{service.projectTiers[selectedTier].description}</p>
                    </div>
                    <div className="mb-4">
                    <h3 className="font-medium mb-1">No Of Days</h3>
                    <p className="text-sm text-gray-600">7</p>
                    </div>
                    <div className="mb-4">
                    <h3 className="font-medium mb-1">Revisions</h3>
                    <p className="text-sm text-gray-600">Unlimited</p>
                    </div>
                    <div>
                    <h3 className="font-medium mb-1">Amount</h3>
                    <p className="text-sm text-gray-600">${service.projectTiers[selectedTier].price}</p>
                    </div>
                </div>

                <button
                    onClick={handleBookService}
                    className="w-full text-white font-medium py-3 px-8 rounded-lg flex items-center justify-center space-x-2"
                    style={{ 
                    background: 'linear-gradient(30deg, #44B0FF 0%, #973EEE 25%, #F12AE6 50%, #FF7039 75%, #F3BC3B 100%)' 
                    }}
                >
                    <span>Continue (${service.projectTiers[selectedTier].price})</span>
                    <ArrowRight size={16} />
                </button>
                </div>
            </div>
            </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-sm text-gray-600">Sign up to comment, edit, inspect and more.</span>
            <div className="flex items-center space-x-4">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Sign up
                </button>
                <button 
                onClick={handleBookService}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                <span>Continue</span>
                <ArrowRight size={16} />
                </button>
            </div>
            </div>
        </div>
        </div>
    );
    }
