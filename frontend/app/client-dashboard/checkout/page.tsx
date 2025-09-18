"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

function PaymentSection({ projectName, setProjectName, paymentMethod, setPaymentMethod }: any) {
  return (
    <div className="bg-[#f6f6f6] rounded-lg p-6 border border-[#e0e0e0]">
      <div className="mb-6">
        <label className="block text-sm text-gray-600 mb-2">ENTER A PROJECT NAME</label>
        <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full px-4 py-3 rounded-md border border-gray-300" placeholder="Enter project name" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center">
          <input type="radio" id="card" name="paymentMethod" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="h-4 w-4 text-blue-500" />
          <label htmlFor="card" className="ml-2">Payment Card</label>
        </div>
        <div className="flex items-center">
          <input type="radio" id="paypal" name="paymentMethod" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="h-4 w-4 text-blue-500" />
          <label htmlFor="paypal" className="ml-2">PayPal</label>
        </div>
      </div>
    </div>
  )
}

function AdditionalServicesSection({ additionalServices, setAdditionalServices }: any) {
  const handleServiceChange = (service: any) => {
    setAdditionalServices({ ...additionalServices, [service]: !additionalServices[service] })
  }
  return (
    <div className="bg-[#fcfcfc] rounded-lg p-6 border border-[#e0e0e0]">
      <h2 className="text-lg font-semibold mb-4">Additional Services</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input type="checkbox" id="fastDelivery" checked={additionalServices.fastDelivery} onChange={() => handleServiceChange('fastDelivery')} className="h-4 w-4 text-blue-500" />
            <label htmlFor="fastDelivery" className="ml-2">FAST DELIVERY</label>
          </div>
          <span className="font-medium">$ 10</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input type="checkbox" id="additionalRevision" checked={additionalServices.additionalRevision} onChange={() => handleServiceChange('additionalRevision')} className="h-4 w-4 text-blue-500" />
            <label htmlFor="additionalRevision" className="ml-2">ADDITIONAL REVISION</label>
          </div>
          <span className="font-medium">$ 10</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input type="checkbox" id="extraChanges" checked={additionalServices.extraChanges} onChange={() => handleServiceChange('extraChanges')} className="h-4 w-4 text-blue-500" />
            <label htmlFor="extraChanges" className="ml-2">EXTRA CHANGES</label>
          </div>
          <span className="font-medium">$ 10</span>
        </div>
      </div>
    </div>
  )
}

function OrderSummarySection({ showPromoInput, setShowPromoInput, promoCode, setPromoCode, subtotal, taxes, total, onCheckout }: any) {
  return (
    <div className="bg-[#f4f4f4] rounded-lg p-6 border border-[#e0e0e0]">
      <div className="flex items-start mb-4">
        <div className="flex-shrink-0 mr-4">
          <div className="grid grid-cols-2 gap-1">
            <img src="https://mirrorful-production.s3.us-west-1.amazonaws.com/patterns/files/1057d5f1-e503-4345-a97a-8a5f10c19345/figma-preview.jpg" alt="Service Preview" className="w-12 h-12 object-cover rounded" />
            <img src="https://mirrorful-production.s3.us-west-1.amazonaws.com/patterns/files/1057d5f1-e503-4345-a97a-8a5f10c19345/figma-preview.jpg" alt="Service Preview" className="w-12 h-12 object-cover rounded" />
          </div>
        </div>
        <div>
          <h3 className="font-medium">Basic Tier</h3>
        </div>
      </div>
      <div className="space-y-4 mb-6">
        <div className="flex justify-between"><span>Basic Tier</span><span className="font-medium">$ 10</span></div>
        <div className="flex justify-between"><span>Delivery Time</span><span>3 days</span></div>
      </div>
      <div className="mb-6">{showPromoInput ? (<div className="flex"><input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="flex-grow px-3 py-2 border border-gray-300 rounded-l" placeholder="Enter promo code" /><button className="bg-[#29aae1] text-white px-4 py-2 rounded-r">Apply</button></div>) : (<button onClick={() => setShowPromoInput(true)} className="text-[#29aae1] hover:underline">Have a Promo code ?</button>)}</div>
      <div className="space-y-4 mb-6">
        <div className="flex justify-between"><span>Total</span><span className="font-medium">${subtotal.toFixed(0)}</span></div>
        <div className="flex justify-between"><span>Taxes</span><span>${taxes.toFixed(0)}</span></div>
        <div className="flex justify-between border-t border-gray-300 pt-3"><span className="font-medium">Final Payable Amount</span><span className="font-medium">${total.toFixed(0)}</span></div>
      </div>
      <button onClick={() => onCheckout && onCheckout()} className="w-full bg-[#28a745] text-white py-3 rounded-md hover:bg-green-600 transition">Check Out (${total.toFixed(0)})</button>
    </div>
  )
}

export default function CheckoutPage() {
  const [projectName, setProjectName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [additionalServices, setAdditionalServices] = useState({ fastDelivery: false, additionalRevision: false, extraChanges: false })
  const [promoCode, setPromoCode] = useState('')
  const [showPromoInput, setShowPromoInput] = useState(false)

  const basePrice = 10
  const taxRate = 0.2
  const additionalCosts = Object.values(additionalServices).filter(Boolean).length * 10
  const subtotal = basePrice + additionalCosts
  const taxes = subtotal * taxRate
  const total = subtotal + taxes

  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6"><button onClick={() => router.back()} className="flex items-center text-[#29aae1] hover:underline"><ChevronLeft size={16} /></button></div>
      <h1 className="text-2xl font-bold mb-6">Check Out Page</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <PaymentSection projectName={projectName} setProjectName={setProjectName} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
          <AdditionalServicesSection additionalServices={additionalServices} setAdditionalServices={setAdditionalServices} />
        </div>
        <div className="lg:w-2/5">
          <OrderSummarySection showPromoInput={showPromoInput} setShowPromoInput={setShowPromoInput} promoCode={promoCode} setPromoCode={setPromoCode} subtotal={subtotal} taxes={taxes} total={total} onCheckout={() => router.push('/client-dashboard/checkout/requirements')} />
        </div>
      </div>
    </div>
  )
}
