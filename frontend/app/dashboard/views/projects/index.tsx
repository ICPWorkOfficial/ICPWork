'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Search, ChevronDown } from 'lucide-react'

interface ProjectCard {
  id: string
  title: string
  description: string
  category: string
  timeline: string
  level: string
  proposals: number
  tags: string[]
  author: string
  timePosted: string
  featured?: boolean
}

// projects are fetched from the API and stored in state

// sidebar removed - only main content kept

const categoryTabs = [
  'All Categories',
  'ICP Development',
  'Web Development',
  'Blockchain',
  'Design',
  'AI/ML'
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
  const [selectedCategory, setSelectedCategory] = useState('ICP Development')
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
    fetch('/api/projects')
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return
        if (json?.ok && Array.isArray(json.projects)) {
          setProjects(json.projects)
        } else if (Array.isArray(json)) {
          // some APIs return array directly
          setProjects(json)
        } else {
          setProjects([])
        }
      })
      .catch((err) => {
        console.error('Failed to fetch projects', err)
        setError('Failed to load projects')
      })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

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
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex gap-8">
        {/* Projects Section */}
        <div className="flex-1">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800 mb-1">Browse Projects</h1>
                <p className="text-gray-600">Join Exciting Hackathons and win prizes</p>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-4 mb-6 overflow-x-auto">
                {categoryTabs.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`rounded-full px-8 py-2 whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-white text-black border-gray-300 shadow-sm'
                        : 'border-gray-400 text-gray-600'
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
                  <div className="col-span-2 p-6 text-center">Loading projects…</div>
                )}

                {!loading && error && (
                  <div className="col-span-2 p-6 text-center text-red-600">{error}</div>
                )}

                {!loading && !error && filteredProjects.map((project) => (
                  <Card key={project.id} className={`p-5 ${project.featured ? 'shadow-lg' : ''}`}>
                    <CardHeader className="p-0 mb-5">
                      <div className="flex justify-between items-start mb-4">
                        <CardTitle className="text-xl font-medium text-gray-800 flex-1 mr-4">
                          {project.title}
                        </CardTitle>
                        <Badge variant="secondary" className="bg-transparent border-0 text-xs px-0">
                          Design
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="font-medium text-gray-800">{project.author}</span>
                        <span className="text-gray-500 italic">{project.timePosted}</span>
                      </div>

                      <div className="flex gap-2 mb-4">
                        {project.tags?.map((tag) => (
                          <Badge key={tag} className="bg-blue-500 text-white text-xs px-3 py-1">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>

                    <CardContent className="p-0">
                      <CardDescription className="text-gray-600 mb-4 text-sm">
                        {project.description}
                      </CardDescription>

                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Category</span>
                          <span className="text-gray-700 font-medium">{project.category}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Timeline</span>
                          <span className="text-gray-600">{project.timeline}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Level</span>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 font-medium">
                            {project.level}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Proposals</span>
                          <span className="text-gray-600">{project.proposals}</span>
                        </div>
                      </div>

                      <Button className="w-full bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full py-3">
                        Register Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Filters Sidebar */}
            <div className="w-48 space-y-6">
              {/* Job Type Filter */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-gray-800">Job Type</h3>
                  <Button variant="link" className="text-blue-500 text-xs p-0 h-auto">
                    Clear
                  </Button>
                </div>
                <div className="space-y-2">
                  {jobTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={selectedJobTypes.includes(type)}
                        onCheckedChange={(checked: any) => handleJobTypeChange(type, !!checked)}
                      />
                      <label htmlFor={type} className="text-sm text-gray-600">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Roles Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Job Roles</h3>
                <div className="space-y-2">
                  {jobRoles.map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={role}
                        checked={selectedJobRoles.includes(role)}
                        onCheckedChange={(checked: any) => handleJobRoleChange(role, !!checked)}
                      />
                      <label htmlFor={role} className="text-sm text-gray-600">
                        {role}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remote Only Toggle */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Remote Only</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="remote-only"
                    checked={remoteOnly}
                    onCheckedChange={setRemoteOnly}
                  />
                  <label htmlFor="remote-only" className="text-sm text-gray-400">
                    {remoteOnly ? 'On' : 'Off'}
                  </label>
                </div>
              </div>

              {/* Salary Range Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Salary Range</h3>
                <div className="space-y-2">
                  {salaryRanges.map((range) => (
                    <div key={range} className="flex items-center space-x-2">
                      <Checkbox
                        id={range}
                        checked={selectedSalaryRanges.includes(range)}
                        onCheckedChange={(checked: any) => handleSalaryRangeChange(range, !!checked)}
                      />
                      <label htmlFor={range} className="text-sm text-gray-600">
                        {range}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Location</h3>
                <Input
                  type="text"
                  placeholder="Anywhere"
                  className="text-sm border-gray-300"
                />
              </div>
            </div>
          </div>
      </div>
  )
}