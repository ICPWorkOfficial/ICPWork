import React from 'react'
import { LayoutGrid, Briefcase, Settings, User, Package } from 'lucide-react'
export function Sidebar() {
  return (
    <aside className="w-[240px] bg-white border-r border-gray-200 flex-shrink-0 hidden md:block">
      <div className="p-4 ">
        <div className="flex items-center">
          <div className="flex items-center gap-2">
    <div className="w-[57px] h-[33px]">
      <svg viewBox="0 0 57 33" fill="none" className="w-full h-full">
        <path d="M40.1879 8.63504L32.2559 10.2732L25.8785 16.0471L18.2052 8.3738L18.2457 8.33328L11.1216 1.20916C9.50931 -0.403096 6.89434 -0.403096 5.28209 1.20916L1.20919 5.28206C-0.403065 6.89432 -0.403065 9.50928 1.20919 11.1215L18.4285 28.3408C23.8524 33.7647 32.6474 33.7647 38.0713 28.3408L38.1213 28.2908L55.0284 11.3836L50.0424 6.47868L40.1879 8.63504Z" fill="url(#paint0_linear)" />
        <path d="M50.1 6.4793L43.8062 7.68634L39.4091 8.63473L38.6832 9.0296L31.0349 1.38128C29.4226 -0.230975 26.8077 -0.230975 25.1954 1.38128L18.2437 8.33297L30.7409 20.8301C34.8379 24.9272 41.4809 24.9272 45.5788 20.8301L48.0317 18.3773L55.0265 11.3825L50.1009 6.4793H50.1Z" fill="url(#paint1_linear)" />
        <path d="M18.2441 8.33384L18.2039 8.37407L38.1198 28.29L38.1601 28.2498L18.2441 8.33384Z" fill="#FDB131" />
        <path d="M55.0284 11.3825C51.1668 15.2441 44.9057 15.2441 41.0432 11.3825L38.1635 8.5028L45.1557 1.5106C46.768 -0.101657 49.3829 -0.101657 50.9952 1.5106L55.0276 5.54297C56.6398 7.15523 56.6398 9.7702 55.0276 11.3825H55.0284Z" fill="#29AAE1" />
        <defs>
          <linearGradient id="paint0_linear" x1="15.066" y1="-1.80067" x2="47.4853" y2="30.6187" gradientUnits="userSpaceOnUse">
            <stop offset="0.21" stopColor="#F05A24" />
            <stop offset="0.68" stopColor="#FAAF3B" />
          </linearGradient>
          <linearGradient id="paint1_linear" x1="26.2265" y1="-0.549979" x2="55.4515" y2="28.675" gradientUnits="userSpaceOnUse">
            <stop offset="0.22" stopColor="#EC1E79" />
            <stop offset="0.89" stopColor="#522784" />
          </linearGradient>
        </defs>
      </svg>
    </div>
    <span className="text-[24px] font-bold text-black">ICPWork</span>
    <span className="text-[16px] font-normal text-black">®</span>
  </div>
        </div>
      </div>
      <nav className="p-4">
        {/* <p className="text-sm font-medium text-gray-500 mb-4">Main Menu</p> */}
        <ul className="space-y-2">
          {/* <li>
            <a
              href="#"
              className="flex items-center text-gray-600 p-2 rounded-md hover:bg-gray-100"
            >
              <LayoutGrid className="mr-3" size={20} />
              <span>Workspace</span>
            </a>
          </li> */}
          <li>
            <a
              href="/job-posting"
              className="flex items-center text-gray-600 p-2 rounded-md hover:bg-gray-100"
            >
              <Briefcase className="mr-3" size={20} />
              <span>Post Jobs</span>
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
     
      </nav>
    </aside>
  )
}
