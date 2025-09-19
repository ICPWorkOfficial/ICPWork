'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export const AuthExample: React.FC = () => {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    userEmail, 
    userType, 
    isFreelancer, 
    isClient, 
    logout 
  } = useAuth()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          <span>Checking authentication...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h3 className="text-lg font-semibold">Authentication Status</h3>
      
      {/* Authentication Status */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            isAuthenticated 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </span>
        </div>

        {isAuthenticated && (
          <>
            <div className="flex items-center gap-2">
              <span className="font-medium">Email:</span>
              <span>{userEmail}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium">User Type:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                isFreelancer 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {userType}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Role Check:</span>
              <span className="text-sm">
                {isFreelancer && '✅ Freelancer'}
                {isClient && '✅ Client'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {isAuthenticated ? (
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        ) : (
          <div className="text-sm text-gray-600">
            Please log in to access protected features
          </div>
        )}
      </div>

      {/* Debug Info */}
      <details className="text-xs text-gray-500">
        <summary className="cursor-pointer">Debug Info</summary>
        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
          {JSON.stringify({
            isAuthenticated,
            isLoading,
            userEmail,
            userType,
            isFreelancer,
            isClient,
            hasUser: !!user
          }, null, 2)}
        </pre>
      </details>
    </div>
  )
}

export default AuthExample
