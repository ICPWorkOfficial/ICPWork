import React from 'react'
import { ChevronDownIcon } from 'lucide-react'
interface FiltersProps {
  filters: {
    topRated: boolean
    bestSeller: boolean
  }
  setFilters: React.Dispatch<
    React.SetStateAction<{
      topRated: boolean
      bestSeller: boolean
    }>
  >
}
export function Filters({ filters, setFilters }: FiltersProps) {
  return (
    <div className="flex flex-wrap items-center justify-between mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">Filter :</span>
        <div className="relative">
          <button className="flex items-center px-4 py-2 bg-white rounded-md border border-gray-200 text-sm">
            Seller Details
            <ChevronDownIcon size={16} className="ml-2" />
          </button>
        </div>
        <div className="relative">
          <button className="flex items-center px-4 py-2 bg-white rounded-md border border-gray-200 text-sm">
            Ratings
            <ChevronDownIcon size={16} className="ml-2" />
          </button>
        </div>
        <div className="relative">
          <button className="flex items-center px-4 py-2 bg-white rounded-md border border-gray-200 text-sm">
            Budget
            <ChevronDownIcon size={16} className="ml-2" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 sm:mt-0">
        <div className="flex items-center">
          <span className="text-sm mr-2">Top Rated</span>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={filters.topRated}
              onChange={() =>
                setFilters((prev) => ({
                  ...prev,
                  topRated: !prev.topRated,
                }))
              }
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28a745]"></div>
          </label>
        </div>
        <div className="flex items-center">
          <span className="text-sm mr-2">Best Seller</span>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={filters.bestSeller}
              onChange={() =>
                setFilters((prev) => ({
                  ...prev,
                  bestSeller: !prev.bestSeller,
                }))
              }
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28a745]"></div>
          </label>
        </div>
      </div>
    </div>
  )
}
