"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

type User = {
  id?: string
  email?: string
  userType?: 'freelancer' | 'client' | string
  sessionId?: string
  expiresAt?: number
  [key: string]: any
}

type AuthContextValue = {
  user: User | null
  setUser: (u: User | null) => void
  login: (tokenOrSession: any) => void
  logout: () => Promise<void>
  validateSession: () => Promise<void>
  isLoggedIn: () => boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('ICP_USER') : null
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Persist user to localStorage
    try {
      if (user) localStorage.setItem('ICP_USER', JSON.stringify(user))
      else localStorage.removeItem('ICP_USER')
    } catch (e) {
      // ignore
    }
  }, [user])

  // Initialize auth from localStorage first, then validate with server if needed
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      
      // First, try to get user from localStorage
      try {
        const storedUser = localStorage.getItem('ICP_USER')
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          setIsLoading(false)
          
          // Optionally validate with server in background (non-blocking)
          validateSession().catch(() => {
            // If server validation fails, keep using localStorage data
            console.warn('Server session validation failed, using localStorage data')
          })
          return
        }
      } catch (e) {
        console.warn('Failed to parse stored user data:', e)
      }
      
      // If no localStorage data, try server validation
      await validateSession()
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = (sessionData: any) => {
    // sessionData may include user object and sessionId
    const u = sessionData?.user || sessionData || null
    if (u && sessionData?.sessionId) {
      u.sessionId = sessionData.sessionId
    }
    setUser(u)
    try {
      if (u) localStorage.setItem('ICP_USER', JSON.stringify(u))
    } catch (e) {}
  }

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
    } catch (e) {
      // ignore
    }
    setUser(null)
    try { localStorage.removeItem('ICP_USER') } catch (e) {}
  }

  const validateSession = async () => {
    try {
      const res = await fetch('/api/validate-session', {
        credentials: 'include' // Include cookies in the request
      })
      if (!res.ok) {
        // Only clear user if we don't have localStorage data
        const hasStoredUser = localStorage.getItem('ICP_USER')
        if (!hasStoredUser) {
          setUser(null)
        }
        return
      }
      const json = await res.json()
      // expect { success: true, user }
      if (json?.success && json.user) {
        setUser(json.user)
        try { localStorage.setItem('ICP_USER', JSON.stringify(json.user)) } catch (e) {}
        return
      }
      // or raw user
      if (json?.user) {
        setUser(json.user)
        try { localStorage.setItem('ICP_USER', JSON.stringify(json.user)) } catch (e) {}
      }
    } catch (e) {
      // If server validation fails, don't clear localStorage data
      console.warn('Session validation failed:', e)
    }
  }

  const isLoggedIn = () => {
    return user !== null && user.email !== undefined
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, validateSession, isLoggedIn, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
