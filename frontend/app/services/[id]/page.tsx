'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocalStorageAuth } from '@/hooks/useLocalStorageAuth';

interface Service {
  id: string;
  overview: {
    serviceTitle: string;
    mainCategory: string;
    subCategory: string;
    description: string;
    email: string;
  };
  projectTiers: {
    Basic: {
      title: string;
      description: string;
      price: string;
      features: string[];
      deliveryTime: string;
    };
    Advanced: {
      title: string;
      description: string;
      price: string;
      features: string[];
      deliveryTime: string;
    };
    Premium: {
      title: string;
      description: string;
      price: string;
      features: string[];
      deliveryTime: string;
    };
  };
  additionalCharges: Array<{
    name: string;
    price: string;
    description: string;
  }>;
  portfolioImages: string[];
  questions: Array<{
    question: string;
    type: string;
    options: string[];
  }>;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export default function ServiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useLocalStorageAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchService(params.id as string);
    }
  }, [params.id]);

  const fetchService = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/services/user/${serviceId}`);
      const result = await response.json();
      
      if (result.success) {
        setService(result.service);
      } else {
        console.error('Failed to fetch service:', result.error);
        alert('Service not found');
        router.push('/client-dashboard-new');
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      alert('An error occurred while fetching the service');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) / 1000000).toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please login to view service details</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading service...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Service Not Found</CardTitle>
            <CardDescription>The service you're looking for doesn't exist</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/client-dashboard-new')} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl mb-2">{service.overview.serviceTitle}</CardTitle>
                <div className="flex gap-2 mb-2">
                  <Badge variant="secondary">{service.overview.mainCategory}</Badge>
                  <Badge variant="outline">{service.overview.subCategory}</Badge>
                </div>
                <CardDescription className="text-base">
                  Created on {formatDate(service.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Service Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{service.overview.description}</p>
                </div>

                {service.portfolioImages.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Portfolio Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {service.portfolioImages.map((image, index) => (
                        <div key={index} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 text-sm">{image}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {service.questions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Additional Questions</h3>
                    <div className="space-y-2">
                      {service.questions.map((question, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded">
                          <p className="font-medium">{question.question}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Service Packages & Contact */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Packages</CardTitle>
                <CardDescription>Choose the package that fits your needs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(service.projectTiers).map(([tier, details]) => (
                  <div key={tier} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{details.title}</h4>
                      <div className="text-lg font-bold text-blue-600">${details.price}</div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{details.description}</p>
                    <div className="text-xs text-gray-500 mb-3">Delivery: {details.deliveryTime}</div>
                    <div className="text-xs">
                      <strong>Features:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {details.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {service.additionalCharges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Charges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {service.additionalCharges.map((charge, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{charge.name}</div>
                        <div className="text-sm text-gray-600">{charge.description}</div>
                      </div>
                      <div className="font-semibold">${charge.price}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Contact Freelancer</CardTitle>
                <CardDescription>Get in touch to discuss your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full">
                  Send Message
                </Button>
                <Button variant="outline" className="w-full">
                  Request Quote
                </Button>
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Service by: {service.overview.email}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
