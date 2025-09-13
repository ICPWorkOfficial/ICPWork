import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import {
  DollarSignIcon,
  CheckIcon,
  StarIcon,
  EyeIcon,
  TrendingUpIcon,
} from 'lucide-react'
import { BarChart, Bar } from 'recharts'
import { PieChart, Pie, Cell, Legend } from 'recharts'

// Dashboard composed view
export function Dashboard() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#272d37]">Analytics Dashboard</h1>
          <p className="text-gray-500">Manage your projects and proposals</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-gradient-to-r from-[#fdb131] to-[#eb6528] text-white px-4 py-1.5 rounded-full text-sm">
            7 Days
          </button>
          <button className="bg-white text-gray-600 px-4 py-1.5 rounded-full text-sm">30 Days</button>
          <button className="bg-white text-gray-600 px-4 py-1.5 rounded-full text-sm">90 Days</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Total Earnings"
          value="$17,500.90"
          subtext="USD EQUIVALENT"
          percentChange={12.5}
          icon="dollar"
        />
        <MetricCard
          title="Completed"
          value="98.5%"
          subtext="PROJECTS FINISHED"
          percentChange={12.5}
          icon="check"
        />
        <MetricCard
          title="Client Rating"
          value="5"
          subtext="IN PROGRESS"
          percentChange={12.5}
          icon="star"
        />
        <MetricCard
          title="Profile Views"
          value="100%"
          subtext="CLIENT SATISFACTION"
          percentChange={12.5}
          icon="eye"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <EarningOverview />
        <ProjectCategories />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkillsDistribution />
        <PerformanceInsights />
      </div>
    </div>
  )
}

// EarningOverview
export function EarningOverview() {
  const data = [
    { month: 'Jan', earnings: 1000 },
    { month: 'Feb', earnings: 2000 },
    { month: 'Mar', earnings: 3500 },
    { month: 'Apr', earnings: 2500 },
    { month: 'May', earnings: 5000 },
    { month: 'Jun', earnings: 4000 },
  ]
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm">
      <h3 className="text-[#272d37] font-medium mb-4">Earning Overview</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="earningGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff92ae" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#e51f7a" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} domain={[0, 6000]} ticks={[0, 1000, 2000, 3000, 4000, 5000, 6000]} />
            <Tooltip />
            <Area type="monotone" dataKey="earnings" stroke="#e51f7a" strokeWidth={2} fillOpacity={1} fill="url(#earningGradient)" dot={{ stroke: '#e51f7a', strokeWidth: 2, r: 4, fill: '#fff' }} activeDot={{ stroke: '#e51f7a', strokeWidth: 2, r: 6, fill: '#fff' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// MetricCard
interface MetricCardProps {
  title: string
  value: string
  subtext: string
  percentChange: number
  icon: 'dollar' | 'check' | 'star' | 'eye'
}
export function MetricCard({ title, value, subtext, percentChange, icon }: MetricCardProps) {
  const renderIcon = () => {
    switch (icon) {
      case 'dollar':
        return <DollarSignIcon size={18} className="text-gray-500" />
      case 'check':
        return <CheckIcon size={18} className="text-gray-500" />
      case 'star':
        return <StarIcon size={18} className="text-gray-500" />
      case 'eye':
        return <EyeIcon size={18} className="text-gray-500" />
      default:
        return null
    }
  }
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[#272d37] text-sm font-medium">{title}</h3>
        <span className="text-[#29a3da] flex items-center text-xs font-medium">
          <TrendingUpIcon size={12} className="mr-1" />+{percentChange}%
        </span>
      </div>
      <div className="flex items-center mb-1">
        {icon === 'dollar' && <span className="text-2xl font-bold text-[#272d37]">{value}</span>}
        {icon !== 'dollar' && (
          <>
            <div className="mr-2 p-1 rounded bg-gray-100">{renderIcon()}</div>
            <span className="text-2xl font-bold text-[#272d37]">{value}</span>
          </>
        )}
      </div>
      <p className="text-xs text-gray-500">{subtext}</p>
    </div>
  )
}

// PerformanceInsights
export function PerformanceInsights() {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm">
      <h3 className="text-[#272d37] font-medium mb-4">Performance Insights</h3>
      <div className="mb-4 bg-[#f8fdff] p-4 rounded-lg border border-[#e0f5ff]">
        <h4 className="text-[#29a3da] font-medium mb-1">Strong Performance</h4>
        <p className="text-sm text-[#272d37]">Your earnings increased by 23% this month. You're in the top 10% of freelancers on the platform!</p>
      </div>
      <div className="mb-4 bg-[#fff9f0] p-4 rounded-lg border border-[#ffefd0]">
        <h4 className="text-[#fdb131] font-medium mb-1">Optimization Tip</h4>
        <p className="text-sm text-[#272d37]">Consider increasing your rates for ICP development projects. Market data shows 15% higher rates for similar skills.</p>
      </div>
      <div className="bg-[#fef6f9] p-4 rounded-lg border border-[#ffe0ed]">
        <h4 className="text-[#e41e79] font-medium mb-1">Client Feedback</h4>
        <p className="text-sm text-[#272d37]">Your client satisfaction score is exceptional at 4.9/5. Keep up the excellent work!</p>
      </div>
    </div>
  )
}

// ProjectCategories
export function ProjectCategories() {
  const data = [
    { month: 'Jan', value: 10 },
    { month: 'Feb', value: 20 },
    { month: 'Mar', value: 30 },
    { month: 'Apr', value: 40 },
    { month: 'May', value: 30 },
    { month: 'Jun', value: 20 },
  ]
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm">
      <h3 className="text-[#272d37] font-medium mb-4">Project Categories</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} hide={true} />
            <Tooltip />
            <Bar dataKey="value" fill="#29a3da" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// SkillsDistribution
export function SkillsDistribution() {
  const data = [
    { name: 'ICP Development', value: 35, color: '#f3a83b' },
    { name: 'React', value: 25, color: '#e41e79' },
    { name: 'Smart Contracts', value: 20, color: '#8234ae' },
    { name: 'UI/UX Design', value: 15, color: '#29aae1' },
    { name: 'Other', value: 5, color: '#e95a24' },
  ]
  const COLORS = ['#f3a83b', '#e41e79', '#8234ae', '#29aae1', '#e95a24']
  const renderCustomizedLabel = () => null
  const renderLegendContent = (props: any) => {
    const { payload } = props
    return (
      <ul className="mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
              <span className="text-sm text-[#272d37]">{entry.value}</span>
            </div>
            <span className="text-sm font-medium text-[#272d37]">{entry.payload.value}%</span>
          </li>
        ))}
      </ul>
    )
  }
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm">
      <h3 className="text-[#272d37] font-medium mb-4">Skills Distribution</h3>
      <div className="h-64 flex items-center justify-center">
        <div className="w-full h-full flex">
          <div className="w-1/2 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel} outerRadius={80} innerRadius={40} fill="#8884d8" dataKey="value">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend content={renderLegendContent} layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2">
            {data.map((item, index) => (
              <div key={index} className="flex justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-[#272d37]">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-[#272d37]">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
