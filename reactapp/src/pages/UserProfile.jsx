import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../hooks/useAuth'
import { api } from '../utils/api'
import { FaUser, FaEnvelope, FaPhone, FaLinkedin, FaGithub, FaEdit, FaSave, FaTimes, FaUserShield, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import Card from '../components/Card'
import AnimatedBackground from '../components/AnimatedBackground'

function UserProfile() {
  const { user, isAuthenticated, login } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Initialize edit data when editing mode is enabled
  const handleEditClick = () => {
    setEditData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
      pronouns: user?.pronouns || '',
      user_linkedin: user?.user_linkedin || '',
      user_github: user?.user_github || '',
      preferred_name: user?.pre_name || ''
    })
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditData({})
    setSaveError('')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError('')
    
    try {
      const response = await api.user.updateProfile(editData)
      const data = await response.json()
      
      if (response.status === 200) {
        // Update the user context with new data
        const token = localStorage.getItem('accessToken')
        if (token) {
            login(token, data.user)
        }
        setIsEditing(false)
        setEditData({})
      } else {
        setSaveError(data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setSaveError('Network error. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <AnimatedBackground>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card
            icon={FaUserShield}
            iconColor="text-red-500"
            title="Access Denied"
            description="Please log in to view your profile."
            button={{
              text: "Sign In",
              href: "/auth",
              className: "btn-primary"
            }}
            className="max-w-md mx-auto"
          />
        </div>
      </AnimatedBackground>
    )
  }

  return (
    <>
      <Helmet>
        <title>My Profile - Tech2Gether</title>
        <meta name="description" content="Manage your Tech2Gether profile and account settings" />
      </Helmet>

      <AnimatedBackground>
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-2xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              My Profile
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Manage your account information and preferences
            </p>
          </div>

          {/* Profile Overview Card */}
          <div>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-t-binary-blue">
                {/* Card Header */}
                <div className="flex justify-center mb-6">
                  <FaUser className="text-5xl text-binary-blue" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-center text-binary-blue">
                {/* ## Use preferred name if available, fallback to first/last name */}
                {user?.preferred_name 
                    ? `${user.preferred_name} (${user.first_name} ${user.last_name})`
                    : `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User Profile'
                }
                </h3>
                
                {user?.pronouns && (
                  <div className="text-center mb-4">
                    <div className="bg-analog-aquamarine text-white px-3 py-1 rounded-full text-sm font-semibold inline-block mb-2">
                      {user.pronouns}
                    </div>
                  </div>
                )}
                
                <p className="text-gray-600 text-center leading-relaxed mb-6">
                  Your Tech2Gether member profile
                </p>

                {!isEditing && (
                  <div className="text-center mb-6">
                    <button
                      onClick={handleEditClick}
                      className="w-full px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 font-medium inline-flex items-center justify-center gap-2 bg-gray-500 text-white hover:bg-gray-600"
                    >
                      <FaEdit className="text-lg" />
                      Edit Profile
                    </button>
                  </div>
                )}

                <div className="mt-6 space-y-4">
                  
                  {/* Email Status */}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FaEnvelope className="text-binary-blue flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{user?.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {user?.email_is_verified ? (
                          <>
                            <FaCheckCircle className="text-green-500 text-sm" />
                            <span className="text-sm text-green-600">Verified</span>
                          </>
                        ) : (
                          <>
                            <FaExclamationTriangle className="text-yellow-500 text-sm" />
                            <span className="text-sm text-yellow-600">Unverified</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Editable Fields */}
                  <div className="space-y-4">
                    
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="first_name"
                            value={editData.first_name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-binary-blue"
                          />
                        ) : (
                          <p className="px-3 py-2 bg-white rounded-md border border-gray-200">
                            {user?.first_name || 'Not provided'}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="last_name"
                            value={editData.last_name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-binary-blue"
                          />
                        ) : (
                          <p className="px-3 py-2 bg-white rounded-md border border-gray-200">
                            {user?.last_name || 'Not provided'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Name
                    </label>
                    {isEditing ? (
                        <input
                        type="text"
                        name="preferred_name"
                        value={editData.preferred_name}
                        onChange={handleInputChange}
                        placeholder="What would you like to be called?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-binary-blue"
                        />
                    ) : (
                        <p className="px-3 py-2 bg-white rounded-md border border-gray-200">
                        {user?.pre_name || 'Not provided'}
                        </p>
                    )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={editData.phone}
                          onChange={handleInputChange}
                          placeholder="(555) 123-4567"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-binary-blue"
                        />
                      ) : (
                        <p className="px-3 py-2 bg-white rounded-md border border-gray-200">
                          {user?.phone || 'Not provided'}
                        </p>
                      )}
                    </div>

                    {/* Pronouns */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pronouns
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="pronouns"
                          value={editData.pronouns}
                          onChange={handleInputChange}
                          placeholder="they/them, she/her, he/him, etc."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-binary-blue"
                        />
                      ) : (
                        <p className="px-3 py-2 bg-white rounded-md border border-gray-200">
                          {user?.pronouns || 'Not provided'}
                        </p>
                      )}
                    </div>

                    {/* Social Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          LinkedIn Profile
                        </label>
                        {isEditing ? (
                          <input
                            type="url"
                            name="user_linkedin"
                            value={editData.user_linkedin}
                            onChange={handleInputChange}
                            placeholder="https://linkedin.com/in/username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-binary-blue"
                          />
                        ) : (
                          <div className="px-3 py-2 bg-white rounded-md border border-gray-200">
                            {user?.user_linkedin ? (
                              <a
                                href={user.user_linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-binary-blue hover:text-analog-aquamarine flex items-center space-x-2"
                              >
                                <FaLinkedin />
                                <span>View Profile</span>
                              </a>
                            ) : (
                              'Not provided'
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GitHub Profile
                        </label>
                        {isEditing ? (
                          <input
                            type="url"
                            name="user_github"
                            value={editData.user_github}
                            onChange={handleInputChange}
                            placeholder="https://github.com/username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-binary-blue"
                          />
                        ) : (
                          <div className="px-3 py-2 bg-white rounded-md border border-gray-200">
                            {user?.user_github ? (
                              <a
                                href={user.user_github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-binary-blue hover:text-analog-aquamarine flex items-center space-x-2"
                              >
                                <FaGithub />
                                <span>View Profile</span>
                              </a>
                            ) : (
                              'Not provided'
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Edit Actions */}
                    {isEditing && (
                      <div className="pt-4 border-t border-gray-200">
                        {saveError && (
                          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                            {saveError}
                          </div>
                        )}
                        <div className="flex space-x-4">
                          <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center space-x-2 px-4 py-2 bg-binary-blue text-white rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FaSave />
                            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FaTimes />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedBackground>
    </>
  )
}

export default UserProfile