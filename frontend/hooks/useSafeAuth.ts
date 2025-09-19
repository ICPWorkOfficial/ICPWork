import { useAuth } from './useAuth'
import { useEffect, useState } from 'react'

/**
 * Safe authentication hook that prevents React errors
 * by providing fallback values and error handling
 */
export const useSafeAuth = () => {
  const [isReady, setIsReady] = useState(false)
  const auth = useAuth()
  
  useEffect(() => {
    // Mark as ready after initial render to prevent hydration issues
    setIsReady(true)
  }, [])
  
  // Provide safe fallback values during SSR and initial render
  if (!isReady) {
    return {
      isAuthenticated: false,
      isLoading: true,
      user: null,
      userEmail: null,
      userType: null,
      isFreelancer: false,
      isClient: false,
      logout: () => {},
      login: () => {},
      validateSession: () => Promise.resolve(),
      isLoggedIn: () => false,
    }
  }
  
  // Return the actual auth values once ready
  return {
    ...auth,
    isAuthenticated: auth.isAuthenticated || false,
    isLoading: auth.isLoading || false,
    user: auth.user || null,
    userEmail: auth.userEmail || null,
    userType: auth.userType || null,
    isFreelancer: auth.isFreelancer || false,
    isClient: auth.isClient || false,
    logout: auth.logout || (() => {}),
    login: auth.login || (() => {}),
    validateSession: auth.validateSession || (() => Promise.resolve()),
    isLoggedIn: auth.isLoggedIn || (() => false),
  }
}

export default useSafeAuth
