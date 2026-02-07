import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import NewAssessment from './pages/NewAssessment'
import RiskResults from './pages/RiskResults'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import ComponentShowcase from './pages/ComponentShowcase'

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/showcase" element={<ComponentShowcase />} />
      <Route path="/" element={
        <ProtectedRoute>
          <NewAssessment />
        </ProtectedRoute>
      } />
      <Route path="/results/:assessmentId" element={
        <ProtectedRoute>
          <RiskResults />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/history" element={
        <ProtectedRoute>
          <History />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <AppRoutes />
      </div>
    </AuthProvider>
  )
}

export default App
