import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { FaHome, FaCode, FaRocket, FaCog, FaExclamationTriangle } from 'react-icons/fa'
import '../App.css'

function NotFound() {
  // Ensure title updates when component mounts
  useEffect(() => {
    document.title = '404 - Page Not Found | Tech2Gether';
  }, []);

  return (
    <div className="not-found-container">
      <Helmet key="not-found-helmet">
        <title>404 - Page Not Found | Tech2Gether</title>
        <meta name="description" content="The page you are looking for does not exist. Return to Tech2Gether homepage." />
        <meta name="keywords" content="Tech2Gether, 404, Page Not Found, Error" />
        <meta property="og:title" content="404 - Page Not Found | Tech2Gether" />
        <meta property="og:description" content="The page you are looking for does not exist. Return to Tech2Gether homepage." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="not-found-background-elements">
        <div className="floating-code">{'<>'}</div>
        <div className="floating-code">{'</>'}</div>
        <div className="floating-code">{'{ }'}</div>
        <div className="floating-code">{'[ ]'}</div>
        <div className="floating-gear">
          <FaCog />
        </div>
        <div className="floating-gear gear-2">
          <FaCog />
        </div>
      </div>
      
      <div className="not-found-content">
        <div className="error-icon">
          <FaExclamationTriangle />
        </div>
        
        <h1 className="error-code">
          <span className="digit">4</span>
          <span className="digit">0</span>
          <span className="digit">4</span>
        </h1>
        
        <h2 className="error-message">
          <FaCode className="inline-icon" />
          Route Not Found
        </h2>
        
        <p className="error-description">
          The page you are looking for does not exist.
        </p>
        
        <div className="action-buttons">
          <Link to="/" className="home-button primary">
            <FaHome className="button-icon" />
            Back to Home
          </Link>
        </div>
        
        <div className="error-details">
          <p>If you believe this is an error, please contact our team.</p>
        </div>
      </div>
    </div>
  )
}

export default NotFound
