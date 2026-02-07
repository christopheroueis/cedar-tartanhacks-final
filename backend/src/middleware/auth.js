import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'climatecredit_demo_secret'

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            error: 'Authentication required',
            message: 'Please provide a valid authentication token'
        })
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                error: 'Invalid token',
                message: 'Your session has expired. Please log in again.'
            })
        }

        req.user = decoded
        next()
    })
}

// Optional auth - attaches user if token present, continues if not
export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (!err) {
                req.user = decoded
            }
        })
    }

    next()
}

// Check if user is a manager
export const requireManager = (req, res, next) => {
    if (!req.user || req.user.role !== 'manager') {
        return res.status(403).json({
            error: 'Access denied',
            message: 'Manager role required for this action'
        })
    }
    next()
}

export default authenticateToken
