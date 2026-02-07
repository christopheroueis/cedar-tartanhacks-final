import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Building2, User, Lock, ChevronDown, Leaf, Shield, TrendingUp } from 'lucide-react'

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
        { id: 'bangladesh-mfi', name: 'Grameen Climate Finance', country: 'Bangladesh 🇧🇩' },
        { id: 'kenya-mfi', name: 'M-Pesa Green Loans', country: 'Kenya 🇰🇪' },
        { id: 'peru-mfi', name: 'Banco Sol Verde', country: 'Peru 🇵🇪' }
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const result = await login(mfiId, username, password)

        if (result.success) {
            navigate('/')
        } else {
            setError(result.error)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="pt-8 pb-4 px-6">
                <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg pulse-glow">
                        <Leaf className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">ClimateCredit</h1>
                        <p className="text-xs text-slate-400 tracking-wide">Powered by Climate Intelligence</p>
                    </div>
                </div>
            </header>

            {/* Features Banner */}
            <div className="px-6 py-4">
                <div className="flex justify-center gap-6 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-teal-400" />
                        <span>Risk Analysis</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span>Smart Lending</span>
                    </div>
                </div>
            </div>

            {/* Login Form */}
            <main className="flex-1 px-6 pb-8">
                <div className="glass-card p-6 max-w-md mx-auto">
                    <h2 className="text-xl font-semibold text-white mb-1">Welcome Back</h2>
                    <p className="text-slate-400 text-sm mb-6">Sign in to continue to your dashboard</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* MFI Selection */}
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
                                    className="appearance-none pr-10"
                                >
                                    <option value="">Select your MFI...</option>
                                    {mfis.map(mfi => (
                                        <option key={mfi.id} value={mfi.id}>
                                            {mfi.name} — {mfi.country}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Username */}
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
                            />
                        </div>

                        {/* Password */}
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
                            />
                        </div>

                        {/* Remember Me */}
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-teal-500 focus:ring-teal-500 focus:ring-offset-0"
                            />
                            <span className="text-sm text-slate-300">Remember me for offline access</span>
                        </label>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-sm fade-in">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 
                         text-white font-semibold rounded-xl shadow-lg shadow-teal-500/30
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                         active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                {/* Demo Credentials Notice */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-500 mb-2">Demo Credentials</p>
                    <div className="inline-block glass-card px-4 py-2 text-xs text-slate-400">
                        <code>officer1 / officer2 / officer3</code> — Password: <code>demo123</code>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-4 text-center text-xs text-slate-500">
                <p>© 2026 ClimateCredit • Enterprise Climate Risk Platform</p>
                <p className="mt-1">Built for financial institutions by TartanHacks Team</p>
            </footer>
        </div>
    )
}
