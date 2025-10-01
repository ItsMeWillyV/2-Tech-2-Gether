import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Helmet } from 'react-helmet-async'
import AnimatedBackground from '../components/AnimatedBackground'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    preferred_name: '',
    phone: '',
    pronouns: '',
    user_linkedin: '',
    user_github: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  // Update document title when auth mode changes
  useEffect(() => {
    document.title = `${isLogin ? 'Sign In' : 'Sign Up'} - Tech2Gether`;
  }, [isLogin])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation - match backend requirements
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long'
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }

    // Registration-specific validation
    if (!isLogin) {
      // Required fields
      if (!formData.first_name?.trim()) {
        newErrors.first_name = 'First name is required'
      } else if (!/^[a-zA-Z\s'-]+$/.test(formData.first_name)) {
        newErrors.first_name = 'First name must contain only letters, spaces, hyphens, and apostrophes'
      }

      if (!formData.last_name?.trim()) {
        newErrors.last_name = 'Last name is required'
      } else if (!/^[a-zA-Z\s'-]+$/.test(formData.last_name)) {
        newErrors.last_name = 'Last name must contain only letters, spaces, hyphens, and apostrophes'
      }
      if (formData.preferred_name && !/^[a-zA-Z\s'-]*$/.test(formData.preferred_name)) {
      newErrors.preferred_name = 'Preferred name must contain only letters, spaces, hyphens, and apostrophes'
      }

      // Optional emergency contact validation
      if (formData.emergency_contact_first_name && !/^[a-zA-Z\s'-]+$/.test(formData.emergency_contact_first_name)) {
        newErrors.emergency_contact_first_name = 'Emergency contact first name must contain only letters, spaces, hyphens, and apostrophes'
      }

      if (formData.emergency_contact_last_name && !/^[a-zA-Z\s'-]+$/.test(formData.emergency_contact_last_name)) {
        newErrors.emergency_contact_last_name = 'Emergency contact last name must contain only letters, spaces, hyphens, and apostrophes'
      }

      if (formData.emergency_contact_phone && !/^\+?[\d\s\-()]+$/.test(formData.emergency_contact_phone)) {
        newErrors.emergency_contact_phone = 'Emergency contact phone number format is invalid'
      }

      // Optional field validation
      // if (formData.preferred_name && !/^[a-zA-Z\s'-]*$/.test(formData.preferred_name)) {
      //   newErrors.preferred_name = 'Preferred name must contain only letters, spaces, hyphens, and apostrophes'
      // }

      if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
        newErrors.phone = 'Phone number format is invalid'
      }

      if (formData.pronouns && formData.pronouns.length > 20) {
        newErrors.pronouns = 'Pronouns must be less than 20 characters'
      }

      // LinkedIn validation
      if (formData.user_linkedin && formData.user_linkedin.trim()) {
        if (!/^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/.test(formData.user_linkedin)) {
          newErrors.user_linkedin = 'Please provide a valid LinkedIn profile URL'
        }
      }

      // GitHub validation
      if (formData.user_github && formData.user_github.trim()) {
        if (!/^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/.test(formData.user_github)) {
          newErrors.user_github = 'Please provide a valid GitHub profile URL'
        }
      }

      // Password confirmation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : {
            email: formData.email,
            password: formData.password,
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone || undefined,
            pronouns: formData.pronouns || undefined,
            user_linkedin: formData.user_linkedin || undefined,
            user_github: formData.user_github || undefined,
            preferred_name: formData.preferred_name || undefined
          }

      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        // Use the login function from context
        if (isLogin && data.accessToken) {
          login(data.accessToken, data.user)
        } else if (!isLogin) {
          // For registration, show success message and switch to login
          setIsLogin(true)
          setFormData({
            email: formData.email,
            password: '',
            confirmPassword: '',
            first_name: '',
            last_name: '',
            phone: '',
            pronouns: '',
            user_linkedin: '',
            user_github: ''
          })
          setErrors({ general: data.message || 'Registration successful! Please login.' })
          return
        }
        
        // Redirect to home or dashboard
        navigate('/')
      } else {
        // Map backend validation / field errors to local form errors
        const fieldErrors = {}

        // express-validator style: errors: [{ field, message, value }]
        if (Array.isArray(data.errors)) {
          data.errors.forEach(err => {
            if (err && (err.field || err.path)) {
              const key = err.field || err.path
              if (!fieldErrors[key]) fieldErrors[key] = err.message || err.msg || 'Invalid value'
            } else if (typeof err === 'string') {
              // Generic string errors (e.g., password strength list) -> attach to password
              if (!fieldErrors.password) fieldErrors.password = err
            }
          })
        } else if (data.errors && typeof data.errors === 'object') {
          // Possible object of field -> message(s)
            Object.entries(data.errors).forEach(([k,v]) => {
              if (!fieldErrors[k]) fieldErrors[k] = Array.isArray(v) ? v[0] : (v.message || v.msg || v)
            })
        }

        // Heuristic for duplicate email
        if (data.message?.toLowerCase().includes('already exists') && !fieldErrors.email) {
          fieldErrors.email = data.message
        }

        // Password strength errors provided separately
        if (data.message?.toLowerCase().includes('password') && !fieldErrors.password && Array.isArray(data.errors) && data.errors.length === 0) {
          fieldErrors.password = data.message
        }

        setErrors({
          ...fieldErrors,
          general: Object.keys(fieldErrors).length ? undefined : (data.message || 'An error occurred')
        })
      }
    } catch (error) {
      console.error('Auth error:', error)
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: '',
      phone: '',
      pronouns: '',
      user_linkedin: '',
      user_github: '',
      preferred_name: ''
    })
    setErrors({})
  }

  // Dynamic meta content based on auth mode
  const pageTitle = `${isLogin ? 'Sign In' : 'Sign Up'} - Tech2Gether`
  const pageDescription = isLogin 
    ? "Sign in to your Tech2Gether account to access events, workshops, and connect with the tech community." 
    : "Create your Tech2Gether account to join events, workshops, and connect with fellow tech enthusiasts."

  return (
    <AnimatedBackground className="text-white py-32 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <Helmet key="auth-helmet">
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="Tech2Gether, login, sign in, sign up, register, authentication, tech events, Ozarks Tech" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="max-w-xl md:max-w-2xl lg:max-w-3xl w-full space-y-8 relative z-10 transition-max-width duration-300">
        <div className="bg-black/30 backdrop-blur-sm rounded-[20px] shadow-2xl p-8 lg:p-10 xl:p-12 border-2 border-analog-aquamarine" style={{
          backdropFilter: 'blur(10px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-binary-blue to-analog-aquamarine bg-clip-text text-transparent font-heading" style={{
                WebkitTextStrokeWidth: '1px',
                WebkitTextStrokeColor: 'var(--analog-aquamarine)',
                textShadow: '-2px 0 2px magenta'
              }}>
                {isLogin ? 'Welcome Back!' : 'Join Us'}
              </h1>
            </div>
            <p className="text-white/90 text-lg font-medium">
              {isLogin 
                ? 'Sign in to access your account' 
                : 'Create your account and join the tech community'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* General Error */}
            {errors.general && (
              <div className={`border-l-4 px-4 py-3 rounded-r-lg ${
                errors.general.includes('successful') 
                  ? 'bg-green-50 border-green-400 text-green-700'
                  : 'bg-red-50 border-red-400 text-red-700'
              }`}>
                <div className="flex">
                  <div className="text-sm font-medium">
                    {errors.general}
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-analog-aquamarine focus:border-transparent transition-all duration-200 text-gray-900 bg-white/95 ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-analog-aquamarine/50'
                }`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>
              )}
              {!isLogin && (
                <p className="mt-2 text-xs text-white/70 bg-white/5 border border-analog-aquamarine/30 rounded-lg px-3 py-2 leading-relaxed">
                  💡 If you are a student, please use your school-issued email address.
                </p>
              )}
            </div>

            {/* Registration fields */}
            {!isLogin && (
              <div className="space-y-5">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-semibold text-white mb-2">
                      First Name *
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-analog-aquamarine focus:border-transparent transition-all duration-200 text-gray-900 bg-white/95 ${
                        errors.first_name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-analog-aquamarine/50'
                      }`}
                      placeholder="John"
                    />
                    {errors.first_name && (
                      <p className="text-red-500 text-xs mt-1 font-medium">{errors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="last_name" className="block text-sm font-semibold text-white mb-2">
                      Last Name *
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-analog-aquamarine focus:border-transparent transition-all duration-200 text-gray-900 bg-white/95 ${
                        errors.last_name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-analog-aquamarine/50'
                      }`}
                      placeholder="Doe"
                    />
                    {errors.last_name && (
                      <p className="text-red-500 text-xs mt-1 font-medium">{errors.last_name}</p>
                    )}
                  </div>
                </div>
                    {/* ## Add Preferred Name field */}
                <div>
                  <label htmlFor="preferred_name" className="block text-sm font-medium text-white mb-2">
                    Preferred Name
                  </label>
                  <input
                    id="preferred_name"
                    name="preferred_name"
                    type="text"
                    value={formData.preferred_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-analog-aquamarine focus:border-transparent transition-all duration-200 text-gray-900 bg-white/95 ${
                      errors.preferred_name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-analog-aquamarine/50'
                    }`}
                    placeholder="What would you like to be called?"
                  />
                  {errors.preferred_name && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.preferred_name}</p>
                  )}
                </div>
                  <div className="col-span-2">
                    <p className="mt-2 text-xs text-white/70 bg-white/5 border border-analog-aquamarine/30 rounded-lg px-3 py-2 leading-relaxed">
                      💡 If you are a student, please ensure your first and last name match your school email. If your first name differs, you may set a preferred name below.
                    </p>
                  </div>

                {/* Registration Additional Fields (reordered for intuitiveness) */}
                <div className="space-y-5">
                  {/* Pronouns */}
                  <div>
                    <label htmlFor="pronouns" className="block text-sm font-medium text-white mb-2">
                      Pronouns
                    </label>
                    <input
                      id="pronouns"
                      name="pronouns"
                      type="text"
                      value={formData.pronouns}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-analog-aquamarine focus:border-transparent transition-all duration-200 text-gray-900 bg-white/95 ${
                        errors.pronouns ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-analog-aquamarine/50'
                      }`}
                      placeholder="they/them"
                    />
                    {errors.pronouns && (
                      <p className="text-red-500 text-xs mt-1 font-medium">{errors.pronouns}</p>
                    )}
                  </div>
                    
                  {/* Phone field */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                      Phone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-analog-aquamarine focus:border-transparent transition-all duration-200 text-gray-900 bg-white/95 ${
                        errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-analog-aquamarine/50'
                      }`}
                      placeholder="(555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>
                    )}
                  </div>

                  {/* LinkedIn and GitHub */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="user_linkedin" className="block text-sm font-medium text-white mb-2">
                        LinkedIn Profile
                      </label>
                      <input
                        id="user_linkedin"
                        name="user_linkedin"
                        type="url"
                        value={formData.user_linkedin}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-analog-aquamarine focus:border-transparent transition-all duration-200 text-gray-900 bg-white/95 ${
                          errors.user_linkedin ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-analog-aquamarine/50'
                        }`}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                      {errors.user_linkedin && (
                        <p className="text-red-500 text-xs mt-1 font-medium">{errors.user_linkedin}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="user_github" className="block text-sm font-medium text-white mb-2">
                        GitHub Profile
                      </label>
                      <input
                        id="user_github"
                        name="user_github"
                        type="url"
                        value={formData.user_github}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-analog-aquamarine focus:border-transparent transition-all duration-200 text-gray-900 bg-white/95 ${
                          errors.user_github ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-analog-aquamarine/50'
                        }`}
                        placeholder="https://github.com/yourusername"
                      />
                      {errors.user_github && (
                        <p className="text-red-500 text-xs mt-1 font-medium">{errors.user_github}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-analog-aquamarine focus:border-transparent transition-all duration-200 text-gray-900 bg-white/95 ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-analog-aquamarine/50'
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>
              )}
              {!isLogin && (
                <p className="mt-2 text-xs text-white/70 bg-white/5 border border-analog-aquamarine/30 rounded-lg px-3 py-2 leading-relaxed">
                  💡 Must contain: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special symbol.
                </p>
              )}
            </div>

            {/* Confirm Password (Registration only) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white mb-2">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-analog-aquamarine focus:border-transparent transition-all duration-200 text-gray-900 bg-white/95 ${
                    errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-analog-aquamarine/50'
                  }`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border-0"
              style={{
                background: isLoading 
                  ? 'linear-gradient(135deg, #06b6d4, #2563eb)' 
                  : 'linear-gradient(135deg, #06b6d4, #2563eb)'
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {/* Toggle between login and registration */}
          <div className="mt-8 text-center">
            <p className="text-white/90">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={toggleAuthMode}
                className="text-analog-aquamarine hover:text-yaml-yellow font-semibold transition-colors duration-200 underline decoration-2 underline-offset-2 hover:decoration-yaml-yellow cursor-pointer"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Forgot Password (Login only) */}
          {isLogin && (
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-white/70 hover:text-analog-aquamarine transition-colors duration-200 underline decoration-1 underline-offset-2 cursor-pointer"
              >
                Forgot your password?
              </button>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-white hover:text-white transition-all duration-200 font-semibold flex items-center justify-center mx-auto bg-black/40 backdrop-blur-md px-6 py-3 rounded-full hover:bg-black/60 border border-white/30 shadow-lg hover:shadow-xl cursor-pointer"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>
    </AnimatedBackground>
  )
}

export default Auth
