import { useAuth as useAuthContext } from '@/context/AuthContext'

export const useAuth = () => {
  const auth = useAuthContext()
  
  return {
    ...auth,
    // Helper functions
    isAuthenticated: auth.isLoggedIn(),
    isFreelancer: auth.user?.userType === 'freelancer',
    isClient: auth.user?.userType === 'client',
    userEmail: auth.user?.email,
    userType: auth.user?.userType,
  }
}

export default useAuth
