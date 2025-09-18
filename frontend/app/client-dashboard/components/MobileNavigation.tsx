import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Sidebar } from './Sidebar'
export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="md:hidden">
      <button onClick={() => setIsOpen(true)} className="p-2 text-gray-600">
        <Menu size={24} />
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            <div className="flex justify-end p-4">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}
    </div>
  )
}
