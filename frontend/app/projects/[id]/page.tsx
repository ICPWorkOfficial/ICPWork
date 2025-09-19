'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorageAuth } from '@/hooks/useLocalStorageAuth';

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

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useLocalStorageAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationData, setApplicationData] = useState({
    proposal: '',
    whyFit: '',
    estimatedTime: '',
    bidAmount: ''
  });

  useEffect(() => {
    if (params.id) {
      fetchProject(params.id as string);
    }
  }, [params.id]);

  const fetchProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const result = await response.json();
      
      if (result.success) {
        setProject(result.project);
      } else {
        console.error('Failed to fetch project:', result.error);
        alert('Project not found');
        router.push('/projects/browse');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      alert('An error occurred while fetching the project');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.email || !project) {
      alert('Please login to apply for this project');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/projects/${project.id}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          freelancerEmail: user.email,
          ...applicationData
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Application submitted successfully!');
        setShowApplicationForm(false);
        setApplicationData({
          proposal: '',
          whyFit: '',
          estimatedTime: '',
          bidAmount: ''
        });
        // Refresh project data to show updated applications
        fetchProject(project.id);
      } else {
        alert(`Failed to submit application: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('An error occurred while submitting the application');
    } finally {
      setIsSubmitting(false);
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
            <CardDescription>Please login to view project details</CardDescription>
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
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Project Not Found</CardTitle>
            <CardDescription>The project you're looking for doesn't exist</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/projects/browse')} className="w-full">
              Browse Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasApplied = project.applications.includes(user.email);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
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
          {/* Project Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
                    <Badge className={getStatusColor(getStatusString(project.status))}>
                      {getStatusString(project.status)}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-base">
                  Posted on {formatDate(project.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
                </div>

                {project.requirements && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{project.requirements}</p>
                  </div>
                )}

                {project.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Project Info & Application */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.category && (
                  <div>
                    <span className="font-medium text-gray-700">Category:</span>
                    <p className="text-gray-600">{project.category}</p>
                  </div>
                )}
                
                {project.budget && (
                  <div>
                    <span className="font-medium text-gray-700">Budget:</span>
                    <p className="text-gray-600">{project.budget}</p>
                  </div>
                )}
                
                {project.timeline && (
                  <div>
                    <span className="font-medium text-gray-700">Timeline:</span>
                    <p className="text-gray-600">{project.timeline}</p>
                  </div>
                )}

                <div>
                  <span className="font-medium text-gray-700">Applications:</span>
                  <p className="text-gray-600">{project.applications.length} freelancer(s) applied</p>
                </div>
              </CardContent>
            </Card>

            {/* Application Section */}
            {getStatusString(project.status) === 'Open' && (
              <Card>
                <CardHeader>
                  <CardTitle>Apply for this Project</CardTitle>
                  <CardDescription>
                    {hasApplied 
                      ? 'You have already applied for this project'
                      : 'Submit your application to work on this project'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hasApplied ? (
                    <div className="text-center py-4">
                      <Badge variant="secondary" className="mb-4">
                        Application Submitted
                      </Badge>
                      <p className="text-gray-600">
                        Your application is under review. The client will contact you if you're selected.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {!showApplicationForm ? (
                        <Button 
                          onClick={() => setShowApplicationForm(true)}
                          className="w-full"
                        >
                          Apply for this Project
                        </Button>
                      ) : (
                        <form onSubmit={handleApplicationSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="proposal">Proposal *</Label>
                            <Textarea
                              id="proposal"
                              value={applicationData.proposal}
                              onChange={(e) => setApplicationData(prev => ({
                                ...prev,
                                proposal: e.target.value
                              }))}
                              placeholder="Describe your approach to this project..."
                              rows={4}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="whyFit">Why are you a good fit? *</Label>
                            <Textarea
                              id="whyFit"
                              value={applicationData.whyFit}
                              onChange={(e) => setApplicationData(prev => ({
                                ...prev,
                                whyFit: e.target.value
                              }))}
                              placeholder="Explain why you're the right person for this project..."
                              rows={3}
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="estimatedTime">Estimated Time</Label>
                              <Input
                                id="estimatedTime"
                                value={applicationData.estimatedTime}
                                onChange={(e) => setApplicationData(prev => ({
                                  ...prev,
                                  estimatedTime: e.target.value
                                }))}
                                placeholder="e.g., 2 weeks"
                              />
                            </div>

                            <div>
                              <Label htmlFor="bidAmount">Your Bid</Label>
                              <Input
                                id="bidAmount"
                                value={applicationData.bidAmount}
                                onChange={(e) => setApplicationData(prev => ({
                                  ...prev,
                                  bidAmount: e.target.value
                                }))}
                                placeholder="e.g., $500"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              disabled={isSubmitting}
                              className="flex-1"
                            >
                              {isSubmitting ? 'Submitting...' : 'Submit Application'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowApplicationForm(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
