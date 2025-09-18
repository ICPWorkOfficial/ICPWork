"use client"
import React, { useState } from 'react'
import { FileIcon } from 'lucide-react'

const RequirementForm = () => {
  const [answers, setAnswers] = useState({
    question1: '',
    question2: 'You Should have to work on that.',
  })
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers({
      ...answers,
      [e.target.name]: e.target.value,
    })
  }
  return (
    <div>
      <h2 className="text-3xl font-bold text-[#161616]">Submit Your Requirements</h2>
      <p className="text-[#28a745] mt-2 mb-8">Cryus will not start working until you submit the requirement.</p>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Quick Questions</h3>
        <div className="mb-4">
          <div className="border rounded-lg p-4 bg-white">
            <p className="uppercase text-sm text-gray-500 mb-2">HOW DO I BECOME A PART OF ORGANAISE'D'S FREELANCE NETWORK?</p>
            <div className="flex items-center">
              <span className="font-medium mr-2">Ans :</span>
              <input
                type="text"
                name="question1"
                value={answers.question1}
                onChange={handleChange}
                className="w-full focus:outline-none"
                placeholder=""
              />
            </div>
          </div>
        </div>
        <div className="mb-4">
          <div className="border rounded-lg p-4 bg-white">
            <p className="uppercase text-sm text-gray-500 mb-2">HOW DO I BECOME A PART OF ORGANAISE'D'S FREELANCE NETWORK?</p>
            <div className="flex items-center">
              <span className="font-medium mr-2">Ans :</span>
              <input
                type="text"
                name="question2"
                value={answers.question2}
                onChange={handleChange}
                className="w-full focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Upload Document</h3>
        <div className="border rounded-lg p-4 flex items-center">
          <p className="uppercase text-sm text-gray-500">ADD YOUR DOCUMENT</p>
        </div>
        <div className="border rounded-lg p-6 mt-2 flex items-center justify-center cursor-pointer hover:bg-gray-50">
          <FileIcon className="h-5 w-5 mr-2 text-gray-600" />
          <span className="text-gray-700">Click here to upload Your Resume</span>
        </div>
      </div>
      <div className="flex space-x-4 mt-8">
        <button className="px-6 py-3 border border-[#161616] rounded-full hover:bg-gray-100 transition">Remind me, Later</button>
        <button className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition">Send Requirements</button>
      </div>
    </div>
  )
}

import { ChevronDownIcon, CheckIcon } from 'lucide-react'

const OrderSummary = () => {
  return (
    <div className="p-6 md:p-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Order Summary</h3>
        <ChevronDownIcon className="h-5 w-5" />
      </div>
      <div className="bg-[#e8f3ff] p-6 rounded-lg">
        <div className="flex mb-4">
          <div className="w-1/3">
            <img
              src="https://mirrorful-production.s3.us-west-1.amazonaws.com/patterns/files/e5ce6c85-4d34-47b3-a490-4961b7452734/figma-preview.jpg"
              alt="Service preview"
              className="w-full h-auto rounded"
            />
          </div>
          <div className="w-2/3 pl-4">
            <p className="text-sm">I will do website ui, figma website design, website design figma, figma design website</p>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4 pb-2">
          <div className="flex justify-between mb-3">
            <span>Basic Tier</span>
            <span className="font-medium">$ 10</span>
          </div>
          <div className="flex justify-between mb-3">
            <span>Delivery Time</span>
            <span>3 days</span>
          </div>
          <div className="flex justify-between mb-3">
            <span>Commercial Use</span>
            <CheckIcon className="h-5 w-5 text-green-500" />
          </div>
          <div className="flex justify-between mb-3">
            <span>Source File</span>
            <CheckIcon className="h-5 w-5 text-green-500" />
          </div>
          <div className="flex justify-between mb-3">
            <span>Interactive Mockup</span>
            <CheckIcon className="h-5 w-5 text-green-500" />
          </div>
        </div>
        <div className="pt-4">
          <p className="text-green-500 mb-4">Have a Promo code ?</p>
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between mb-3">
              <span>Total</span>
              <span className="font-medium">$10</span>
            </div>
            <div className="flex justify-between mb-3">
              <span>Taxes</span>
              <span>$2</span>
            </div>
            <div className="flex justify-between mb-3 font-medium">
              <span>Final Paid Amount</span>
              <span>$12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Header = () => {
  return (
    <header className="w-full px-6 md:px-12 py-4 flex items-center justify-between border-b border-gray-200">
      <div className="flex items-center space-x-8">
        <h1 className="text-2xl font-bold">Organaise</h1>
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="text-[#161616] hover:underline">Find Talent</a>
          <a href="#" className="text-[#161616] hover:underline">Find Jobs</a>
          <a href="#" className="text-[#161616] hover:underline">Find Work</a>
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center">
          <div className="relative">
            <input type="text" placeholder="Search your industry here..." className="bg-[#f4f4f4] text-[#6f6f6f] py-2 pl-10 pr-4 rounded-l-full w-64 focus:outline-none" />
          </div>
          <div className="bg-[#041d37] text-white py-2 px-4 rounded-r-full flex items-center">
            <span>Freelancer</span>
          </div>
        </div>
        <a href="#" className="text-[#161616] font-medium hidden md:block">Log In</a>
        <a href="#" className="bg-[#041d37] text-white px-6 py-2 rounded-full font-medium">Sign Up</a>
      </div>
    </header>
  )
}

const Footer = () => {
  return (
    <footer className="bg-[#262626] text-white py-8 px-6 md:px-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center mb-4">
            <div className="flex">
              <div className="bg-red-500 w-6 h-6 rounded-full"></div>
              <div className="bg-yellow-500 w-6 h-6 rounded-full -ml-2"></div>
              <div className="bg-blue-500 w-6 h-6 rounded-full -ml-2"></div>
            </div>
            <span className="font-bold ml-2">ICPWork</span>
          </div>
          <p className="text-sm mb-4">X Y Z Locality ,<br />California, USA, 292332</p>
          <div className="mb-4">
            <p className="font-medium mb-2">Follow us on social :</p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 border border-white rounded-md">L</a>
              <a href="#" className="p-2 border border-white rounded-md">I</a>
              <a href="#" className="p-2 border border-white rounded-md">T</a>
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-medium mb-4">Company</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">About Us</a></li>
            <li><a href="#" className="hover:underline">Terms</a></li>
            <li><a href="#" className="hover:underline">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-medium mb-4">Website</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Home</a></li>
            <li><a href="#" className="hover:underline">FAQ's</a></li>
            <li><a href="#" className="hover:underline">Get In Touch</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-medium mb-4">Others</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Profile</a></li>
            <li><a href="#" className="hover:underline">Sign In</a></li>
            <li><a href="#" className="hover:underline">Sign Up</a></li>
            <li><a href="#" className="hover:underline">Java Script</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-8 pt-4 border-t border-gray-700">
        <p className="text-sm text-gray-400">copyright @ icpwork</p>
      </div>
    </footer>
  )
}

export default function RequirementsPage() {
  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <RequirementForm />
        </div>
        <div className="lg:col-span-1">
          <OrderSummary />
        </div>
      </div>
      <Footer />
    </div>
  )
}
