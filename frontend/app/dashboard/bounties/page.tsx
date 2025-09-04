'use client'

import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Search,
  ChevronDown,
  LayoutGrid,
  Briefcase,
  Megaphone,
  User,
  MessageCircle,
  DollarSign,
  BarChart3,
  Code2
} from 'lucide-react'

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

const sidebarItems = [
  { icon: LayoutGrid, label: 'Dashboard', active: false },
  { icon: Briefcase, label: 'Browse Projects', active: false },
  { icon: Megaphone, label: 'Bounties', active: true },
  { icon: User, label: 'My Projects', active: false },
  { icon: MessageCircle, label: 'Messages', active: false },
  { icon: Code2, label: 'Hackathons', active: false },
  { icon: DollarSign, label: 'Payments', active: false },
  { icon: BarChart3, label: 'Analytics', active: false }
]

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

  return (
    <div className="min-h-screen bg-[#f6f8f9]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">ICPWork</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search your industry here..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 pr-12 py-2 w-full border-gray-300 rounded-full bg-gray-50"
              />
              <Button
                size="sm"
                className="absolute right-1 top-1 bg-green-600 hover:bg-green-700 rounded-full w-8 h-8 p-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 border shadow-sm">
            <Avatar className="w-6 h-6">
              <AvatarImage src="" alt="John Dee" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-900">John Dee</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              {sidebarItems.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 px-5 py-3 rounded-lg cursor-pointer transition-colors ${
                    item.active
                      ? 'border-2 border-blue-400 text-gray-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="flex gap-8">
            {/* Bounties Section */}
            <div className="flex-1">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800 mb-1">Bounties</h1>
                <p className="text-gray-600">Discover Bounties and earn rewards</p>
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