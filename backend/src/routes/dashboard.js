import express from 'express'
import { authenticateToken, requireManager } from '../middleware/auth.js'
import { demoData } from '../config/database.js'

const router = express.Router()

// GET /api/dashboard/:mfiId - Portfolio analytics
router.get('/:mfiId', authenticateToken, (req, res) => {
    const { mfiId } = req.params

    // Get all assessments for this MFI
    const mfiAssessments = demoData.assessments.filter(a => a.mfiId === mfiId)

    // Calculate statistics
    const totalAssessments = mfiAssessments.length
    const totalLoanVolume = mfiAssessments.reduce((sum, a) => sum + (a.loanDetails?.amount || 0), 0)

    const riskScores = mfiAssessments.map(a => a.results?.climateRiskScore || 50)
    const avgRiskScore = riskScores.length > 0
        ? Math.round(riskScores.reduce((a, b) => a + b, 0) / riskScores.length)
        : 50

    // Risk distribution
    const lowRisk = mfiAssessments.filter(a => (a.results?.climateRiskScore || 50) <= 35).length
    const medRisk = mfiAssessments.filter(a => {
        const score = a.results?.climateRiskScore || 50
        return score > 35 && score <= 65
    }).length
    const highRisk = mfiAssessments.filter(a => (a.results?.climateRiskScore || 50) > 65).length

    // Recent high-risk assessments
    const recentHighRisk = mfiAssessments
        .filter(a => (a.results?.climateRiskScore || 0) > 65)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(a => ({
            id: a.id,
            client: a.location?.name || 'Unknown',
            amount: a.loanDetails?.amount || 0,
            risk: a.results?.climateRiskScore || 0,
            location: a.location?.name || 'Unknown',
            date: a.createdAt
        }))

    // Purpose breakdown
    const purposeBreakdown = {}
    mfiAssessments.forEach(a => {
        const purpose = a.loanDetails?.purpose || 'other'
        purposeBreakdown[purpose] = (purposeBreakdown[purpose] || 0) + 1
    })

    // Generate demo data if no assessments exist
    const dashboard = {
        summary: {
            totalAssessments: totalAssessments || 247,
            totalLoanVolume: totalLoanVolume || 2340000,
            avgRiskScore: avgRiskScore || 48,
            highRiskCount: highRisk || 12
        },
        riskDistribution: {
            low: { count: lowRisk || 45, percentage: totalAssessments ? Math.round(lowRisk / totalAssessments * 100) : 45 },
            medium: { count: medRisk || 38, percentage: totalAssessments ? Math.round(medRisk / totalAssessments * 100) : 38 },
            high: { count: highRisk || 17, percentage: totalAssessments ? Math.round(highRisk / totalAssessments * 100) : 17 }
        },
        recentHighRisk: recentHighRisk.length > 0 ? recentHighRisk : [
            { id: 'demo1', client: 'Ahmed Hassan', amount: 1500, risk: 78, location: 'Sylhet', date: new Date().toISOString() },
            { id: 'demo2', client: 'Maria Santos', amount: 2200, risk: 72, location: 'Cusco', date: new Date().toISOString() }
        ],
        purposeBreakdown: Object.keys(purposeBreakdown).length > 0 ? purposeBreakdown : {
            agriculture: 45,
            livestock: 25,
            small_business: 20,
            housing: 10
        },
        monthlyTrend: generateMonthlyTrend(),
        regionalRisks: generateRegionalRisks(mfiId)
    }

    res.json(dashboard)
})

// GET /api/dashboard/:mfiId/export - Export portfolio data as CSV
router.get('/:mfiId/export', authenticateToken, requireManager, (req, res) => {
    const { mfiId } = req.params
    const assessments = demoData.assessments.filter(a => a.mfiId === mfiId)

    // Generate CSV
    const headers = ['ID', 'Date', 'Location', 'Amount', 'Purpose', 'Climate Risk', 'Default Prob (Baseline)', 'Default Prob (Adjusted)', 'Recommendation', 'Status']

    const rows = assessments.map(a => [
        a.id,
        new Date(a.createdAt).toISOString().split('T')[0],
        a.location?.name || '',
        a.loanDetails?.amount || '',
        a.loanDetails?.purpose || '',
        a.results?.climateRiskScore || '',
        a.results?.defaultProbability?.baseline || '',
        a.results?.defaultProbability?.adjusted || '',
        a.recommendation?.type || '',
        a.status || 'pending'
    ])

    const csv = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename=portfolio_${mfiId}_${Date.now()}.csv`)
    res.send(csv)
})

// Helper: Generate monthly trend data
function generateMonthlyTrend() {
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
    return months.map((month, i) => ({
        month,
        loans: 150 + Math.floor(Math.random() * 100),
        avgRisk: 40 + Math.floor(Math.random() * 20)
    }))
}

// Helper: Generate regional risk data
function generateRegionalRisks(mfiId) {
    const regions = {
        'bangladesh-mfi': ['Sylhet', 'Dhaka', 'Chittagong', 'Khulna', 'Rajshahi'],
        'kenya-mfi': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'],
        'peru-mfi': ['Lima', 'Cusco', 'Arequipa', 'Trujillo', 'Piura']
    }

    const regionNames = regions[mfiId] || regions['bangladesh-mfi']

    return regionNames.map(region => ({
        region,
        floodRisk: 0.2 + Math.random() * 0.5,
        droughtRisk: 0.1 + Math.random() * 0.4,
        assessments: Math.floor(50 + Math.random() * 150)
    }))
}

export default router
