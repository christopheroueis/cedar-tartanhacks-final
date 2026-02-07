/**
 * Risk Data Service
 * Orchestrates all external API calls and calculates comprehensive risk scores
 * Based on 7-dimension framework with literature-backed weights
 */

import { reverseGeocode, forwardGeocode } from './locationService.js'
import { getClimateData, getFloodData } from './externalApis/openMeteoApi.js'
import { getEconomicIndicators, getInfrastructureData } from './externalApis/worldBankApi.js'
import { getConflictScore, getPoliticalStabilityRisk as getFSIPoliticalStability } from './externalApis/conflictDataService.js'
import {
    getSeasonalMultiplier,
    getCropVulnerability,
    getProjectTypeRisk,
    getLoanTypeRisk,
    getCollateralRisk
} from './externalApis/staticData.js'

// Dimension weights (research-backed)
const DIMENSION_WEIGHTS = {
    climate: 0.30,
    economic: 0.20,
    projectType: 0.18,
    conflict: 0.12,
    clientProfile: 0.12,
    infrastructure: 0.05,
    healthSocial: 0.03
}

// Sub-metric weights within each dimension
const SUB_WEIGHTS = {
    climate: {
        flood: 0.35,
        drought: 0.30,
        heatwave: 0.15,
        precipVariance: 0.12,
        coastalExposure: 0.08
    },
    economic: {
        gdp: 0.30,
        inflation: 0.25,
        unemployment: 0.20,
        agricultureGdp: 0.15,
        remittance: 0.10
    },
    conflict: {
        fsiTotal: 0.45,
        securityApparatus: 0.30,
        politicalStability: 0.25
    },
    clientProfile: {
        repaymentHistory: 0.40,
        existingLoans: 0.25,
        age: 0.15,
        loanToIncome: 0.12,
        firstTimeBorrower: 0.08
    }
}

/**
 * Main function to assess loan risk
 * @param {Object} input - Contains location, project, client, and loan data
 */
export async function assessLoanRisk(input) {
    const { location, project, client, loan } = input

    // Step 1: Resolve location
    let locationData
    if (location.lat && location.lng) {
        locationData = await reverseGeocode(location.lat, location.lng)
    } else if (location.address) {
        locationData = await forwardGeocode(location.address)
    } else {
        throw new Error('Location required: provide lat/lng or address')
    }

    // Step 2: Fetch all external data in parallel
    const [
        climateData,
        floodData,
        economicData,
        infrastructureData
    ] = await Promise.all([
        getClimateData(locationData.lat, locationData.lng),
        getFloodData(locationData.lat, locationData.lng),
        getEconomicIndicators(locationData.countryCode),
        getInfrastructureData(locationData.countryCode)
    ])

    // Get conflict data from FSI (synchronous lookup from pre-loaded JSON)
    const conflictData = getConflictScore(locationData.countryCode)

    // Step 3: Calculate each dimension score
    const dimensionScores = {
        climate: calculateClimateScore(climateData, floodData, project.cropType),
        economic: calculateEconomicScore(economicData),
        conflict: calculateConflictScoreFn(conflictData, locationData.countryCode),
        projectType: calculateProjectTypeScore(project, loan),
        clientProfile: calculateClientProfileScore(client),
        infrastructure: infrastructureData?.riskScore || 0.5,
        healthSocial: 0.4 // Default - would need additional API for detailed health data
    }

    // Step 4: Apply seasonal multiplier
    const seasonal = getSeasonalMultiplier(locationData.countryCode)

    // Step 5: Calculate weighted total risk score
    let totalRisk = 0
    Object.entries(DIMENSION_WEIGHTS).forEach(([dimension, weight]) => {
        totalRisk += (dimensionScores[dimension] || 0) * weight
    })

    // Apply seasonal multiplier
    totalRisk = totalRisk * seasonal.multiplier

    // Cap at 1.0
    totalRisk = Math.min(1, totalRisk)

    // Convert to 0-100 scale
    const riskScore = Math.round(totalRisk * 100)

    // Step 6: Calculate default probability
    const defaultProbability = calculateDefaultProbability(totalRisk, client)

    // Step 7: Generate recommendation
    const recommendation = generateRecommendation(riskScore, dimensionScores)

    return {
        success: true,
        timestamp: new Date().toISOString(),
        location: {
            ...locationData,
            seasonal
        },
        dimensions: {
            climate: {
                score: dimensionScores.climate,
                weight: DIMENSION_WEIGHTS.climate,
                data: { climate: climateData, flood: floodData }
            },
            economic: {
                score: dimensionScores.economic,
                weight: DIMENSION_WEIGHTS.economic,
                data: economicData?.indicators
            },
            conflict: {
                score: dimensionScores.conflict,
                weight: DIMENSION_WEIGHTS.conflict,
                data: conflictData?.statistics
            },
            projectType: {
                score: dimensionScores.projectType,
                weight: DIMENSION_WEIGHTS.projectType,
                data: { project, loan }
            },
            clientProfile: {
                score: dimensionScores.clientProfile,
                weight: DIMENSION_WEIGHTS.clientProfile,
                data: client
            },
            infrastructure: {
                score: dimensionScores.infrastructure,
                weight: DIMENSION_WEIGHTS.infrastructure,
                data: infrastructureData
            },
            healthSocial: {
                score: dimensionScores.healthSocial,
                weight: DIMENSION_WEIGHTS.healthSocial
            }
        },
        results: {
            riskScore,
            riskLevel: getRiskLevel(riskScore),
            defaultProbability
        },
        recommendation
    }
}

/**
 * Calculate climate dimension score
 */
function calculateClimateScore(climateData, floodData, cropType) {
    const weights = SUB_WEIGHTS.climate
    const cropVuln = getCropVulnerability(cropType)

    // Get raw risk values
    const floodRisk = floodData?.floodRisk || 0.3
    const droughtRisk = climateData?.riskIndicators?.droughtIndex || 0.4
    const heatwaveRisk = climateData?.riskIndicators?.heatwaveDays
        ? Math.min(1, climateData.riskIndicators.heatwaveDays / 10)
        : 0.3
    const precipVariance = climateData?.riskIndicators?.precipVarianceCV || 0.5
    const coastalExposure = 0.2 // Would need additional data source

    // Apply crop-specific vulnerability multipliers
    const adjustedFlood = floodRisk * cropVuln.flood
    const adjustedDrought = droughtRisk * cropVuln.drought
    const adjustedHeatwave = heatwaveRisk * cropVuln.heatwave

    const score = (
        adjustedFlood * weights.flood +
        adjustedDrought * weights.drought +
        adjustedHeatwave * weights.heatwave +
        precipVariance * weights.precipVariance +
        coastalExposure * weights.coastalExposure
    )

    return parseFloat(Math.min(1, score).toFixed(3))
}

/**
 * Calculate economic dimension score
 */
function calculateEconomicScore(economicData) {
    const weights = SUB_WEIGHTS.economic
    const risks = economicData?.riskScores || {}

    const score = (
        (risks.gdpRisk || 0.5) * weights.gdp +
        (risks.inflationRisk || 0.4) * weights.inflation +
        (risks.unemploymentRisk || 0.4) * weights.unemployment +
        (risks.agricultureRisk || 0.5) * weights.agricultureGdp +
        (risks.remittanceRisk || 0.4) * weights.remittance
    )

    return parseFloat(Math.min(1, score).toFixed(3))
}

/**
 * Calculate conflict dimension score using FSI data
 */
function calculateConflictScoreFn(conflictData, countryCode) {
    const weights = SUB_WEIGHTS.conflict

    // Use FSI-based conflict data
    const fsiRisk = conflictData?.normalizedRisk || 0.5
    const securityRisk = conflictData?.components?.securityApparatus || 0.5
    const stabilityRisk = getFSIPoliticalStability(countryCode)

    const score = (
        fsiRisk * weights.fsiTotal +
        securityRisk * weights.securityApparatus +
        stabilityRisk * weights.politicalStability
    )

    return parseFloat(Math.min(1, score).toFixed(3))
}

/**
 * Calculate project type dimension score
 */
function calculateProjectTypeScore(project, loan) {
    const projectRisk = getProjectTypeRisk(project.type || project.projectType)
    const loanRisk = getLoanTypeRisk(loan.type || loan.loanType)
    const collateralRisk = getCollateralRisk(loan.collateral || loan.collateralType)

    // Weight components
    const score = (
        projectRisk.baseRisk * 0.40 +
        loanRisk * 0.30 +
        collateralRisk * 0.30
    )

    return parseFloat(Math.min(1, score).toFixed(3))
}

/**
 * Calculate client profile dimension score
 */
function calculateClientProfileScore(client) {
    const weights = SUB_WEIGHTS.clientProfile

    // Repayment history (higher % = lower risk)
    let repaymentRisk = 0.4
    const repayment = client.repaymentHistory
    if (repayment >= 95) repaymentRisk = 0.1
    else if (repayment >= 80) repaymentRisk = 0.35
    else if (repayment >= 60) repaymentRisk = 0.6
    else repaymentRisk = 0.85

    // Existing loans (more loans = higher risk)
    let loansRisk = 0.4
    const loans = client.existingLoans || 0
    if (loans === 0) loansRisk = 0.2
    else if (loans === 1) loansRisk = 0.35
    else if (loans === 2) loansRisk = 0.5
    else loansRisk = 0.75

    // Age factor
    let ageRisk = 0.3
    const age = client.age
    if (age >= 25 && age <= 50) ageRisk = 0.2
    else if (age >= 51 && age <= 60) ageRisk = 0.35
    else if (age < 25) ageRisk = 0.5
    else ageRisk = 0.55

    // Loan-to-income ratio
    let ltiRisk = 0.4
    const lti = client.loanToIncomeRatio || (client.loanAmount / (client.monthlyIncome * 12))
    if (lti < 0.25) ltiRisk = 0.15
    else if (lti < 0.40) ltiRisk = 0.35
    else if (lti < 0.60) ltiRisk = 0.55
    else ltiRisk = 0.8

    // First-time borrower
    const firstTimeRisk = client.firstTimeBorrower ? 0.4 : 0.2

    const score = (
        repaymentRisk * weights.repaymentHistory +
        loansRisk * weights.existingLoans +
        ageRisk * weights.age +
        ltiRisk * weights.loanToIncome +
        firstTimeRisk * weights.firstTimeBorrower
    )

    return parseFloat(Math.min(1, score).toFixed(3))
}

/**
 * Calculate default probability
 */
function calculateDefaultProbability(totalRisk, client) {
    // Base rate for microfinance (12%)
    const BASE_RATE = 0.12

    // Client factor (from repayment history)
    let clientFactor = 1.0
    if (client.repaymentHistory >= 95) clientFactor = 0.7
    else if (client.repaymentHistory >= 80) clientFactor = 0.9
    else if (client.repaymentHistory >= 60) clientFactor = 1.2
    else clientFactor = 1.5

    // Climate impact (up to 25% additional)
    const climateImpact = totalRisk * 0.25

    const baseline = BASE_RATE * clientFactor * (1 + climateImpact)

    // With risk mitigation products (30-45% reduction)
    const adjusted = baseline * 0.65

    return {
        baseline: parseFloat(Math.min(0.9, baseline).toFixed(4)),
        adjusted: parseFloat(Math.min(0.7, adjusted).toFixed(4)),
        reduction: '35%'
    }
}

/**
 * Get risk level label
 */
function getRiskLevel(score) {
    if (score <= 35) return 'low'
    if (score <= 55) return 'moderate'
    if (score <= 70) return 'high'
    return 'very-high'
}

/**
 * Generate recommendation based on risk score
 */
function generateRecommendation(riskScore, dimensions) {
    let type, message, requirements

    if (riskScore <= 35) {
        type = 'approve'
        message = 'Low risk profile. Standard loan terms recommended.'
        requirements = ['Standard documentation', 'Optional weather insurance']
    } else if (riskScore <= 55) {
        type = 'caution'
        message = 'Moderate risk. Proceed with additional safeguards.'
        requirements = [
            'Mandatory weather-indexed insurance',
            'Quarterly portfolio review',
            'Flexible repayment schedule during peak risk season'
        ]
    } else if (riskScore <= 70) {
        type = 'conditional'
        message = 'Elevated risk. Senior review required.'
        requirements = [
            'Senior manager approval required',
            'Risk mitigation plan',
            'Enhanced collateral requirements',
            'Monthly monitoring',
            'Mandatory crop + health insurance'
        ]
    } else {
        type = 'defer'
        message = 'High risk profile. Consider alternative structure or decline.'
        requirements = [
            'Reduce loan amount',
            'Require co-borrower or guarantor',
            'Consider grant component',
            'Emergency fund requirement'
        ]
    }

    // Add dimension-specific warnings
    const warnings = []
    if (dimensions.climate > 0.6) warnings.push('High climate exposure detected')
    if (dimensions.conflict > 0.5) warnings.push('Elevated conflict risk in area')
    if (dimensions.economic > 0.6) warnings.push('Challenging economic environment')

    return {
        type,
        message,
        requirements,
        warnings
    }
}

export default {
    assessLoanRisk,
    DIMENSION_WEIGHTS,
    SUB_WEIGHTS
}
