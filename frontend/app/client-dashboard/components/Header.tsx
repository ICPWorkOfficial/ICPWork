import React from 'react'
import { SearchIcon, ChevronDownIcon } from 'lucide-react'
export function Header() {
  return (
    <header className="bg-white p-4 border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search your industry here..."
            className="w-full py-2 pl-4 pr-10 rounded-full bg-[#f6f8f9] text-[#525252] focus:outline-none"
          />
          <button className="absolute right-0 top-0 h-full px-3 flex items-center justify-center rounded-r-full bg-[#28a745] text-white">
            <SearchIcon size={20} />
          </button>
        </div>
        {/* User Menu */}
        <div className="flex items-center ml-4">
          <div className="flex items-center mr-4 cursor-pointer">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
              <span className="text-xs">🌐</span>
            </div>
            <span className="text-sm hidden md:inline">Client</span>
            <ChevronDownIcon size={16} className="ml-1" />
          </div>
          <div className="flex items-center cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
              <span className="text-xs">👤</span>
            </div>
            <span className="text-sm hidden md:inline">John Doe</span>
            <ChevronDownIcon size={16} className="ml-1" />
          </div>
        </div>
      </div>
    </header>
  )
}
