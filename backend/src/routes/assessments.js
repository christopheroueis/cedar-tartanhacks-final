import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { demoData, isDemoMode } from '../config/database.js'
import climateService from '../services/climateService.js'

const router = express.Router()

// In-memory storage for demo assessments
let assessmentCounter = 1000

// POST /api/assess-loan - Main loan assessment endpoint
router.post('/assess-loan', authenticateToken, async (req, res) => {
    try {
        const {
            latitude,
            longitude,
            locationName,
            loanAmount,
            loanPurpose,
            cropType,
            clientAge,
            existingLoans,
            repaymentHistory
        } = req.body

        // Validate required fields
        if (!latitude || !longitude || !loanAmount || !loanPurpose) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Please provide latitude, longitude, loanAmount, and loanPurpose'
            })
        }

        const lat = parseFloat(latitude)
        const lng = parseFloat(longitude)
        const amount = parseFloat(loanAmount)

        // Get climate data for location
        const climateData = await climateService.getClimateData(lat, lng)

        // Calculate climate risk score
        const climateRisk = climateService.calculateClimateRiskScore(
            climateData,
            loanPurpose,
            cropType
        )

        // Calculate default probabilities
        const defaultProb = climateService.calculateDefaultProbability(
            climateRisk.score,
            {
                age: parseInt(clientAge) || 35,
                existingLoans: parseInt(existingLoans) || 0,
                repaymentHistory: parseFloat(repaymentHistory) || 95
            }
        )

        // Generate recommendations
        const { recommendation, products } = climateService.generateRecommendations(
            climateRisk,
            loanPurpose,
            cropType
        )

        // Create assessment record
        const assessment = {
            id: `assess_${assessmentCounter++}`,
            mfiId: req.user.mfiSlug,
            mfiName: req.user.mfiName,
            loanOfficerId: req.user.userId,
            loanOfficerName: req.user.name,
            location: {
                latitude: lat,
                longitude: lng,
                name: locationName || climateData.location?.region || 'Unknown',
                country: climateData.location?.country
            },
            loanDetails: {
                amount,
                purpose: loanPurpose,
                cropType: cropType || null
            },
            clientInfo: {
                age: parseInt(clientAge) || null,
                existingLoans: parseInt(existingLoans) || 0,
                repaymentHistory: parseFloat(repaymentHistory) || null
            },
            climateData: {
                source: climateData.source,
                risks: climateData.risks,
                weather: climateData.weather
            },
            results: {
                climateRiskScore: climateRisk.score,
                riskFactors: climateRisk.factors,
                seasonalMultiplier: climateRisk.seasonalMultiplier,
                defaultProbability: {
                    baseline: defaultProb.baseline,
                    unadjusted: defaultProb.unadjusted,
                    adjusted: defaultProb.adjusted,
                    reduction: defaultProb.reduction
                }
            },
            recommendation,
            products,
            status: 'pending',
            createdAt: new Date().toISOString()
        }

        // Store in demo data
        demoData.assessments.push(assessment)

        res.json({
            success: true,
            assessment
        })

    } catch (error) {
        console.error('Assessment error:', error)
        res.status(500).json({
            error: 'Assessment failed',
            message: 'An error occurred during loan assessment'
        })
    }
})

// GET /api/assessments/:mfiId - Get all assessments for an MFI
router.get('/mfi/:mfiId', authenticateToken, (req, res) => {
    const { mfiId } = req.params
    const { page = 1, limit = 20, status, minRisk, maxRisk } = req.query

    let assessments = demoData.assessments.filter(a => a.mfiId === mfiId)

    // Apply filters
    if (status) {
        assessments = assessments.filter(a => a.recommendation?.type === status)
    }
    if (minRisk) {
        assessments = assessments.filter(a => a.results?.climateRiskScore >= parseInt(minRisk))
    }
    if (maxRisk) {
        assessments = assessments.filter(a => a.results?.climateRiskScore <= parseInt(maxRisk))
    }

    // Sort by date (newest first)
    assessments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    // Paginate
    const startIndex = (page - 1) * limit
    const paginatedAssessments = assessments.slice(startIndex, startIndex + parseInt(limit))

    res.json({
        total: assessments.length,
        page: parseInt(page),
        limit: parseInt(limit),
        assessments: paginatedAssessments
    })
})

// GET /api/assessments/:id - Get single assessment
router.get('/:id', authenticateToken, (req, res) => {
    const { id } = req.params
    const assessment = demoData.assessments.find(a => a.id === id)

    if (!assessment) {
        return res.status(404).json({
            error: 'Not found',
            message: 'Assessment not found'
        })
    }

    // Check access (same MFI)
    if (assessment.mfiId !== req.user.mfiSlug) {
        return res.status(403).json({
            error: 'Access denied',
            message: 'You do not have access to this assessment'
        })
    }

    res.json(assessment)
})

// PATCH /api/assessments/:id/decision - Record loan officer decision
router.patch('/:id/decision', authenticateToken, (req, res) => {
    const { id } = req.params
    const { decision, notes } = req.body

    const assessmentIndex = demoData.assessments.findIndex(a => a.id === id)

    if (assessmentIndex === -1) {
        return res.status(404).json({ error: 'Assessment not found' })
    }

    const assessment = demoData.assessments[assessmentIndex]

    if (assessment.mfiId !== req.user.mfiSlug) {
        return res.status(403).json({ error: 'Access denied' })
    }

    // Update assessment
    assessment.status = decision // 'approved', 'rejected', 'deferred'
    assessment.decision = {
        action: decision,
        notes: notes || '',
        decidedBy: req.user.name,
        decidedAt: new Date().toISOString()
    }

    demoData.assessments[assessmentIndex] = assessment

    res.json({ success: true, assessment })
})

export default router
