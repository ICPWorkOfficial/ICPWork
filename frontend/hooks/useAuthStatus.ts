import { useAuth } from './useAuth'

/**
 * Simple hook to check authentication status
 * Returns boolean values for quick authentication checks
 */
export const useAuthStatus = () => {
  const { isAuthenticated, isLoading, userType, isFreelancer, isClient } = useAuth()
  
  return {
    // Main authentication check
    isAuthenticated,
    
    // Loading state
    isLoading,
    
    // User type checks
    isFreelancer,
    isClient,
    userType,
    
    // Quick boolean checks
    isLoggedIn: isAuthenticated,
    isNotLoggedIn: !isAuthenticated && !isLoading,
    
    // Role-based checks
    canAccessFreelancerFeatures: isAuthenticated && isFreelancer,
    canAccessClientFeatures: isAuthenticated && isClient,
  }
}

export default useAuthStatus
