/**
 * Risk Assessment Routes v2
 * Comprehensive risk scoring with 7 dimensions
 */

import express from 'express'
import { assessLoanRisk } from '../services/riskDataService.js'
import { reverseGeocode, forwardGeocode } from '../services/locationService.js'
import { extractFormData, validateExtractedData } from '../services/aiService.js'

const router = express.Router()

/**
 * POST /api/v2/assess
 * Main assessment endpoint with full 7-dimension scoring
 */
router.post('/assess', async (req, res) => {
    try {
        const { location, project, client, loan } = req.body

        // Validate required fields
        if (!location || (!location.lat && !location.address)) {
            return res.status(400).json({
                success: false,
                error: 'Location required: provide lat/lng coordinates or address'
            })
        }

        // Run full assessment
        const result = await assessLoanRisk({
            location: {
                lat: location.lat ? parseFloat(location.lat) : null,
                lng: location.lng ? parseFloat(location.lng) : null,
                address: location.address
            },
            project: {
                type: project?.type || project?.projectType || 'agriculture-staple',
                cropType: project?.cropType || 'rice',
                ...project
            },
            client: {
                age: parseInt(client?.age) || 35,
                existingLoans: parseInt(client?.existingLoans) || 0,
                repaymentHistory: parseFloat(client?.repaymentHistory) || 90,
                monthlyIncome: parseFloat(client?.monthlyIncome) || 500,
                loanToIncomeRatio: client?.loanToIncomeRatio,
                firstTimeBorrower: client?.firstTimeBorrower || false,
                ...client
            },
            loan: {
                amount: parseFloat(loan?.amount) || 1000,
                type: loan?.type || loan?.loanType || 'working-capital',
                term: parseInt(loan?.term) || 12,
                collateral: loan?.collateral || loan?.collateralType || 'none',
                purpose: loan?.purpose,
                ...loan
            }
        })

        res.json(result)

    } catch (error) {
        console.error('Assessment error:', error)
        res.status(500).json({
            success: false,
            error: error.message || 'Assessment failed'
        })
    }
})

/**
 * POST /api/v2/geocode
 * Get location details from coordinates or address
 */
router.post('/geocode', async (req, res) => {
    try {
        const { lat, lng, address } = req.body

        let result
        if (lat && lng) {
            result = await reverseGeocode(parseFloat(lat), parseFloat(lng))
        } else if (address) {
            result = await forwardGeocode(address)
        } else {
            return res.status(400).json({
                success: false,
                error: 'Provide lat/lng or address'
            })
        }

        res.json({
            success: true,
            location: result
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

/**
 * POST /api/v2/ai/extract
 * Extract form data from conversation transcript using AI
 */
router.post('/ai/extract', async (req, res) => {
    try {
        const { transcript } = req.body

        if (!transcript) {
            return res.status(400).json({
                success: false,
                error: 'Transcript required'
            })
        }

        const result = await extractFormData(transcript)

        if (result.success) {
            // Validate the extracted data
            const validated = validateExtractedData(result.extracted)
            result.validated = validated
        }

        res.json(result)

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

/**
 * GET /api/v2/dimensions
 * Get info about the 7 risk dimensions
 */
router.get('/dimensions', (req, res) => {
    res.json({
        success: true,
        dimensions: [
            {
                name: 'Climate Risk',
                weight: 0.30,
                subMetrics: ['Flood Risk', 'Drought Risk', 'Heatwave Risk', 'Precipitation Variance', 'Coastal Exposure'],
                source: 'Open-Meteo API'
            },
            {
                name: 'Economic Risk',
                weight: 0.20,
                subMetrics: ['GDP per Capita', 'Inflation', 'Unemployment', 'Agriculture % GDP', 'Remittances'],
                source: 'World Bank API'
            },
            {
                name: 'Project Type Risk',
                weight: 0.18,
                subMetrics: ['Project Category', 'Crop Vulnerability', 'Loan Type', 'Collateral'],
                source: 'User Input'
            },
            {
                name: 'Conflict Risk',
                weight: 0.12,
                subMetrics: ['Fragile States Index', 'ACLED Event Density', 'Political Stability'],
                source: 'FSI + ACLED'
            },
            {
                name: 'Client Profile Risk',
                weight: 0.12,
                subMetrics: ['Repayment History', 'Existing Loans', 'Age', 'Loan-to-Income', 'First-time Borrower'],
                source: 'User Input'
            },
            {
                name: 'Infrastructure Risk',
                weight: 0.05,
                subMetrics: ['Electricity Access', 'Road Connectivity', 'Mobile Coverage', 'Banking Density'],
                source: 'World Bank API'
            },
            {
                name: 'Health & Social Risk',
                weight: 0.03,
                subMetrics: ['Health Index', 'Water Access', 'Disease Prevalence'],
                source: 'World Bank / WHO'
            }
        ]
    })
})

/**
 * GET /api/v2/project-types
 * Get available project types with risk info
 */
router.get('/project-types', (req, res) => {
    res.json({
        success: true,
        projectTypes: [
            { value: 'agriculture-staple', label: 'Agriculture - Staple Crops', baseRisk: 0.55, climateSensitivity: 'very-high' },
            { value: 'agriculture-cash', label: 'Agriculture - Cash Crops', baseRisk: 0.50, climateSensitivity: 'high' },
            { value: 'livestock', label: 'Livestock & Poultry', baseRisk: 0.45, climateSensitivity: 'high' },
            { value: 'fishing', label: 'Fishing/Aquaculture', baseRisk: 0.50, climateSensitivity: 'very-high' },
            { value: 'retail', label: 'Small Retail/Trade', baseRisk: 0.25, climateSensitivity: 'low' },
            { value: 'food-processing', label: 'Food Processing', baseRisk: 0.35, climateSensitivity: 'medium' },
            { value: 'manufacturing', label: 'Manufacturing', baseRisk: 0.30, climateSensitivity: 'medium' },
            { value: 'services', label: 'Services', baseRisk: 0.20, climateSensitivity: 'low' },
            { value: 'transport', label: 'Transport', baseRisk: 0.25, climateSensitivity: 'low' },
            { value: 'housing', label: 'Housing/Construction', baseRisk: 0.40, climateSensitivity: 'medium' }
        ],
        cropTypes: [
            { value: 'rice', label: 'Rice' },
            { value: 'wheat', label: 'Wheat' },
            { value: 'maize', label: 'Maize/Corn' },
            { value: 'coffee', label: 'Coffee' },
            { value: 'tea', label: 'Tea' },
            { value: 'cotton', label: 'Cotton' },
            { value: 'sugarcane', label: 'Sugarcane' },
            { value: 'vegetables', label: 'Vegetables' },
            { value: 'fruits', label: 'Fruits' },
            { value: 'pulses', label: 'Pulses/Legumes' }
        ],
        loanTypes: [
            { value: 'working-capital', label: 'Working Capital', riskScore: 0.30 },
            { value: 'equipment-purchase', label: 'Equipment Purchase', riskScore: 0.40 },
            { value: 'land-acquisition', label: 'Land Acquisition', riskScore: 0.50 },
            { value: 'crop-inputs', label: 'Crop Inputs (Seeds, Fertilizer)', riskScore: 0.45 },
            { value: 'livestock-purchase', label: 'Livestock Purchase', riskScore: 0.50 },
            { value: 'construction', label: 'Construction/Renovation', riskScore: 0.55 }
        ],
        collateralTypes: [
            { value: 'land-title', label: 'Land Title', riskScore: 0.15 },
            { value: 'savings-deposit', label: 'Savings/Deposit', riskScore: 0.20 },
            { value: 'equipment', label: 'Equipment', riskScore: 0.40 },
            { value: 'livestock', label: 'Livestock', riskScore: 0.35 },
            { value: 'group-guarantee', label: 'Group Guarantee', riskScore: 0.45 },
            { value: 'none', label: 'No Collateral', riskScore: 0.70 }
        ]
    })
})

export default router
