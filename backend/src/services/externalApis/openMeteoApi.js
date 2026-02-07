import axios from 'axios'
import NodeCache from 'node-cache'

// Cache climate data for 1 hour
const climateCache = new NodeCache({ stdTTL: 3600 })

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1'
const FLOOD_API_BASE = 'https://flood-api.open-meteo.com/v1'

/**
 * Get comprehensive climate data for a location
 * Includes: temperature, precipitation, drought indicators, heatwave days
 */
export async function getClimateData(lat, lng) {
    const cacheKey = `climate_${lat.toFixed(2)}_${lng.toFixed(2)}`
    const cached = climateCache.get(cacheKey)
    if (cached) return cached

    try {
        // Get current weather + forecast
        const forecastResponse = await axios.get(`${OPEN_METEO_BASE}/forecast`, {
            params: {
                latitude: lat,
                longitude: lng,
                daily: [
                    'temperature_2m_max',
                    'temperature_2m_min',
                    'precipitation_sum',
                    'precipitation_probability_max',
                    'rain_sum',
                    'et0_fao_evapotranspiration'
                ].join(','),
                past_days: 30,
                forecast_days: 14,
                timezone: 'auto'
            },
            timeout: 10000
        })

        const daily = forecastResponse.data.daily || {}

        // Calculate climate risk metrics
        const temps = daily.temperature_2m_max || []
        const precipSums = daily.precipitation_sum || []
        const precipProbs = daily.precipitation_probability_max || []

        // Heatwave calculation (days > 35°C in past 30 + forecast)
        const heatwaveDays = temps.filter(t => t > 35).length
        const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length || 25
        const maxTemp = Math.max(...temps) || 35

        // Drought indicators
        const totalPrecip = precipSums.reduce((a, b) => a + b, 0) || 0
        const avgPrecipProb = precipProbs.reduce((a, b) => a + b, 0) / precipProbs.length || 50

        // Precipitation variance (coefficient of variation)
        const precipMean = totalPrecip / precipSums.length
        const precipVariance = precipSums.reduce((sum, p) => sum + Math.pow(p - precipMean, 2), 0) / precipSums.length
        const precipCV = precipMean > 0 ? Math.sqrt(precipVariance) / precipMean : 1

        const result = {
            source: 'open-meteo',
            timestamp: new Date().toISOString(),
            location: { lat, lng },
            current: {
                avgTemperature: parseFloat(avgTemp.toFixed(1)),
                maxTemperature: parseFloat(maxTemp.toFixed(1)),
                totalPrecipitation: parseFloat(totalPrecip.toFixed(1)),
                avgPrecipProbability: parseFloat(avgPrecipProb.toFixed(0))
            },
            riskIndicators: {
                heatwaveDays,
                droughtIndex: calculateDroughtIndex(totalPrecip, avgTemp),
                precipVarianceCV: parseFloat(precipCV.toFixed(3)),
                extremeHeatRisk: heatwaveDays > 5 ? 'high' : heatwaveDays > 2 ? 'medium' : 'low'
            }
        }

        climateCache.set(cacheKey, result)
        return result

    } catch (error) {
        console.error('Open-Meteo climate error:', error.message)
        return getDefaultClimateData(lat, lng)
    }
}

/**
 * Get flood risk data from GloFAS via Open-Meteo
 */
export async function getFloodData(lat, lng) {
    const cacheKey = `flood_${lat.toFixed(2)}_${lng.toFixed(2)}`
    const cached = climateCache.get(cacheKey)
    if (cached) return cached

    try {
        const response = await axios.get(`${FLOOD_API_BASE}/flood`, {
            params: {
                latitude: lat,
                longitude: lng,
                daily: 'river_discharge',
                forecast_days: 7
            },
            timeout: 10000
        })

        const daily = response.data.daily || {}
        const discharges = daily.river_discharge || []

        // Calculate flood risk based on river discharge
        const maxDischarge = Math.max(...discharges) || 0
        const avgDischarge = discharges.reduce((a, b) => a + b, 0) / discharges.length || 0

        // Normalize to 0-1 risk scale (relative to typical values)
        // Higher discharge = higher flood risk
        const floodRisk = Math.min(1, maxDischarge / 1000) // Simplified scaling

        const result = {
            source: 'open-meteo-flood',
            timestamp: new Date().toISOString(),
            location: { lat, lng },
            riverDischarge: {
                max: parseFloat(maxDischarge.toFixed(2)),
                avg: parseFloat(avgDischarge.toFixed(2))
            },
            floodRisk: parseFloat(floodRisk.toFixed(3)),
            floodRiskLevel: floodRisk > 0.6 ? 'high' : floodRisk > 0.3 ? 'medium' : 'low'
        }

        climateCache.set(cacheKey, result)
        return result

    } catch (error) {
        console.error('Flood API error:', error.message)
        // Return moderate default if API fails
        return {
            source: 'default',
            floodRisk: 0.3,
            floodRiskLevel: 'medium',
            riverDischarge: { max: 0, avg: 0 }
        }
    }
}

/**
 * Get historical climate data for trend analysis
 */
export async function getHistoricalClimate(lat, lng, startDate, endDate) {
    try {
        const response = await axios.get(`${OPEN_METEO_BASE}/archive`, {
            params: {
                latitude: lat,
                longitude: lng,
                start_date: startDate,
                end_date: endDate,
                daily: 'temperature_2m_max,precipitation_sum',
                timezone: 'auto'
            },
            timeout: 15000
        })

        return response.data

    } catch (error) {
        console.error('Historical climate error:', error.message)
        return null
    }
}

/**
 * Calculate drought index based on precipitation and temperature
 * Returns 0-1 scale (higher = more drought risk)
 */
function calculateDroughtIndex(totalPrecip30Days, avgTemp) {
    // Simple Drought Severity Index
    // Low precip + high temp = high drought risk

    // Expected precipitation varies by region, using 50mm/month as baseline
    const precipDeficit = Math.max(0, 1 - (totalPrecip30Days / 50))

    // Temperature factor (higher temp increases evaporation)
    const tempFactor = avgTemp > 30 ? 1.3 : avgTemp > 25 ? 1.1 : 1.0

    const droughtIndex = Math.min(1, precipDeficit * tempFactor)
    return parseFloat(droughtIndex.toFixed(3))
}

/**
 * Default climate data for when API fails
 */
function getDefaultClimateData(lat, lng) {
    // Use latitude to estimate climate zone
    const absLat = Math.abs(lat)

    let baseTemp = 25
    let basePrecip = 100

    if (absLat < 15) {
        // Tropical
        baseTemp = 28
        basePrecip = 150
    } else if (absLat < 30) {
        // Subtropical
        baseTemp = 24
        basePrecip = 80
    } else if (absLat < 45) {
        // Temperate
        baseTemp = 18
        basePrecip = 70
    }

    return {
        source: 'default',
        timestamp: new Date().toISOString(),
        location: { lat, lng },
        current: {
            avgTemperature: baseTemp,
            maxTemperature: baseTemp + 8,
            totalPrecipitation: basePrecip,
            avgPrecipProbability: 40
        },
        riskIndicators: {
            heatwaveDays: 3,
            droughtIndex: 0.4,
            precipVarianceCV: 0.5,
            extremeHeatRisk: 'medium'
        }
    }
}

export default {
    getClimateData,
    getFloodData,
    getHistoricalClimate
}
