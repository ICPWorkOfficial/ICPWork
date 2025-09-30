'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Search, ChevronDown, Star, Clock, MapPin, DollarSign, Users } from 'lucide-react'
import { freelancerService, FreelancerProfile } from '@/lib/freelancer-service'

interface ProjectCard {
  id: string
  title: string
  description: string
  category: string
  subCategory: string
  timeline: string
  level: string
  proposals: number
  tags: string[]
  author: string
  timePosted: string
  featured?: boolean
  isActive: boolean
  price: string
}

// projects are fetched from the API and stored in state

// sidebar removed - only main content kept

const categoryTabs = [
  'All Categories',
  'Web Development',
  'Mobile Development',
  'Blockchain Development',
  'Design',
  'Marketing',
  'Writing',
  'Other'
]

const jobTypes = [
  'Full-time',
  'Part-time',
  'Intership',
  'Contract / Freelance',
  'Co-founder'
]

const jobRoles = [
  'Programming',
  'Design',
  'Management / Finance',
  'Customer Support',
  'Sales / Marketing'
]

const salaryRanges = [
  '$20K - $50K',
  '$50K - $100K',
  '>$100K'
]

export default function FreelancerDashboard() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([])
  const [selectedJobRoles, setSelectedJobRoles] = useState<string[]>(['Programming'])
  const [selectedSalaryRanges, setSelectedSalaryRanges] = useState<string[]>([])
  const [projects, setProjects] = useState<ProjectCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    
    const fetchProjects = async () => {
      try {
        const response = await freelancerService.browseProfiles({
          category: selectedCategory === 'All Categories' ? undefined : selectedCategory,
          search: searchQuery || undefined,
          limit: 20
        })
        
        if (!mounted) return
        
        if (response.success) {
          // Transform freelancer profiles to project cards
          const transformedProjects: ProjectCard[] = response.profiles.map(([email, profile]) => ({
            id: email,
            title: profile.serviceTitle,
            description: profile.description,
            category: profile.mainCategory,
            subCategory: profile.subCategory,
            timeline: '3-4 weeks',
            level: `$${profile.requirementPlans.basic.price} - $${profile.requirementPlans.premium.price}`,
            proposals: Math.floor(Math.random() * 10) + 1,
            tags: [profile.mainCategory, profile.subCategory],
            author: email,
            timePosted: new Date(Number(profile.createdAt)).toLocaleDateString(),
            featured: Math.random() > 0.7,
            isActive: profile.isActive,
            price: profile.requirementPlans.basic.price
          }))
          
          setProjects(transformedProjects)
        } else {
          setProjects([])
        }
      } catch (err) {
        console.error('Failed to fetch projects', err)
        setError('Failed to load projects')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchProjects()
    return () => { mounted = false }
  }, [selectedCategory, searchQuery])

  const handleJobTypeChange = (jobType: string, checked: boolean) => {
    if (checked) {
      setSelectedJobTypes([...selectedJobTypes, jobType])
    } else {
      setSelectedJobTypes(selectedJobTypes.filter(type => type !== jobType))
    }
  }

  const handleJobRoleChange = (role: string, checked: boolean) => {
    if (checked) {
      setSelectedJobRoles([...selectedJobRoles, role])
    } else {
      setSelectedJobRoles(selectedJobRoles.filter(r => r !== role))
    }
  }

  const handleSalaryRangeChange = (range: string, checked: boolean) => {
    if (checked) {
      setSelectedSalaryRanges([...selectedSalaryRanges, range])
    } else {
      setSelectedSalaryRanges(selectedSalaryRanges.filter(r => r !== range))
    }
  }

  const clearAllFilters = () => {
    setSelectedJobTypes([])
    setSelectedJobRoles([])
    setSelectedSalaryRanges([])
    setRemoteOnly(false)
    setSearchQuery('')
    setSelectedCategory('All Categories')
  }

  const filteredProjects = projects.filter((project) => {
    if (selectedCategory && selectedCategory !== 'All Categories' && project.category !== selectedCategory) return false
    if (remoteOnly && !/remote/i.test(project.description)) return false
    if (selectedJobTypes.length > 0) {
      const match = selectedJobTypes.some(t => new RegExp(t, 'i').test(project.description))
      if (!match) return false
    }
    if (selectedJobRoles.length > 0) {
      const match = selectedJobRoles.some(r => project.tags?.some(tag => tag.toLowerCase().includes(r.toLowerCase())))
      if (!match) return false
    }
    if (selectedSalaryRanges.length > 0) {
      const match = selectedSalaryRanges.some(range => project.level?.includes(range))
      if (!match) return false
    }
    if (searchQuery && !(`${project.title} ${project.description} ${project.tags?.join(' ')}`).toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Projects Section */}
        <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1 truncate">Browse Projects</h1>
                    <p className="text-sm sm:text-base text-gray-600 truncate">Join Exciting Hackathons and win prizes</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <span className="text-sm text-gray-600">
                      {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} found
                    </span>
                    {filteredProjects.length > 0 && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Available
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
          {(selectedJobTypes.length > 0 || selectedJobRoles.length > 0 || selectedSalaryRanges.length > 0 || remoteOnly || searchQuery || selectedCategory !== 'All Categories') && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800">Active Filters</h3>
                <Button 
                  onClick={clearAllFilters}
                  variant="link" 
                  className="text-red-500 text-xs p-0 h-auto hover:text-red-600"
                >
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
                    Search: {searchQuery}
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:text-blue-600"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </Badge>
                )}
                {selectedCategory !== 'All Categories' && (
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200 flex items-center gap-1">
                    Category: {selectedCategory}
                    <button 
                      onClick={() => setSelectedCategory('All Categories')}
                      className="ml-1 hover:text-purple-600"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </Badge>
                )}
                {selectedJobTypes.map((type) => (
                  <Badge key={type} className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                    {type}
                    <button 
                      onClick={() => handleJobTypeChange(type, false)}
                      className="ml-1 hover:text-green-600"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </Badge>
                ))}
                {selectedJobRoles.map((role) => (
                  <Badge key={role} className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
                    {role}
                    <button 
                      onClick={() => handleJobRoleChange(role, false)}
                      className="ml-1 hover:text-yellow-600"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </Badge>
                ))}
                {selectedSalaryRanges.map((range) => (
                  <Badge key={range} className="bg-orange-100 text-orange-800 border-orange-200 flex items-center gap-1">
                    {range}
                    <button 
                      onClick={() => handleSalaryRangeChange(range, false)}
                      className="ml-1 hover:text-orange-600"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </Badge>
                ))}
                {remoteOnly && (
                  <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 flex items-center gap-1">
                    Remote Only
                    <button 
                      onClick={() => setRemoteOnly(false)}
                      className="ml-1 hover:text-indigo-600"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Category Tabs */}
              <div className="flex gap-2 sm:gap-4 mb-6 overflow-x-auto pb-2">
                {categoryTabs.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`rounded-full px-4 sm:px-8 py-2 whitespace-nowrap flex-shrink-0 transition-all duration-300 transform hover:scale-105 ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl'
                        : 'border-gray-400 text-gray-600 hover:border-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Project Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {loading && (
                  <div className="col-span-2 p-6 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      <p className="text-gray-600">Loading projects…</p>
                    </div>
                  </div>
                )}

                {!loading && error && (
                  <div className="col-span-2 p-6 text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {!loading && !error && filteredProjects.length === 0 && (
                  <div className="col-span-2 p-6 text-center">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 mb-2">No projects found</p>
                      <p className="text-gray-500 text-sm">Try adjusting your filters or search criteria</p>
                    </div>
                  </div>
                )}

                {!loading && !error && filteredProjects.map((project) => (
                  <Card key={project.id} className={`p-4 sm:p-5 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${project.featured ? 'shadow-lg border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50' : 'bg-white'}`}>
                    <CardHeader className="p-0 mb-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                        <div className="flex items-start gap-2 flex-1">
                          <CardTitle className="text-lg sm:text-xl font-medium text-gray-800 flex-1 mr-4 truncate">
                            {project.title}
                          </CardTitle>
                          {project.featured && (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex-shrink-0">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-300 flex-shrink-0">
                          Design
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm mb-3">
                        <div className="flex items-center gap-1 text-gray-800 font-medium truncate">
                          <span className="truncate">{project.author}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>{project.timePosted}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.tags?.map((tag) => (
                          <Badge key={tag} className="bg-blue-500 text-white text-xs px-3 py-1 flex-shrink-0 hover:bg-blue-600 transition-colors">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>

                    <CardContent className="p-0">
                      <CardDescription className="text-gray-600 mb-4 text-sm line-clamp-3">
                        {project.description}
                      </CardDescription>

                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>Category</span>
                          </div>
                          <span className="text-gray-700 font-medium truncate">{project.category}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>Timeline</span>
                          </div>
                          <span className="text-gray-600">{project.timeline}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            <span>Level</span>
                          </div>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 font-medium truncate">
                            {project.level}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>Proposals</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">{project.proposals}</span>
                            {project.proposals > 5 && (
                              <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                                High
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-full py-3 transition-all duration-300 hover:shadow-lg transform hover:scale-105">
                        Register Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
        </div>

        {/* Filters Sidebar */}
        <div className="w-full lg:w-48 space-y-6 flex-shrink-0">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Clear All Filters Button */}
          {(selectedJobTypes.length > 0 || selectedJobRoles.length > 0 || selectedSalaryRanges.length > 0 || remoteOnly || searchQuery || selectedCategory !== 'All Categories') && (
            <Button 
              onClick={clearAllFilters}
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700 transition-all duration-200"
            >
              Clear All Filters
            </Button>
          )}

          {/* Job Type Filter */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:shadow-md">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Job Type</h3>
              <Button variant="link" className="text-blue-500 text-xs p-0 h-auto hover:text-blue-600 transition-colors" onClick={() => setSelectedJobTypes([])}>
                Clear
              </Button>
            </div>
            <div className="space-y-2">
              {jobTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded transition-colors">
                  <Checkbox
                    id={type}
                    checked={selectedJobTypes.includes(type)}
                    onCheckedChange={(checked: any) => handleJobTypeChange(type, !!checked)}
                  />
                  <label htmlFor={type} className="text-sm text-gray-600 cursor-pointer">
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Job Roles Filter */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:shadow-md">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Job Roles</h3>
            <div className="space-y-2">
              {jobRoles.map((role) => (
                <div key={role} className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded transition-colors">
                  <Checkbox
                    id={role}
                    checked={selectedJobRoles.includes(role)}
                    onCheckedChange={(checked: any) => handleJobRoleChange(role, !!checked)}
                  />
                  <label htmlFor={role} className="text-sm text-gray-600 cursor-pointer">
                    {role}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Remote Only Toggle */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:shadow-md">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Remote Only</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="remote-only"
                checked={remoteOnly}
                onCheckedChange={setRemoteOnly}
              />
              <label htmlFor="remote-only" className="text-sm text-gray-600 cursor-pointer">
                {remoteOnly ? 'On' : 'Off'}
              </label>
            </div>
          </div>

          {/* Salary Range Filter */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:shadow-md">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Salary Range</h3>
            <div className="space-y-2">
              {salaryRanges.map((range) => (
                <div key={range} className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded transition-colors">
                  <Checkbox
                    id={range}
                    checked={selectedSalaryRanges.includes(range)}
                    onCheckedChange={(checked: any) => handleSalaryRangeChange(range, !!checked)}
                  />
                  <label htmlFor={range} className="text-sm text-gray-600 cursor-pointer">
                    {range}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:shadow-md">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Location</h3>
            <Input
              type="text"
              placeholder="Anywhere"
              className="text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            />
          </div>
        </div>
      </div>
    </div>
  )
}