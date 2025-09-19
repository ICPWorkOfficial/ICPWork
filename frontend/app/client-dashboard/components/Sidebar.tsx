import React from 'react'
import { LayoutGrid, Briefcase, Settings, User, Package } from 'lucide-react'
export function Sidebar() {
  return (
    <aside className="w-[240px] bg-white border-r border-gray-200 flex-shrink-0 hidden md:block">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="mr-2">
            <svg
              width="48"
              height="32"
              viewBox="0 0 48 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19.2 0L9.6 16H0L9.6 0H19.2Z" fill="#FF5722" />
              <path d="M28.8 0L19.2 16H9.6L19.2 0H28.8Z" fill="#FF9800" />
              <path d="M38.4 0L28.8 16H19.2L28.8 0H38.4Z" fill="#FFEB3B" />
              <path d="M48 0L38.4 16H28.8L38.4 0H48Z" fill="#8BC34A" />
              <path d="M28.8 16L19.2 32H9.6L19.2 16H28.8Z" fill="#00BCD4" />
              <path d="M38.4 16L28.8 32H19.2L28.8 16H38.4Z" fill="#3F51B5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#041d37]">ICPWork</h1>
        </div>
      </div>
      <nav className="p-4">
        <p className="text-sm font-medium text-gray-500 mb-4">Main Menu</p>
        <ul className="space-y-2">
          <li>
            <a
              href="#"
              className="flex items-center text-gray-600 p-2 rounded-md hover:bg-gray-100"
            >
              <LayoutGrid className="mr-3" size={20} />
              <span>Workspace</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center text-gray-600 p-2 rounded-md hover:bg-gray-100"
            >
              <Briefcase className="mr-3" size={20} />
              <span>Find Jobs</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center bg-green-50 text-[#28a745] p-2 rounded-md border border-green-200"
            >
              <svg
                className="mr-3"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 8.5V13.5M17.5 11H22.5M8 15H16M7 18H17M11.5 6.5H12.5M4 11.5H5M6 6.5H7M16.5 3H18C19.1046 3 20 3.89543 20 5V7M16.5 21H18C19.1046 21 20 20.1046 20 19V17M7.5 21H6C4.89543 21 4 20.1046 4 19V17M7.5 3H6C4.89543 3 4 3.89543 4 5V7"
                  stroke="#28a745"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Explore Talent</span>
            </a>
          </li>
          <li>
            <a
              href="/orders"
              className="flex items-center text-gray-600 p-2 rounded-md hover:bg-gray-100"
            >
              <Package className="mr-3" size={20} />
              <span>My Orders</span>
            </a>
          </li>
        </ul>
        <p className="text-sm font-medium text-gray-500 mt-8 mb-4">Settings</p>
        <ul className="space-y-2">
          <li>
            <a
              href="#"
              className="flex items-center text-gray-600 p-2 rounded-md hover:bg-gray-100"
            >
              <User className="mr-3" size={20} />
              <span>Account Setting</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  )
}
