'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface Project {
  id: string;
  title: string;
  description: string;
  requirements: string;
  budget: string;
  timeline: string;
  category: string;
  skills: string[];
  clientEmail: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  applications: string[];
}

export default function ClientDashboardNew() {
  const router = useRouter();
  const { user } = useLocalStorageAuth();
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    if (user) {
      fetchServices();
      fetchUserProjects();
    }
  }, [user]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      const result = await response.json();
      
      if (result.success) {
        setServices(result.services);
      } else {
        console.error('Failed to fetch services:', result.error);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchUserProjects = async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch(`/api/projects?client=${user.email}`);
      const result = await response.json();
      
      if (result.success) {
        setProjects(result.projects);
      } else {
        console.error('Failed to fetch projects:', result.error);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusString = (status: any): string => {
    if (typeof status === 'object' && status !== null) {
      if (status.Open !== undefined) return 'Open';
      if (status.InProgress !== undefined) return 'InProgress';
      if (status.Completed !== undefined) return 'Completed';
      if (status.Cancelled !== undefined) return 'Cancelled';
    }
    return String(status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-800';
      case 'InProgress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <CardDescription>Please login to access the client dashboard</CardDescription>
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
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user.firstName || user.email}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services">Browse Services</TabsTrigger>
            <TabsTrigger value="projects">My Projects</TabsTrigger>
            <TabsTrigger value="publish">Publish Project</TabsTrigger>
          </TabsList>

          {/* Browse Services Tab */}
          <TabsContent value="services" className="space-y-6">
            {selectedService ? (
              <div>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedService(null)}
                  className="mb-4"
                >
                  ← Back to Services
                </Button>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedService.overview.serviceTitle}</CardTitle>
                    <CardDescription>
                      {selectedService.overview.mainCategory} • {selectedService.overview.subCategory}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Description</h3>
                      <p className="text-gray-700">{selectedService.overview.description}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Service Packages</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(selectedService.projectTiers).map(([tier, details]) => (
                          <Card key={tier}>
                            <CardHeader>
                              <CardTitle className="text-lg">{details.title}</CardTitle>
                              <CardDescription>{details.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="text-2xl font-bold text-blue-600">${details.price}</div>
                                <div className="text-sm text-gray-600">Delivery: {details.deliveryTime}</div>
                                <div className="text-sm">
                                  <strong>Features:</strong>
                                  <ul className="list-disc list-inside mt-1">
                                    {details.features.map((feature, index) => (
                                      <li key={index} className="text-xs">{feature}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {selectedService.additionalCharges.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Additional Charges</h3>
                        <div className="space-y-2">
                          {selectedService.additionalCharges.map((charge, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                              <div>
                                <div className="font-medium">{charge.name}</div>
                                <div className="text-sm text-gray-600">{charge.description}</div>
                              </div>
                              <div className="font-semibold">${charge.price}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4">
                      <Button className="w-full">
                        Contact Freelancer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Available Services</h2>
                  <p className="text-gray-600">{services.length} services available</p>
                </div>

                {services.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No services available</h3>
                      <p className="text-gray-600">Check back later for new services</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                      <Card 
                        key={service.id} 
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedService(service)}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg line-clamp-2">
                            {service.overview.serviceTitle}
                          </CardTitle>
                          <CardDescription>
                            {service.overview.mainCategory} • {service.overview.subCategory}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                            {service.overview.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <div className="text-lg font-semibold text-blue-600">
                              From ${service.projectTiers.Basic.price}
                            </div>
                            <Button size="sm">View Details</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* My Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">My Projects</h2>
              <Button onClick={() => router.push('/projects/publish')}>
                Publish New Project
              </Button>
            </div>

            {projects.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-600 mb-4">Start by publishing your first project</p>
                  <Button onClick={() => router.push('/projects/publish')}>
                    Publish Project
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                        <Badge className={getStatusColor(getStatusString(project.status))}>
                          {getStatusString(project.status)}
                        </Badge>
                      </div>
                      <CardDescription>
                        Posted on {formatDate(project.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                        {project.description}
                      </p>
                      <div className="space-y-2 mb-4">
                        {project.budget && (
                          <div className="text-sm">
                            <span className="font-medium">Budget:</span> {project.budget}
                          </div>
                        )}
                        {project.timeline && (
                          <div className="text-sm">
                            <span className="font-medium">Timeline:</span> {project.timeline}
                          </div>
                        )}
                        <div className="text-sm">
                          <span className="font-medium">Applications:</span> {project.applications.length}
                        </div>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => router.push(`/projects/${project.id}`)}
                      >
                        View Project
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Publish Project Tab */}
          <TabsContent value="publish" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publish a New Project</CardTitle>
                <CardDescription>
                  Create a project and find the perfect freelancer for your needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to get started?</h3>
                  <p className="text-gray-600 mb-6">
                    Publish your project and connect with talented freelancers
                  </p>
                  <Button onClick={() => router.push('/projects/publish')} size="lg">
                    Publish Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
