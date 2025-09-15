import React from 'react'
import { DollarSignIcon, UsersIcon, UserIcon, BuildingIcon } from 'lucide-react'
export function MetricCards() {
  const metrics = [
    {
      title: 'Total Revenue',
      value: '$17,500.90',
      icon: <DollarSignIcon size={20} className="text-gray-500" />,
      increase: '+12.5%',
    },
    {
      title: 'Active Freelancers',
      value: '5000',
      icon: <UsersIcon size={20} className="text-gray-500" />,
      increase: '+12.5%',
    },
    {
      title: 'Customers',
      value: '5022',
      icon: <UserIcon size={20} className="text-gray-500" />,
      increase: '+12.5%',
    },
    {
      title: 'Enterprice Customers',
      value: '233',
      icon: <BuildingIcon size={20} className="text-gray-500" />,
      increase: '+12.5%',
    },
  ]
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">{metric.title}</p>
              <h3 className="text-2xl font-bold mt-2">{metric.value}</h3>
            </div>
            <div className="p-2 bg-gray-50 rounded-md">{metric.icon}</div>
          </div>
          <div className="mt-4">
            <span className="text-green-500 text-sm">{metric.increase}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
