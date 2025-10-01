class ApiClient {
  constructor() {
    this.baseURL = 'http://localhost:3000'
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const accessToken = localStorage.getItem('accessToken')
    
    const config = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    // Add auth header if token exists
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    let response = await fetch(url, config)

    // If token expired, try to refresh
    if (response.status === 401 && accessToken) {
      const refreshed = await this.refreshToken()
      if (refreshed) {
        // Retry with new token
        config.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`
        response = await fetch(url, config)
      }
    }

    return response
  }

  async refreshToken() {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('accessToken', data.accessToken)
        return true
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }
    return false
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    })
  }
}

export const api = {
  user: {
    updateProfile: (data) => apiClient.put('/api/auth/profile', data)
  }
}

export const apiClient = new ApiClient()
