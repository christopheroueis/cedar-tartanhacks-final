import NodeCache from 'node-cache'
import axios from 'axios'
import { demoData, isDemoMode } from '../config/database.js'

// Cache climate data for 1 hour
const climateCache = new NodeCache({ stdTTL: 3600 })

// ML Service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000'

// Crop vulnerability factors (how sensitive each crop is to climate risks)
const cropVulnerability = {
    rice: { flood: 0.9, drought: 0.7, heatwave: 0.5 },
    wheat: { flood: 0.5, drought: 0.8, heatwave: 0.7 },
    maize: { flood: 0.6, drought: 0.9, heatwave: 0.8 },
    coffee: { flood: 0.4, drought: 0.7, heatwave: 0.9 },
    tea: { flood: 0.5, drought: 0.6, heatwave: 0.7 },
    sugarcane: { flood: 0.3, drought: 0.8, heatwave: 0.6 },
    vegetables: { flood: 0.7, drought: 0.8, heatwave: 0.7 },
    fruits: { flood: 0.6, drought: 0.7, heatwave: 0.6 },
    cotton: { flood: 0.5, drought: 0.9, heatwave: 0.8 },
    other: { flood: 0.5, drought: 0.5, heatwave: 0.5 }
}

// Seasonal risk multipliers
const seasonalMultipliers = {
    // Northern hemisphere monsoon regions (Bangladesh)
    high_lat: {
        1: 0.8, 2: 0.8, 3: 0.9, 4: 1.0, 5: 1.1, 6: 1.3,
        7: 1.5, 8: 1.5, 9: 1.3, 10: 1.0, 11: 0.9, 12: 0.8
    },
    // Equatorial (Kenya)
    equatorial: {
        1: 0.9, 2: 0.9, 3: 1.2, 4: 1.4, 5: 1.3, 6: 0.8,
        7: 0.7, 8: 0.7, 9: 0.8, 10: 1.2, 11: 1.4, 12: 1.1
    },
    // Southern hemisphere (Peru highlands)
    low_lat: {
        1: 1.3, 2: 1.4, 3: 1.2, 4: 0.9, 5: 0.7, 6: 0.6,
        7: 0.6, 8: 0.7, 9: 0.8, 10: 0.9, 11: 1.0, 12: 1.2
    }
}

/**
 * Get climate data for a location
 * In production, this fetches from NASA POWER and OpenWeatherMap APIs
 * In demo mode, uses synthetic data based on region
 */
export async function getClimateData(lat, lng) {
    const cacheKey = `climate_${lat.toFixed(2)}_${lng.toFixed(2)}`

    // Check cache first
    const cached = climateCache.get(cacheKey)
    if (cached) return cached

    let climateData

    if (isDemoMode()) {
        // Find nearest climate zone from demo data
        const nearestZone = findNearestClimateZone(lat, lng)
        climateData = {
            location: {
                lat,
                lng,
                region: nearestZone.region_name,
                country: nearestZone.country
            },
            risks: {
                flood: nearestZone.flood_risk,
                drought: nearestZone.drought_risk,
                heatwave: nearestZone.heatwave_risk
            },
            weather: {
                current_temp: 25 + Math.random() * 10,
                precipitation_30d: 50 + Math.random() * 150,
                humidity: 60 + Math.random() * 30
            },
            historical: {
                flood_events_5y: Math.floor(nearestZone.flood_risk * 10),
                drought_months_5y: Math.floor(nearestZone.drought_risk * 12),
                avg_annual_rainfall_mm: nearestZone.flood_risk > 0.5 ? 2000 + Math.random() * 500 : 800 + Math.random() * 400
            },
            source: 'demo',
            timestamp: new Date().toISOString()
        }
    } else {
        // Production: Fetch from real APIs
        try {
            const [nasaData, weatherData] = await Promise.all([
                fetchNasaPowerData(lat, lng),
                fetchOpenWeatherData(lat, lng)
            ])

            climateData = {
                location: { lat, lng },
                nasa: nasaData,
                weather: weatherData,
                source: 'api',
                timestamp: new Date().toISOString()
            }
        } catch (error) {
            console.error('Climate API error:', error)
            // Fallback to demo data
            const nearestZone = findNearestClimateZone(lat, lng)
            climateData = {
                location: { lat, lng, region: nearestZone.region_name },
                risks: nearestZone,
                source: 'fallback',
                timestamp: new Date().toISOString()
            }
        }
    }

    // Cache the result
    climateCache.set(cacheKey, climateData)
    return climateData
}

/**
 * Calculate climate risk score (0-100)
 * Higher score = higher risk
 */
export function calculateClimateRiskScore(climateData, loanPurpose, cropType) {
    const risks = climateData.risks || {
        flood: 0.3,
        drought: 0.3,
        heatwave: 0.3
    }

    // Base risk from climate data
    let floodRisk = risks.flood
    let droughtRisk = risks.drought
    let heatwaveRisk = risks.heatwave

    // Apply seasonal multiplier
    const month = new Date().getMonth() + 1
    const lat = climateData.location?.lat || 0
    const seasonKey = lat > 15 ? 'high_lat' : lat < -10 ? 'low_lat' : 'equatorial'
    const seasonalMultiplier = seasonalMultipliers[seasonKey][month]

    // Apply crop vulnerability if agriculture
    if (loanPurpose === 'agriculture' && cropType) {
        const vuln = cropVulnerability[cropType] || cropVulnerability.other
        floodRisk *= vuln.flood
        droughtRisk *= vuln.drought
        heatwaveRisk *= vuln.heatwave
    }

    // Purpose-specific adjustments
    const purposeWeights = {
        agriculture: { flood: 0.4, drought: 0.4, heatwave: 0.2 },
        livestock: { flood: 0.3, drought: 0.5, heatwave: 0.2 },
        small_business: { flood: 0.5, drought: 0.2, heatwave: 0.3 },
        housing: { flood: 0.6, drought: 0.1, heatwave: 0.3 }
    }

    const weights = purposeWeights[loanPurpose] || purposeWeights.small_business

    // Weighted climate risk
    let climateRisk = (
        floodRisk * weights.flood +
        droughtRisk * weights.drought +
        heatwaveRisk * weights.heatwave
    ) * seasonalMultiplier

    // Normalize to 0-100 scale
    const riskScore = Math.min(100, Math.max(0, climateRisk * 100))

    return {
        score: Math.round(riskScore),
        factors: {
            flood: { value: floodRisk, weight: weights.flood },
            drought: { value: droughtRisk, weight: weights.drought },
            heatwave: { value: heatwaveRisk, weight: weights.heatwave }
        },
        seasonalMultiplier,
        cropVulnerability: cropType ? cropVulnerability[cropType] : null
    }
}

/**
 * Calculate default probability with and without climate data
 */
export function calculateDefaultProbability(climateRiskScore, clientData) {
    // Base default rate from traditional credit factors
    const baseDefaultRate = 0.12 // 12% base rate for microfinance

    // Client factors
    let clientFactor = 1.0

    // Age factor (younger and older clients slightly higher risk)
    if (clientData.age < 25 || clientData.age > 60) {
        clientFactor *= 1.1
    }

    // Existing loans factor
    if (clientData.existingLoans > 2) {
        clientFactor *= 1.2
    } else if (clientData.existingLoans === 0) {
        clientFactor *= 0.9
    }

    // Repayment history factor
    const repaymentRate = clientData.repaymentHistory / 100
    clientFactor *= (2 - repaymentRate) // 100% history = 1.0, 50% = 1.5

    // Baseline default (without climate)
    const baselineDefault = Math.min(0.5, baseDefaultRate * clientFactor)

    // Climate impact on default
    const climateImpact = (climateRiskScore / 100) * 0.25 // Up to 25% additional risk

    // Default probability with climate risk
    const unadjustedDefault = Math.min(0.65, baselineDefault + climateImpact)

    // Adjusted default (with climate-smart modifications applied)
    // Modifications reduce climate risk by ~35-45%
    const modificationReduction = 0.35 + Math.random() * 0.1
    const adjustedDefault = Math.min(0.5, baselineDefault + climateImpact * (1 - modificationReduction))

    return {
        baseline: Number(baselineDefault.toFixed(4)),
        unadjusted: Number(unadjustedDefault.toFixed(4)),
        adjusted: Number(adjustedDefault.toFixed(4)),
        reduction: Number(((unadjustedDefault - adjustedDefault) / unadjustedDefault * 100).toFixed(1))
    }
}

/**
 * Generate product recommendations based on risk profile
 */
export function generateRecommendations(climateRisk, loanPurpose, cropType) {
    const recommendations = []
    const riskScore = climateRisk.score

    // Determine recommendation type
    let type = 'approve'
    if (riskScore > 70) type = 'defer'
    else if (riskScore > 50) type = 'caution'

    // Core recommendation
    const coreRecommendations = {
        approve: {
            title: 'Approve with Climate Modifications',
            description: 'Acceptable risk level with recommended climate-smart modifications.',
            details: [
                'Standard loan terms with flexible repayment option',
                'Optional weather-indexed insurance',
                'Annual climate risk review'
            ]
        },
        caution: {
            title: 'Approve with Enhanced Monitoring',
            description: 'Moderate climate risk. Enhanced oversight recommended.',
            details: [
                'Mandatory weather-indexed insurance',
                'Quarterly loan review during high-risk season',
                'Consider 20% reduced initial loan amount',
                'Climate resilience training required'
            ]
        },
        defer: {
            title: 'Defer - High Climate Risk',
            description: 'Significant climate exposure. Additional review required.',
            details: [
                'Request senior officer review',
                'Explore alternative loan structure',
                'Consider government subsidy programs',
                'Require comprehensive risk mitigation plan'
            ]
        }
    }

    recommendations.push({
        type,
        ...coreRecommendations[type]
    })

    // Product suggestions based on risk factors
    const products = []

    if (climateRisk.factors.flood.value > 0.4) {
        products.push({
            name: 'Flood Protection Insurance',
            description: 'Automatic payout on flood events exceeding 100mm/day',
            premium: '$15/month'
        })
    }

    if (climateRisk.factors.drought.value > 0.4) {
        products.push({
            name: 'Drought Relief Coverage',
            description: 'Payment deferral triggered by rainfall deficit',
            premium: '$12/month'
        })
    }

    if (loanPurpose === 'agriculture') {
        products.push({
            name: 'Crop Yield Insurance',
            description: 'Coverage for yield loss due to weather events',
            premium: '$20/month'
        })
    }

    // Always suggest flexible repayment
    products.push({
        name: 'Flexible Repayment Schedule',
        description: 'Grace period during monsoon/dry season',
        premium: 'Included'
    })

    // Training recommendation for high risk
    if (riskScore > 45) {
        products.push({
            name: 'Climate Resilience Training',
            description: 'Agricultural best practices for climate adaptation',
            premium: 'Free'
        })
    }

    return {
        recommendation: recommendations[0],
        products
    }
}

// Helper: Find nearest climate zone from demo data
function findNearestClimateZone(lat, lng) {
    let nearest = demoData.climateZones[0]
    let minDistance = Infinity

    for (const zone of demoData.climateZones) {
        const distance = Math.sqrt(
            Math.pow(zone.lat - lat, 2) + Math.pow(zone.lng - lng, 2)
        )
        if (distance < minDistance) {
            minDistance = distance
            nearest = zone
        }
    }

    return {
        region_name: nearest.region_name,
        country: nearest.country,
        flood_risk: nearest.flood_risk,
        drought_risk: nearest.drought_risk,
        heatwave_risk: nearest.heatwave_risk
    }
}

// Helper: Fetch from NASA POWER API (production)
async function fetchNasaPowerData(lat, lng) {
    // NASA POWER API for historical climate data
    // https://power.larc.nasa.gov/api/temporal/
    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?start=20200101&end=20231231&latitude=${lat}&longitude=${lng}&community=ag&parameters=PRECTOTCORR,T2M,T2M_MAX&format=json`

    try {
        const response = await axios.get(url, { timeout: 10000 })
        return response.data
    } catch (error) {
        console.error('NASA POWER API error:', error.message)
        return null
    }
}

// Helper: Fetch from OpenWeatherMap API (production)
async function fetchOpenWeatherData(lat, lng) {
    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) return null

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`

    try {
        const response = await axios.get(url, { timeout: 5000 })
        return response.data
    } catch (error) {
        console.error('OpenWeather API error:', error.message)
        return null
    }
}

/**
 * Get prediction from ML service
 * Falls back to local calculation if ML service is unavailable
 */
export async function getMLPrediction(climateData, loanData, clientData) {
    try {
        const response = await axios.post(`${ML_SERVICE_URL}/predict`, {
            location: {
                latitude: climateData.location?.lat || 0,
                longitude: climateData.location?.lng || 0
            },
            climate: {
                flood_risk: climateData.risks?.flood || 0.3,
                drought_risk: climateData.risks?.drought || 0.3,
                heatwave_risk: climateData.risks?.heatwave || 0.3
            },
            loan: {
                amount: loanData.amount,
                purpose: loanData.purpose,
                crop_type: loanData.cropType
            },
            client: {
                age: clientData.age || 35,
                existing_loans: clientData.existingLoans || 0,
                repayment_history: clientData.repaymentHistory || 95
            }
        }, { timeout: 5000 })

        console.log('ML Service prediction:', response.data)
        return {
            success: true,
            source: 'ml_service',
            prediction: response.data
        }
    } catch (error) {
        console.warn('ML Service unavailable, using local calculation:', error.message)
        return {
            success: false,
            source: 'local',
            error: error.message
        }
    }
}

export default {
    getClimateData,
    calculateClimateRiskScore,
    calculateDefaultProbability,
    generateRecommendations,
    getMLPrediction
}
