/**
 * Vercel Serverless Function — wraps the existing Express app
 * All /api/* requests are routed here by vercel.json
 */

import app from '../backend/src/app.js'

export default app
