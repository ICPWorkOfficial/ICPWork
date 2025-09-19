'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

export default function BrowseProjectsPage() {
  const router = useRouter();
  const { user } = useLocalStorageAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const categories = [
    'Web Development',
    'Mobile Development',
    'Desktop Development',
    'Data Science',
    'Machine Learning',
    'DevOps',
    'UI/UX Design',
    'Graphic Design',
    'Content Writing',
    'Marketing',
    'Business Analysis',
    'Other'
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, categoryFilter]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects?status=open');
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

  const filterProjects = () => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(project => project.category === categoryFilter);
    }

    setFilteredProjects(filtered);
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please login to browse projects</CardDescription>
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
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Projects</h1>
          <p className="text-gray-600 mt-2">Find projects that match your skills and interests</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search projects by title, description, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-64">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600">
                {searchTerm || categoryFilter 
                  ? 'Try adjusting your search criteria'
                  : 'No open projects available at the moment'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                    <Badge className={getStatusColor(getStatusString(project.status))}>
                      {getStatusString(project.status)}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.category && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Category: </span>
                        <span className="text-sm text-gray-600">{project.category}</span>
                      </div>
                    )}
                    
                    {project.budget && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Budget: </span>
                        <span className="text-sm text-gray-600">{project.budget}</span>
                      </div>
                    )}
                    
                    {project.timeline && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Timeline: </span>
                        <span className="text-sm text-gray-600">{project.timeline}</span>
                      </div>
                    )}

                    {project.skills.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Skills: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {project.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {project.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{project.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <Button 
                        onClick={() => handleViewProject(project.id)}
                        className="w-full"
                      >
                        View Project
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Showing {filteredProjects.length} of {projects.length} projects
          </p>
        </div>
      </div>
    </div>
  );
}
