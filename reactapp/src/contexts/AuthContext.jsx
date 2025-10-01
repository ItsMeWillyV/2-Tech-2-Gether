import { createContext, useState, useEffect } from 'react'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
      checkAuthStatus()
  }, [])


    const checkAuthStatus = async () => {
    try {
      
      const accessToken = localStorage.getItem('accessToken')

      // No token, user is not authenticated
      if (!accessToken) {
        setLoading(false)
        return
      }
      const response = await fetch('http://localhost:3000/api/auth/verify-token', {
        method: 'GET',
        credentials: 'include', 
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIsAuthenticated(true)
        setUser(data.user)
      } else {
        const refreshSuccess = await refreshToken()
        if (!refreshSuccess) {
          logout()
        }
      }
      
    } catch (error) {
      console.error('Auth check failed:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

    const refreshToken = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        credentials: 'include' 
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('accessToken', data.accessToken)
        setIsAuthenticated(true)
        setUser(data.user)
        return true
      } else{
        return false
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }
    return false
  }

  const login = (accessToken, userData) => {
    localStorage.setItem('accessToken', accessToken)
    setIsAuthenticated(true)
    setUser(userData)
  }

  const logout = async () => {
    try {
      // Notify backend to clear refresh token cookie
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
    localStorage.removeItem('accessToken')
    setIsAuthenticated(false)
    setUser(null)
  }

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    refreshToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
