import { FaCog } from 'react-icons/fa'

/**
 * AnimatedBackground Component
 * 
 * A reusable animated background component that displays floating code snippets
 * and spinning gears with a gradient background. Used in pages like NotFound, ComingSoon, and Auth.
 * 
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes to apply to the container
 * @param {Array} props.codeElements - Custom array of code strings to display (optional)
 * @param {boolean} props.showGears - Whether to show the spinning gears (default: true)
 * @param {React.ReactNode} props.children - Child components to render inside the background
 */
function AnimatedBackground({ 
  className = '', 
  codeElements = ['<>', '</>', '{ }', '[ ]'], 
  showGears = true,
  children 
}) {
  return (
    <div 
      className={`min-h-screen relative overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, var(--binary-blue) 0%, #001a33 50%, var(--analog-aquamarine) 100%)'
      }}
    >
      {/* Floating Elements Layer */}
      <div className="not-found-background-elements">
        {/* Floating Code Elements */}
        {codeElements.map((code, index) => (
          <div key={`code-${index}`} className="floating-code">
            {code}
          </div>
        ))}
        
        {/* Spinning Gears */}
        {showGears && (
          <>
            <div className="floating-gear">
              <FaCog />
            </div>
            <div className="floating-gear gear-2">
              <FaCog />
            </div>
          </>
        )}
      </div>
      
      {/* Content Layer */}
      {children}
    </div>
  )
}

export default AnimatedBackground
