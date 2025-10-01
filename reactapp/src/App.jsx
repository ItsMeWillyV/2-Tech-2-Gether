import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Sponsors from './pages/Sponsors'
import ComingSoon from './pages/ComingSoon'
import CaptureTheFlag from './pages/CaptureTheFlag'
import Events from './pages/Events'
import Auth from './pages/Auth'
import UserProfile from './pages/UserProfile'
function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/capture-the-flag" element={<CaptureTheFlag />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  )
}

export default App
