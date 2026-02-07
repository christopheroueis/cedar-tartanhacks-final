import axios from 'axios'
import NodeCache from 'node-cache'

// Cache economic data for 24 hours (doesn't change frequently)
const economicCache = new NodeCache({ stdTTL: 86400 })

const WORLD_BANK_BASE = 'https://api.worldbank.org/v2'

// Indicator codes from World Bank
const INDICATORS = {
    GDP_PER_CAPITA: 'NY.GDP.PCAP.CD',           // GDP per capita (current US$)
    INFLATION: 'FP.CPI.TOTL.ZG',                // Inflation, consumer prices (annual %)
    UNEMPLOYMENT: 'SL.UEM.TOTL.ZS',             // Unemployment, total (% of labor force)
    AGRICULTURE_GDP: 'NV.AGR.TOTL.ZS',          // Agriculture, value added (% of GDP)
    REMITTANCES: 'BX.TRF.PWKR.DT.GD.ZS',        // Personal remittances, received (% of GDP)
    ELECTRICITY_ACCESS: 'EG.ELC.ACCS.ZS',       // Access to electricity (% of population)
    MOBILE_SUBSCRIPTIONS: 'IT.CEL.SETS.P2',     // Mobile cellular subscriptions (per 100 people)
    RURAL_POPULATION: 'SP.RUR.TOTL.ZS',         // Rural population (% of total)
    POVERTY_HEADCOUNT: 'SI.POV.DDAY',           // Poverty headcount ratio at $2.15/day
    LIFE_EXPECTANCY: 'SP.DYN.LE00.IN'           // Life expectancy at birth
}

/**
 * Get all economic indicators for a country
 * @param {string} countryCode - ISO2 or ISO3 country code
 */
export async function getEconomicIndicators(countryCode) {
    const cacheKey = `econ_${countryCode.toUpperCase()}`
    const cached = economicCache.get(cacheKey)
    if (cached) return cached

    try {
        // Fetch all indicators in parallel
        const indicatorPromises = Object.entries(INDICATORS).map(async ([key, code]) => {
            try {
                const response = await axios.get(
                    `${WORLD_BANK_BASE}/country/${countryCode}/indicator/${code}`,
                    {
                        params: {
                            format: 'json',
                            per_page: 5,  // Get last 5 years
                            date: '2018:2024'
                        },
                        timeout: 10000
                    }
                )

                // World Bank API returns [metadata, data]
                const data = response.data?.[1]
                if (data && data.length > 0) {
                    // Get most recent non-null value
                    const latest = data.find(d => d.value !== null)
                    return {
                        key,
                        value: latest?.value,
                        year: latest?.date,
                        indicator: code
                    }
                }
                return { key, value: null, year: null, indicator: code }

            } catch (error) {
                return { key, value: null, year: null, indicator: code }
            }
        })

        const results = await Promise.all(indicatorPromises)

        // Build structured response
        const indicators = {}
        results.forEach(r => {
            indicators[r.key] = {
                value: r.value,
                year: r.year
            }
        })

        const result = {
            source: 'world-bank',
            timestamp: new Date().toISOString(),
            countryCode: countryCode.toUpperCase(),
            indicators,
            riskScores: calculateEconomicRiskScores(indicators)
        }

        economicCache.set(cacheKey, result)
        return result

    } catch (error) {
        console.error('World Bank API error:', error.message)
        return getDefaultEconomicData(countryCode)
    }
}

/**
 * Calculate risk scores from economic indicators
 * Returns 0-1 scale for each (higher = more risk)
 */
function calculateEconomicRiskScores(indicators) {
    const scores = {}

    // GDP per capita risk (lower GDP = higher risk)
    const gdp = indicators.GDP_PER_CAPITA?.value
    if (gdp !== null && gdp !== undefined) {
        if (gdp < 1500) scores.gdpRisk = 0.8
        else if (gdp < 3000) scores.gdpRisk = 0.6
        else if (gdp < 5000) scores.gdpRisk = 0.45
        else if (gdp < 10000) scores.gdpRisk = 0.3
        else scores.gdpRisk = 0.15
    } else {
        scores.gdpRisk = 0.5 // Default medium
    }

    // Inflation risk (higher inflation = higher risk)
    const inflation = indicators.INFLATION?.value
    if (inflation !== null && inflation !== undefined) {
        if (inflation > 15) scores.inflationRisk = 0.85
        else if (inflation > 10) scores.inflationRisk = 0.65
        else if (inflation > 5) scores.inflationRisk = 0.4
        else if (inflation > 2) scores.inflationRisk = 0.2
        else scores.inflationRisk = 0.1
    } else {
        scores.inflationRisk = 0.4
    }

    // Unemployment risk
    const unemployment = indicators.UNEMPLOYMENT?.value
    if (unemployment !== null && unemployment !== undefined) {
        if (unemployment > 20) scores.unemploymentRisk = 0.8
        else if (unemployment > 10) scores.unemploymentRisk = 0.6
        else if (unemployment > 5) scores.unemploymentRisk = 0.35
        else scores.unemploymentRisk = 0.15
    } else {
        scores.unemploymentRisk = 0.4
    }

    // Agriculture dependency risk (higher % = more climate exposure)
    const agriGdp = indicators.AGRICULTURE_GDP?.value
    if (agriGdp !== null && agriGdp !== undefined) {
        if (agriGdp > 30) scores.agricultureRisk = 0.8
        else if (agriGdp > 20) scores.agricultureRisk = 0.6
        else if (agriGdp > 10) scores.agricultureRisk = 0.4
        else scores.agricultureRisk = 0.2
    } else {
        scores.agricultureRisk = 0.5
    }

    // Remittance dependency (can be good/bad - moderate values best)
    const remittances = indicators.REMITTANCES?.value
    if (remittances !== null && remittances !== undefined) {
        // High remittance dependency means external income but also vulnerability
        if (remittances > 20) scores.remittanceRisk = 0.6
        else if (remittances > 10) scores.remittanceRisk = 0.4
        else if (remittances > 5) scores.remittanceRisk = 0.3
        else scores.remittanceRisk = 0.5 // Very low can mean less diversification
    } else {
        scores.remittanceRisk = 0.4
    }

    return scores
}

/**
 * Get infrastructure indicators for a country
 */
export async function getInfrastructureData(countryCode) {
    const cacheKey = `infra_${countryCode.toUpperCase()}`
    const cached = economicCache.get(cacheKey)
    if (cached) return cached

    try {
        const infraIndicators = {
            ELECTRICITY: 'EG.ELC.ACCS.ZS',
            INTERNET: 'IT.NET.USER.ZS',
            MOBILE: 'IT.CEL.SETS.P2',
            ROADS: 'IS.ROD.PAVE.ZS'  // Paved roads (% of total roads)
        }

        const promises = Object.entries(infraIndicators).map(async ([key, code]) => {
            try {
                const response = await axios.get(
                    `${WORLD_BANK_BASE}/country/${countryCode}/indicator/${code}`,
                    {
                        params: { format: 'json', per_page: 3, date: '2018:2024' },
                        timeout: 10000
                    }
                )
                const data = response.data?.[1]
                const latest = data?.find(d => d.value !== null)
                return { key, value: latest?.value }
            } catch {
                return { key, value: null }
            }
        })

        const results = await Promise.all(promises)
        const data = {}
        results.forEach(r => { data[r.key] = r.value })

        const result = {
            source: 'world-bank',
            countryCode: countryCode.toUpperCase(),
            electricity: data.ELECTRICITY,
            internet: data.INTERNET,
            mobile: data.MOBILE,
            roads: data.ROADS,
            riskScore: calculateInfrastructureRisk(data)
        }

        economicCache.set(cacheKey, result)
        return result

    } catch (error) {
        console.error('Infrastructure data error:', error.message)
        return { source: 'default', riskScore: 0.5 }
    }
}

/**
 * Calculate infrastructure risk score
 */
function calculateInfrastructureRisk(data) {
    let score = 0
    let count = 0

    if (data.ELECTRICITY !== null) {
        score += (100 - data.ELECTRICITY) / 100
        count++
    }
    if (data.INTERNET !== null) {
        score += (100 - data.INTERNET) / 100
        count++
    }
    if (data.MOBILE !== null) {
        // Mobile per 100 people, normalize to %
        score += Math.max(0, (100 - data.MOBILE) / 100)
        count++
    }
    if (data.ROADS !== null) {
        score += (100 - data.ROADS) / 100
        count++
    }

    return count > 0 ? parseFloat((score / count).toFixed(3)) : 0.5
}

/**
 * Default economic data when API fails
 */
function getDefaultEconomicData(countryCode) {
    // Provide reasonable defaults for common microfinance countries
    const defaults = {
        BD: { gdp: 2500, inflation: 6, unemployment: 5, agriGdp: 12 },   // Bangladesh
        KE: { gdp: 2100, inflation: 7, unemployment: 6, agriGdp: 22 },   // Kenya
        PE: { gdp: 6600, inflation: 4, unemployment: 7, agriGdp: 8 },    // Peru
        IN: { gdp: 2400, inflation: 5, unemployment: 8, agriGdp: 16 },   // India
        PH: { gdp: 3600, inflation: 6, unemployment: 5, agriGdp: 10 },   // Philippines
        NG: { gdp: 2200, inflation: 18, unemployment: 33, agriGdp: 24 }, // Nigeria
        DEFAULT: { gdp: 3000, inflation: 6, unemployment: 8, agriGdp: 15 }
    }

    const d = defaults[countryCode.toUpperCase()] || defaults.DEFAULT

    return {
        source: 'default',
        countryCode,
        indicators: {
            GDP_PER_CAPITA: { value: d.gdp, year: '2023' },
            INFLATION: { value: d.inflation, year: '2023' },
            UNEMPLOYMENT: { value: d.unemployment, year: '2023' },
            AGRICULTURE_GDP: { value: d.agriGdp, year: '2023' }
        },
        riskScores: {
            gdpRisk: d.gdp < 3000 ? 0.6 : 0.4,
            inflationRisk: d.inflation > 10 ? 0.7 : 0.4,
            unemploymentRisk: d.unemployment > 10 ? 0.6 : 0.35,
            agricultureRisk: d.agriGdp > 15 ? 0.55 : 0.35
        }
    }
}

export default {
    getEconomicIndicators,
    getInfrastructureData
}
