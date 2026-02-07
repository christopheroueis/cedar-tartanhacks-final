import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Building2, User, Lock, ChevronDown, Shield, TrendingUp } from 'lucide-react'

export default function Login() {
  const [mfiId, setMfiId] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const mfis = [
    { id: 'bangladesh-mfi', name: 'Grameen Climate Finance', country: 'Bangladesh' },
    { id: 'kenya-mfi', name: 'M-Pesa Green Loans', country: 'Kenya' },
    { id: 'peru-mfi', name: 'Banco Sol Verde', country: 'Peru' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(mfiId, username, password)
    if (result.success) {
      navigate('/app')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f0a]">
      <header className="pt-10 pb-6 px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center">
            <img src="/cedarlogo.png" alt="Cedar" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Cedar</h1>
            <p className="text-xs text-slate-400 tracking-wide">Climate-informed lending</p>
          </div>
        </motion.div>
      </header>

      <div className="px-6 py-2 flex justify-center gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-[#14B8A6]" />
          <span>Risk analysis</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Smart lending</span>
        </div>
      </div>

      <main className="flex-1 px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="card-cedar p-6 max-w-md mx-auto"
        >
          <h2 className="text-xl font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-slate-400 text-sm mb-6">Sign in to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                <Building2 className="w-4 h-4 inline mr-2" />
                Institution
              </label>
              <div className="relative">
                <select
                  value={mfiId}
                  onChange={(e) => setMfiId(e.target.value)}
                  required
                  className="input-cedar appearance-none pr-10"
                >
                  <option value="">Select your MFI...</option>
                  {mfis.map((mfi) => (
                    <option key={mfi.id} value={mfi.id}>
                      {mfi.name} — {mfi.country}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                <User className="w-4 h-4 inline mr-2" />
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoComplete="username"
                className="input-cedar"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="input-cedar"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 rounded border-slate-600 bg-slate-700/50 text-[#14B8A6] focus:ring-[#14B8A6] focus:ring-offset-0"
              />
              <span className="text-sm text-slate-300">Remember me for offline access</span>
            </label>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </motion.button>
          </form>
        </motion.div>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 mb-2">Demo credentials</p>
          <div className="inline-block glass-card px-4 py-2 text-xs text-slate-400">
            <code>officer1</code> / <code>officer2</code> / <code>officer3</code> — Password: <code>demo123</code>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-500">
        <p>© 2026 Cedar · Climate-informed lending for MFIs</p>
      </footer>
    </div>
  )
}
