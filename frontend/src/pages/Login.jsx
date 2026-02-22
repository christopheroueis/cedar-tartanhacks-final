import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { motion } from 'framer-motion'
import { AlertCircle, Loader2 } from 'lucide-react'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  })
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [mfis, setMfis] = useState([])
  const [formData, setFormData] = useState({ mfi: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDemo, setShowDemo] = useState(false)

  useEffect(() => {
    const fetchMfis = async () => {
      try {
        const data = await authAPI.getMfis()
        setMfis(data)
        if (data.length > 0) setFormData(prev => ({ ...prev, mfi: data[0].id }))
      } catch {
        setMfis([
          { id: 'bangladesh-mfi', name: 'Grameen Climate Finance', country: 'Bangladesh' },
          { id: 'kenya-mfi', name: 'M-Pesa Green Loans', country: 'Kenya' },
          { id: 'peru-mfi', name: 'Banco Sol Verde', country: 'Peru' }
        ])
        setFormData(prev => ({ ...prev, mfi: 'bangladesh-mfi' }))
      }
    }
    fetchMfis()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(formData.mfi, formData.username, formData.password)
      if (result.success) {
        navigate('/app')
      } else {
        setError(result.error || 'Invalid credentials')
      }
    } catch {
      setError('Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: '#F7F5F0' }}>
      {/* Subtle topo background */}
      <div className="absolute inset-0 topo-bg" style={{ opacity: 0.5 }} />
      <div className="absolute inset-0 topo-lines" style={{ opacity: 0.2 }} />

      <motion.div
        className="relative z-10 w-full max-w-sm px-6"
        initial="hidden"
        animate="visible"
      >
        {/* Logo + Title */}
        <motion.div variants={fadeIn} custom={0} className="flex flex-col items-center mb-8">
          <img src="/cedarlogo.png" alt="Cedar" style={{ height: 52, marginBottom: '12px' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: '#1A1A18', marginBottom: '4px' }}>
            Sign in
          </h1>
          <p style={{ color: '#9B9B8A', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
            CLIMATE RISK INTELLIGENCE PLATFORM
          </p>
        </motion.div>

        {/* Card */}
        <motion.div variants={fadeIn} custom={1} className="card-cedar p-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

          {error && (
            <div className="mb-4 p-3 rounded-md flex items-center gap-2 text-sm"
              style={{ background: 'rgba(192, 57, 43, 0.07)', border: '1px solid rgba(192, 57, 43, 0.18)', color: '#C0392B' }}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Institution */}
            <div>
              <label className="label-instrument block mb-1.5">INSTITUTION</label>
              <select
                value={formData.mfi}
                onChange={(e) => setFormData(prev => ({ ...prev, mfi: e.target.value }))}
                className="input-cedar"
                required
              >
                {mfis.map(m => (
                  <option key={m.id} value={m.id}>{m.name} — {m.country}</option>
                ))}
              </select>
            </div>

            {/* Username */}
            <div>
              <label className="label-instrument block mb-1.5">USERNAME</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="officer1"
                className="input-cedar"
                required
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div>
              <label className="label-instrument block mb-1.5">PASSWORD</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
                className="input-cedar"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2"
              style={{ fontSize: '0.95rem' }}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
              ) : 'Sign in'}
            </button>
          </form>

          {/* Demo hint toggle */}
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid #F0EBE2' }}>
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              className="text-xs w-full text-center transition-colors"
              style={{ color: '#9B9B8A', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}
            >
              {showDemo ? 'Hide' : 'Show'} demo credentials
            </button>
            {showDemo && (
              <div className="mt-3 p-3 rounded-md" style={{ background: '#FAF8F5', border: '1px solid #E0D9CF' }}>
                <div className="text-xs" style={{ color: '#4A4A3F', fontFamily: 'var(--font-mono)' }}>
                  <div>username: <span style={{ color: '#0D7377' }}>officer1</span></div>
                  <div>password: <span style={{ color: '#0D7377' }}>demo123</span></div>
                  <div className="mt-1" style={{ color: '#9B9B8A', fontSize: '0.7rem' }}>MFI: Grameen Climate Finance</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
