import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FaHome, FaCode, FaRocket, FaCog, FaClock } from 'react-icons/fa'
import { useState, useEffect, useMemo } from 'react'
import AnimatedBackground from '../components/AnimatedBackground'
import '../App.css'

function ComingSoon() {
  // Array of random messages (memoized to prevent re-creation on every render)
  const randomMessages = useMemo(() => [
    "*quack*",
    "beep boop",
    "Why do they call it oven when you of in the cold food of out hot eat the food?",
    "bogos binted?",
    "A wise old man once told me that someone would waste their time reading this text.",
    "Soon™",
    "Wouldn't you like to know, weatherboy?",
    "Hello, World!",
    "That's actually some pretty solid evidence.",
    "01011001 01101111 01110101 00100000 01101100 01101111 01110011 01110100 00100000 01110100 01101000 01100101 00100000 01100111 01100001 01101101 01100101"
  ], []);

  const [currentMessage, setCurrentMessage] = useState('');

  // Ensure title updates when component mounts
  useEffect(() => {
    document.title = 'Coming Soon - Tech2Gether';
  }, []);

  // Set random message on component mount and update every 5 seconds
  useEffect(() => {
    const updateMessage = () => {
      const randomIndex = Math.floor(Math.random() * randomMessages.length);
      setCurrentMessage(randomMessages[randomIndex]);
    };

    updateMessage(); // Set initial message
    
    const interval = setInterval(updateMessage, 5000); // Change message every 5 seconds

    return () => clearInterval(interval);
  }, [randomMessages]);

  return (
    <AnimatedBackground className="flex items-center justify-center p-8">
      <Helmet key="coming-soon-helmet">
        <title>Coming Soon - Tech2Gether</title>
        <meta name="description" content="This page is coming soon. Check back later for updates!" />
        <meta name="keywords" content="Tech2Gether, Coming Soon, Events, Ozarks Tech" />
        <meta property="og:title" content="Coming Soon - Tech2Gether" />
        <meta property="og:description" content="This page is coming soon. Check back later for updates!" />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="not-found-content">
        <div className="error-icon">
          <FaClock />
        </div>
        
        <h1 className="error-code">
          <span className="digit">S</span>
          <span className="digit">O</span>
          <span className="digit">O</span>
          <span className="digit">N</span>
        </h1>
        
        <h2 className="error-message">
          <FaCode className="inline-icon" />
          Coming Soon
        </h2>
        
        <p className="error-description">
          We're working hard to bring you something amazing. Stay tuned!
        </p>
        
        <div className="action-buttons">
          <Link to="/" className="home-button primary">
            <FaHome className="button-icon" />
            Back to Home
          </Link>
        </div>
        
        <div className="error-details">
          <p>{currentMessage}</p>
        </div>
      </div>
    </AnimatedBackground>
  )
}

export default ComingSoon
