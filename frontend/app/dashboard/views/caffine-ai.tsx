"use client"

import React, { useState } from 'react'
import { Send, MessageSquare, X } from 'lucide-react'

const CaffineAI: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ id: string; from: 'user' | 'ai'; text: string }>>([
    { id: 'm1', from: 'ai', text: 'Hi — Caffine AI is coming soon. Ask me anything when available!' },
  ])
  const [input, setInput] = useState('')
  const [showModal, setShowModal] = useState(true)

  const send = () => {
    if (!input.trim()) return
    setMessages((m) => [...m, { id: Date.now().toString(), from: 'user', text: input }])
    setInput('')
    // For now simulate an AI reply
    setTimeout(() => {
      setMessages((m) => [...m, { id: Date.now().toString(), from: 'ai', text: "Caffine AI will be available soon — this is a preview reply." }])
    }, 700)
  }

  return (
    <div className="relative min-h-[600px] flex items-center justify-center">
      {/* Centered landing like ChatGPT */}
      <div className="w-full max-w-3xl px-6 py-12 text-center">
        <div className="mb-8">
          <img src="/caffine.png" alt="Caffine AI" className="mx-auto" />
          <h1 className="mt-4 text-3xl font-semibold">Caffine AI</h1>
        </div>

        <div className="mx-auto max-w-2xl">
          <input
            className="w-full rounded-xl border border-gray-200 px-6 py-4 text-lg"
            placeholder="Ask Caffine AI anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
      </div>

      {/* Large Coming Soon modal covering half the screen */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="w-1/2 bg-white rounded-2xl shadow-2xl p-12 flex flex-col items-center justify-center relative">
            <button onClick={() => setShowModal(false)} aria-label="Close" className="absolute right-4 top-4 p-2 rounded-md hover:bg-gray-100">
              <X size={18} />
            </button>
            <div className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600">COMING SOON</div>
            <div className="mt-4 text-center text-gray-600">Caffine AI will be available shortly. Stay tuned!</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CaffineAI
