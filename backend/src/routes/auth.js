import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { demoData, isDemoMode } from '../config/database.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'climatecredit_demo_secret'

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { mfiId, username, password } = req.body

        if (!mfiId || !username || !password) {
            return res.status(400).json({
                error: 'Missing credentials',
                message: 'Please provide mfiId, username, and password'
            })
        }

        // Find MFI
        const mfi = demoData.mfis.find(m => m.slug === mfiId)
        if (!mfi) {
            return res.status(404).json({
                error: 'MFI not found',
                message: 'The selected institution was not found'
            })
        }

        // Find loan officer
        const officer = demoData.loanOfficers.find(
            o => o.username === username && o.mfi_id === mfi.id
        )

        if (!officer) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Username or password is incorrect'
            })
        }

        // Demo mode: accept 'demo123' as password
        const isValidPassword = isDemoMode()
            ? password === 'demo123'
            : await bcrypt.compare(password, officer.password_hash)

        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Username or password is incorrect'
            })
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: officer.id,
                username: officer.username,
                name: officer.full_name,
                role: officer.role,
                mfiId: mfi.id,
                mfiSlug: mfi.slug,
                mfiName: mfi.name
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        )

        res.json({
            success: true,
            token,
            user: {
                id: officer.id,
                username: officer.username,
                name: officer.full_name,
                role: officer.role
            },
            mfi: {
                id: mfi.id,
                slug: mfi.slug,
                name: mfi.name,
                country: mfi.country
            }
        })

    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({
            error: 'Authentication failed',
            message: 'An error occurred during login'
        })
    }
})

// POST /api/auth/verify
router.post('/verify', (req, res) => {
    const { token } = req.body

    if (!token) {
        return res.status(400).json({ valid: false })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        res.json({ valid: true, user: decoded })
    } catch (error) {
        res.json({ valid: false })
    }
})

// GET /api/auth/mfis - List available MFIs for login dropdown
router.get('/mfis', (req, res) => {
    const mfis = demoData.mfis.map(m => ({
        id: m.slug,
        name: m.name,
        country: m.country
    }))
    res.json(mfis)
})

export default router
