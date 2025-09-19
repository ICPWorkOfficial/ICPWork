'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredUserType?: 'freelancer' | 'client'
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredUserType,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, userType, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return // Wait for auth to load

    if (!isAuthenticated) {
      router.push(redirectTo)
      return
    }

    if (requiredUserType && userType !== requiredUserType) {
      // Redirect to appropriate dashboard based on user type
      const dashboardPath = userType === 'freelancer' ? '/dashboard' : '/client-dashboard'
      router.push(dashboardPath)
      return
    }
  }, [isAuthenticated, userType, isLoading, router, requiredUserType, redirectTo])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Don't render children if user type doesn't match requirement
  if (requiredUserType && userType !== requiredUserType) {
    return null
  }

  return <>{children}</>
}

export default ProtectedRoute
