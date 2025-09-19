'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export const AuthStatus: React.FC = () => {
  const { isAuthenticated, userEmail, userType, logout, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500">
        Checking authentication...
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="text-sm text-gray-500">
        Not logged in
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm">
        <span className="text-gray-600">Logged in as:</span>
        <span className="font-medium ml-1">{userEmail}</span>
        <span className="text-gray-500 ml-2">({userType})</span>
      </div>
      <Button 
        onClick={logout}
        variant="outline"
        size="sm"
        className="text-xs"
      >
        Logout
      </Button>
    </div>
  )
}

export default AuthStatus
