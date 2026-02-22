import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout from './components/AppLayout'
import Welcome from './pages/Welcome'
import About from './pages/About'
import Privacy from './pages/Privacy'
import Login from './pages/Login'
import SmartAssessment from './pages/SmartAssessment'
import NewAssessment from './pages/NewAssessment'
import RiskResults from './pages/RiskResults'
import Dashboard from './pages/Dashboard'
import History from './pages/History'

const transition = { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition },
  exit: { opacity: 0, y: -8, transition: { ...transition, duration: 0.2 } }
}

function PageTransition({ children, routeKey }) {
  return (
    <motion.div
      key={routeKey}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ minHeight: '100vh' }}
    >
      {children}
    </motion.div>
  )
}

/* Thin progress bar at top during route changes */
function NavProgressBar() {
  const location = useLocation()
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    const timer = setTimeout(() => setShow(false), 350)
    return () => clearTimeout(timer)
  }, [location.pathname])

  if (!show) return null
  return <div className="nav-progress-bar" />
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F5F0' }}>
        <div className="skeleton-cedar w-12 h-12 rounded-full" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AnimatedSwitch() {
  const location = useLocation()
  const { user } = useAuth()
  const pathname = location.pathname

  let routeKey = 'welcome'
  let content = null

  if (pathname === '/') {
    routeKey = 'welcome'
    content = <Welcome />
  } else if (pathname === '/about') {
    routeKey = 'about'
    content = <About />
  } else if (pathname === '/privacy') {
    routeKey = 'privacy'
    content = <Privacy />
  } else if (pathname === '/login') {
    routeKey = 'login'
    content = user ? <Navigate to="/app" replace /> : <Login />
  } else if (pathname.startsWith('/app')) {
    routeKey = 'app'
    content = (
      <ProtectedRoute>
        <Routes location={location}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<SmartAssessment />} />
            <Route path="classic" element={<NewAssessment />} />
            <Route path="results/:assessmentId" element={<RiskResults />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="history" element={<History />} />
          </Route>
        </Routes>
      </ProtectedRoute>
    )
  } else {
    return <Navigate to="/" replace />
  }

  return (
    <AnimatePresence mode="wait">
      <PageTransition routeKey={routeKey}>
        {content}
      </PageTransition>
    </AnimatePresence>
  )
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen" style={{ background: '#F7F5F0' }}>
        <NavProgressBar />
        <Routes>
          <Route path="*" element={<AnimatedSwitch />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
