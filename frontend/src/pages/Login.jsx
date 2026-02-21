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
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  })
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [mfis, setMfis] = useState([])
  const [formData, setFormData] = useState({ mfi: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    <div className="min-h-screen flex" style={{ background: '#F7F5F0' }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 topo-bg relative overflow-hidden">
        <div className="absolute inset-0 topo-lines opacity-40" aria-hidden />

        {/* Subtle risk heatmap blobs */}
        <div className="absolute top-[20%] left-[15%] w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(13,115,119,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[20%] right-[10%] w-[250px] h-[250px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(230,126,34,0.06) 0%, transparent 70%)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-7 h-7 rounded bg-[#0D7377] flex items-center justify-center">
              <span className="text-white text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>C</span>
            </div>
            <span className="text-sm font-semibold tracking-wide" style={{ fontFamily: 'var(--font-display)', color: '#1A1A18' }}>
              CEDAR
            </span>
          </div>

          <h2 className="text-3xl leading-[1.15] tracking-tight mb-5" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A1A18' }}>
            Climate-informed<br />lending intelligence.
          </h2>
          <p className="text-sm leading-relaxed max-w-sm" style={{ color: '#6B6B5A' }}>
            7-dimension risk scoring powered by real-time climate data, economic indicators, and machine learning default prediction.
          </p>
        </div>

        <div className="relative z-10 flex gap-8">
          {[
            { val: '92%', label: 'ML ACCURACY' },
            { val: '7', label: 'RISK DIMS' },
            { val: '< 3s', label: 'ASSESSMENT' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#1A1A18' }}>{s.val}</div>
              <div className="label-instrument mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <motion.div className="w-full max-w-md" initial="hidden" animate="visible">
          <motion.div variants={fadeIn} custom={0} className="mb-8">
            <div className="label-instrument mb-2">SECURE ACCESS</div>
            <h1 className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A1A18' }}>
              Sign in to Cedar
            </h1>
            <p className="text-sm mt-2" style={{ color: '#6B6B5A' }}>
              Access your institution's climate risk assessment platform.
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-md flex items-center gap-2 text-sm"
              style={{ background: 'rgba(192, 57, 43, 0.08)', border: '1px solid rgba(192, 57, 43, 0.2)', color: '#C0392B' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            {/* MFI Select */}
            <motion.div variants={fadeIn} custom={1} className="mb-4">
              <label className="label-instrument block mb-2">INSTITUTION</label>
              <select
                value={formData.mfi}
                onChange={(e) => setFormData(prev => ({ ...prev, mfi: e.target.value }))}
                className="input-cedar"
                required
              >
                {mfis.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.country}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Username */}
            <motion.div variants={fadeIn} custom={2} className="mb-4">
              <label className="label-instrument block mb-2">USERNAME</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="officer1"
                className="input-cedar"
                required
                autoComplete="username"
              />
            </motion.div>

            {/* Password */}
            <motion.div variants={fadeIn} custom={3} className="mb-6">
              <label className="label-instrument block mb-2">PASSWORD</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="demo123"
                className="input-cedar"
                required
                autoComplete="current-password"
              />
            </motion.div>

            {/* Submit */}
            <motion.div variants={fadeIn} custom={4}>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating…</>
                ) : (
                  'Sign in'
                )}
              </button>
            </motion.div>
          </form>

          {/* Demo hint */}
          <motion.div variants={fadeIn} custom={5} className="mt-8 p-4 rounded-md" style={{ background: '#FAF8F5', border: '1px solid #E0D9CF' }}>
            <div className="label-instrument mb-2">DEMO CREDENTIALS</div>
            <div className="text-sm" style={{ color: '#4A4A3F', fontFamily: 'var(--font-mono)' }}>
              <div>username: <span style={{ color: '#0D7377' }}>officer1</span></div>
              <div>password: <span style={{ color: '#0D7377' }}>demo123</span></div>
              <div className="mt-1 text-xs" style={{ color: '#9B9B8A' }}>MFI: Grameen Climate Finance</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
