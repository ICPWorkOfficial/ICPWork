"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

type User = {
  id?: string
  email?: string
  userType?: 'freelancer' | 'client' | string
  [key: string]: any
}

type AuthContextValue = {
  user: User | null
  setUser: (u: User | null) => void
  login: (tokenOrSession: any) => void
  logout: () => Promise<void>
  validateSession: () => Promise<void>
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
      const raw = typeof window !== 'undefined' ? sessionStorage.getItem('ICP_USER') : null
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })

  useEffect(() => {
    // Persist user to sessionStorage
    try {
      if (user) sessionStorage.setItem('ICP_USER', JSON.stringify(user))
      else sessionStorage.removeItem('ICP_USER')
    } catch (e) {
      // ignore
    }
  }, [user])

  const login = (sessionData: any) => {
    // sessionData may include user object
    const u = sessionData?.user || sessionData || null
    setUser(u)
    try {
      if (u) sessionStorage.setItem('ICP_USER', JSON.stringify(u))
    } catch (e) {}
  }

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
    } catch (e) {
      // ignore
    }
    setUser(null)
    try { sessionStorage.removeItem('ICP_USER') } catch (e) {}
  }

  const validateSession = async () => {
    try {
      const res = await fetch('/api/validate-session')
      if (!res.ok) {
        setUser(null)
        return
      }
      const json = await res.json()
      // expect { ok: true, user }
      if (json?.ok && json.user) {
        setUser(json.user)
        return
      }
      // or raw user
      if (json?.user) setUser(json.user)
    } catch (e) {
      // ignore
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, validateSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
