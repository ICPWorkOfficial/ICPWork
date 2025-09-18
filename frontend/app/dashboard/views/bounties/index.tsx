'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Search, ChevronDown } from 'lucide-react'

interface BountyCard {
  id: string
  title: string
  organizer: string
  mode: string
  prizePool: string
  timeline: string
  tags: string[]
  status: 'Open' | 'Closed' | 'In Progress' | 'Completed'
  featured?: boolean
}

const bountyData: BountyCard[] = [
  {
    id: '1',
    title: 'Web3 Security Challenge',
    organizer: 'Security First',
    mode: 'Virtual',
    prizePool: '$75,000',
    timeline: '537 days',
    tags: ['Smart', 'Contracts'],
    status: 'Open',
    featured: true
  },
  {
    id: '2',
    title: 'Web3 Security Challenge',
    organizer: 'Security First',
    mode: 'Virtual',
    prizePool: '$75,000',
    timeline: '537 days',
    tags: ['Smart', 'Contracts'],
    status: 'Open'
  },
  {
    id: '3',
    title: 'Web3 Security Challenge',
    organizer: 'Security First',
    mode: 'Virtual',
    prizePool: '$75,000',
    timeline: '537 days',
    tags: ['Smart', 'Contracts'],
    status: 'Open',
    featured: true
  },
  {
    id: '4',
    title: 'Web3 Security Challenge',
    organizer: 'Security First',
    mode: 'Virtual',
    prizePool: '$75,000',
    timeline: '537 days',
    tags: ['Smart', 'Contracts'],
    status: 'Open'
  }
]

// sidebar removed - only main content kept

const categoryTabs = [
  'All Categories',
  'Smart Contracts',
  'Frontend',
  'Backend',
  'Documentation',
  'User Testing'
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Open':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'Completed':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'Closed':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function BountiesDashboard() {
  const [selectedCategory, setSelectedCategory] = useState('Smart Contracts')
  const [searchQuery, setSearchQuery] = useState('')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [activeOnly, setActiveOnly] = useState(false)
  const [postings, setPostings] = useState<BountyCard[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([])
  const [selectedJobRoles, setSelectedJobRoles] = useState<string[]>(['Programming'])
  const [selectedSalaryRanges, setSelectedSalaryRanges] = useState<string[]>([])

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

  // Load job postings from API and update when filters change
  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (selectedCategory && selectedCategory !== 'All Categories') params.set('category', selectedCategory)
        if (activeOnly) params.set('active', 'true')
        const url = '/api/job-postings' + (params.toString() ? `?${params.toString()}` : '')
        const res = await fetch(url)
        if (!mounted) return
        if (!res.ok) {
          setPostings(null)
          return
        }
        const json = await res.json()
        const items = json?.postings || (Array.isArray(json) ? json : [])
        // Map API items to BountyCard shape where possible
        const mapped: BountyCard[] = items.map((it: any, idx: number) => ({
          id: String(it.id || it._id || idx + 1),
          title: it.jobTitle || it.title || 'Untitled',
          organizer: it.clientEmail || it.organizer || it.company || 'Unknown',
          mode: it.mode || (it.workplaceType ? it.workplaceType : 'Virtual'),
          prizePool: it.budget || it.prizePool || '$0',
          timeline: it.timeline || it.duration || '',
          tags: Array.isArray(it.tags) ? it.tags : (Array.isArray(it.skillsRequired) ? it.skillsRequired : (Array.isArray(it.jobRoles) ? it.jobRoles : [])),
          status: it.active === false ? 'Closed' : (it.status || (it.active ? 'Open' : 'Open')),
          featured: !!it.featured
        }))
        setPostings(mapped)
      } catch (e) {
        setPostings(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [selectedCategory, activeOnly])

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Main Content */}
        <div className="flex gap-8">
          <div className="flex gap-8">
            {/* Bounties Section */}
            <div className="flex-1">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800 mb-1">Jobs & Bounties</h1>
                <p className="text-gray-600">Discover Jobs & Bounties</p>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-6 mb-8 overflow-x-auto">
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

              {/* Bounties Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                {bountyData.map((bounty) => (
                  <Card key={bounty.id} className={`p-5 ${bounty.featured ? 'shadow-lg' : ''}`}>
                    <CardHeader className="p-0 mb-5">
                      <div className="flex justify-between items-start mb-4">
                        <CardTitle className="text-xl font-medium text-gray-800 flex-1 mr-4">
                          {bounty.title}
                        </CardTitle>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs px-2 py-1 border rounded-full ${getStatusColor(bounty.status)}`}
                        >
                          {bounty.status}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center text-base mb-2">
                        <span className="font-medium text-gray-800">{bounty.organizer}</span>
                        <span className="text-gray-500 italic text-sm">Mode: {bounty.mode}</span>
                      </div>

                      <div className="flex gap-2 mb-4">
                        {bounty.tags.map((tag, index) => (
                          <Badge 
                            key={tag} 
                            className={`text-xs px-3 py-1 ${
                              index === 0 
                                ? 'bg-blue-200 text-black' 
                                : 'bg-pink-200 text-black'
                            }`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>

                    <CardContent className="p-0">
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Prize Pool</span>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 font-medium">
                            {bounty.prizePool}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Timeline</span>
                          <span className="text-gray-600">{bounty.timeline}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Participants</span>
                          <span className="text-gray-600">Register Now</span>
                        </div>
                      </div>

                      <Button className="w-full bg-blue-300 text-gray-600 hover:bg-gray-200 rounded-full py-3">
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
                        onCheckedChange={(checked) => handleJobTypeChange(type, !!checked)}
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
                        onCheckedChange={(checked) => handleJobRoleChange(role, !!checked)}
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

              {/* Active Only Toggle (controls API ?active=true) */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Active Only</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active-only"
                    checked={activeOnly}
                    onCheckedChange={setActiveOnly}
                  />
                  <label htmlFor="active-only" className="text-sm text-gray-400">
                    {activeOnly ? 'On' : 'Off'}
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
                        onCheckedChange={(checked) => handleSalaryRangeChange(range, !!checked)}
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
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Anywhere"
                    className="text-sm border-gray-300 pr-8"
                  />
                  <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}