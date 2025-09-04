'use client'

import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

interface HackathonCard {
  id: string
  title: string
  description: string
  organizer: string
  mode: string
  prizePool: string
  timeline: string
  registrationCloses: string
  tags: string[]
  status: 'REGISTRATION OPEN' | 'UPCOMING' | 'ONGOING' | 'COMPLETED'
  featured?: boolean
}

const hackathonData: HackathonCard[] = [
  {
    id: '1',
    title: 'Web3 Security Challenge',
    description: 'Focus on building secure, auditable smart contracts and identifying vulnerabilities in existing protocols. Help make Web3 safer for everyone.',
    organizer: 'Security First',
    mode: 'Virtual',
    prizePool: '$75,000',
    timeline: '537 days',
    registrationCloses: '3 days',
    tags: ['Smart', 'Contracts'],
    status: 'REGISTRATION OPEN',
    featured: true
  },
  {
    id: '2',
    title: 'Web3 Security Challenge',
    description: 'Focus on building secure, auditable smart contracts and identifying vulnerabilities in existing protocols. Help make Web3 safer for everyone.',
    organizer: 'Security First',
    mode: 'Virtual',
    prizePool: '$75,000',
    timeline: '537 days',
    registrationCloses: '3 days',
    tags: ['Smart', 'Contracts'],
    status: 'REGISTRATION OPEN'
  },
  {
    id: '3',
    title: 'Web3 Security Challenge',
    description: 'Focus on building secure, auditable smart contracts and identifying vulnerabilities in existing protocols. Help make Web3 safer for everyone.',
    organizer: 'Security First',
    mode: 'Virtual',
    prizePool: '$75,000',
    timeline: '537 days',
    registrationCloses: '3 days',
    tags: ['Smart', 'Contracts'],
    status: 'REGISTRATION OPEN'
  },
  {
    id: '4',
    title: 'Web3 Security Challenge',
    description: 'Focus on building secure, auditable smart contracts and identifying vulnerabilities in existing protocols. Help make Web3 safer for everyone.',
    organizer: 'Security First',
    mode: 'Virtual',
    prizePool: '$75,000',
    timeline: '537 days',
    registrationCloses: '3 days',
    tags: ['Smart', 'Contracts'],
    status: 'REGISTRATION OPEN'
  }
]

const sidebarItems = [
  { icon: LayoutGrid, label: 'Dashboard', active: false },
  { icon: Briefcase, label: 'Browse Projects', active: false },
  { icon: Megaphone, label: 'Bounties', active: false },
  { icon: User, label: 'My Projects', active: false },
  { icon: MessageCircle, label: 'Messages', active: false },
  { icon: Code2, label: 'Hackathons', active: true },
  { icon: DollarSign, label: 'Payments', active: false },
  { icon: BarChart3, label: 'Analytics', active: false }
]

const eventTabs = [
  'All Events',
  'Open Registration',
  'Upcoming',
  'Ongoing',
  'Completed'
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
    case 'REGISTRATION OPEN':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'UPCOMING':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'ONGOING':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'COMPLETED':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function HackathonsDashboard() {
  const [selectedTab, setSelectedTab] = useState('Open Registration')
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
                      ? 'border-2 border-blue-400 text-black'
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
            {/* Hackathons Section */}
            <div className="flex-1">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800 mb-1">Hackathons</h1>
                <p className="text-gray-600">Join Exciting Hackathons and win prizes</p>
              </div>

              {/* Event Tabs */}
              <div className="flex gap-4 mb-6 overflow-x-auto">
                {eventTabs.map((tab) => (
                  <Button
                    key={tab}
                    variant={selectedTab === tab ? "default" : "outline"}
                    className={`rounded-full px-8 py-2 whitespace-nowrap ${
                      selectedTab === tab
                        ? 'bg-white text-black border-gray-300 shadow-sm'
                        : 'border-gray-400 text-gray-600'
                    }`}
                    onClick={() => setSelectedTab(tab)}
                  >
                    {tab}
                  </Button>
                ))}
              </div>

              {/* Hackathons Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {hackathonData.map((hackathon) => (
                  <Card key={hackathon.id} className={`p-5 ${hackathon.featured ? 'shadow-lg' : ''}`}>
                    <CardHeader className="p-0 mb-5">
                      <div className="flex justify-between items-start mb-4">
                        <CardTitle className="text-xl font-medium text-gray-800 flex-1 mr-4">
                          {hackathon.title}
                        </CardTitle>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs px-2 py-1 border rounded-full ${getStatusColor(hackathon.status)}`}
                        >
                          {hackathon.status}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center text-base mb-2">
                        <span className="font-medium text-gray-800">{hackathon.organizer}</span>
                        <span className="text-gray-500 italic text-sm">Mode: {hackathon.mode}</span>
                      </div>

                      <div className="flex gap-2 mb-4">
                        {hackathon.tags.map((tag, index) => (
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
                      <CardDescription className="text-gray-600 mb-4 text-sm leading-relaxed">
                        {hackathon.description}
                      </CardDescription>

                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Prize Pool</span>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 font-medium">
                            {hackathon.prizePool}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Timeline</span>
                          <span className="text-gray-600">{hackathon.timeline}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Registration closes in</span>
                          <span className="text-gray-600">{hackathon.registrationCloses}</span>
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