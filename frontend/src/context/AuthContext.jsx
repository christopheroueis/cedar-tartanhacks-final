import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [mfi, setMfi] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isOnline, setIsOnline] = useState(navigator.onLine)

    useEffect(() => {
        // Check for stored auth on mount
        const storedUser = localStorage.getItem('climatecredit_user')
        const storedMfi = localStorage.getItem('climatecredit_mfi')
        const storedToken = localStorage.getItem('climatecredit_token')

        if (storedUser && storedMfi && storedToken) {
            setUser(JSON.parse(storedUser))
            setMfi(JSON.parse(storedMfi))
        }
        setLoading(false)

        // Monitor online status
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    const login = async (mfiId, username, password) => {
        try {
            // Try API first
            const result = await authAPI.login(mfiId, username, password)

            if (result.success) {
                setUser(result.user)
                setMfi(result.mfi)
                localStorage.setItem('climatecredit_user', JSON.stringify(result.user))
                localStorage.setItem('climatecredit_mfi', JSON.stringify(result.mfi))
                return { success: true }
            }

            return { success: false, error: 'Login failed' }
        } catch (error) {
            // Fallback to demo mode if API is not available
            console.warn('API unavailable, using demo mode:', error.message)
            return loginDemo(mfiId, username, password)
        }
    }

    // Demo login fallback (for offline or when backend is down)
    const loginDemo = (mfiId, username, password) => {
        const demoMfis = {
            'bangladesh-mfi': { id: 1, slug: 'bangladesh-mfi', name: 'Grameen Climate Finance', country: 'Bangladesh' },
            'kenya-mfi': { id: 2, slug: 'kenya-mfi', name: 'M-Pesa Green Loans', country: 'Kenya' },
            'peru-mfi': { id: 3, slug: 'peru-mfi', name: 'Banco Sol Verde', country: 'Peru' }
        }

        const demoUsers = {
            'officer1': { id: 1, name: 'Fatima Rahman', role: 'loan_officer' },
            'officer2': { id: 2, name: 'James Ochieng', role: 'loan_officer' },
            'officer3': { id: 3, name: 'Maria Gonzales', role: 'loan_officer' },
            'manager1': { id: 4, name: 'Ahmed Khan', role: 'manager' },
        }

        if (demoMfis[mfiId] && demoUsers[username] && password === 'demo123') {
            const userData = { ...demoUsers[username], username }
            const mfiData = demoMfis[mfiId]

            setUser(userData)
            setMfi(mfiData)

            localStorage.setItem('climatecredit_user', JSON.stringify(userData))
            localStorage.setItem('climatecredit_mfi', JSON.stringify(mfiData))

            return { success: true, demo: true }
        }

        return { success: false, error: 'Invalid credentials' }
    }

    const logout = () => {
        setUser(null)
        setMfi(null)
        authAPI.logout()
    }

    return (
        <AuthContext.Provider value={{
            user,
            mfi,
            loading,
            isOnline,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
