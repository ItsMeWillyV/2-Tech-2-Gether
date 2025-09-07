import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import tech2getherLogo from '../assets/logo.svg'

function Header() {
  const location = useLocation()
  const [hoveredItem, setHoveredItem] = useState(null)
  const { isAuthenticated, logout } = useAuth()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/sponsors', label: 'Sponsors' },
  ]

  return (
    <header className="bg-white shadow-lg border-b-4" style={{ backgroundColor: '#00447c', borderBottomColor: '#FFD700' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4 min-w-0">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <img 
                src={tech2getherLogo} 
                alt="Tech2Gether Logo" 
                className="h-12 sm:h-16 lg:h-20 w-auto max-w-none"
              />
            </Link>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center gap-4">
            <nav className="flex-shrink-0 min-w-0">
              <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path
                  const isHovered = hoveredItem === item.path
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="relative flex items-center justify-center px-2 py-2 sm:px-4 sm:py-2 lg:px-6 lg:py-3 font-bold transition-all duration-500 text-white overflow-hidden group text-xs sm:text-sm lg:text-base"
                      style={{
                        clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
                        background: (isActive || isHovered)
                          ? 'linear-gradient(135deg, #0E9ED5, #0B7FA8)' 
                          : 'linear-gradient(135deg, #FFC90D, #FFB000)',
                        color: (isActive || isHovered) ? 'white' : '#00447c',
                        minWidth: '60px',
                        boxShadow: (isActive || isHovered)
                          ? (isHovered && !isActive) 
                            ? '0 8px 20px rgba(14, 158, 213, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                            : isActive && isHovered
                            ? '0 6px 20px rgba(14, 158, 213, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                            : '0 4px 15px rgba(14, 158, 213, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                          : '0 3px 12px rgba(255, 201, 13, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                        transform: isHovered 
                          ? isActive 
                            ? 'scale(1.02) translateY(-1px)'
                            : 'scale(1.05) translateY(-2px)'
                          : 'scale(1)',
                        textShadow: (isActive || isHovered) 
                          ? isHovered 
                            ? '0 1px 3px rgba(0,0,0,0.4)'
                            : '0 1px 2px rgba(0,0,0,0.3)'
                          : '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={() => setHoveredItem(item.path)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span className="relative z-10 whitespace-nowrap">{item.label}</span>
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                        style={{
                          background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)',
                          transform: 'translateX(-100%)'
                        }}
                      ></div>
                    </Link>
                  )
                })}
              </div>
            </nav>

            {/* Authentication Buttons */}
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors duration-200 text-xs sm:text-sm"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/auth"
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-analog-aquamarine to-binary-blue hover:from-binary-blue hover:to-analog-aquamarine text-white rounded-md font-medium transition-all duration-200 text-xs sm:text-sm"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
