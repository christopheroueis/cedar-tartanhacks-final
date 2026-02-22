/**
 * Climate Data Service
 * Fetches environmental data from free APIs for pre-filling the assessment form.
 * Each function includes a demo fallback for when APIs are unavailable.
 */

const OPEN_ELEVATION = 'https://api.open-elevation.com/api/v1/lookup'
const OPEN_METEO = 'https://api.open-meteo.com/v1/forecast'

/**
 * Fetch elevation from Open-Elevation API
 */
export async function fetchElevation(lat, lng) {
    try {
        const res = await fetch(`${OPEN_ELEVATION}?locations=${lat},${lng}`)
        const data = await res.json()
        const elev = data?.results?.[0]?.elevation
        if (elev !== undefined) {
            return { value: Math.round(elev), unit: 'm', source: 'Open-Elevation', lastUpdated: new Date().toISOString() }
        }
        throw new Error('No elevation data')
    } catch {
        // Demo fallback based on latitude
        const demoElev = Math.abs(lat) < 10 ? 42 : Math.abs(lat) < 30 ? 18 : 1200
        return { value: demoElev, unit: 'm', source: 'estimate', lastUpdated: new Date().toISOString() }
    }
}

/**
 * Fetch current rainfall from Open-Meteo API
 */
export async function fetchRainfall(lat, lng) {
    try {
        const res = await fetch(`${OPEN_METEO}?latitude=${lat}&longitude=${lng}&daily=precipitation_sum&timezone=auto&past_days=30&forecast_days=0`)
        const data = await res.json()
        const precip = data?.daily?.precipitation_sum || []
        const avgMonthly = precip.reduce((a, b) => a + b, 0)
        return { value: Math.round(avgMonthly), unit: 'mm/month', source: 'Open-Meteo', lastUpdated: new Date().toISOString() }
    } catch {
        return { value: 185, unit: 'mm/month', source: 'estimate', lastUpdated: new Date().toISOString() }
    }
}

/**
 * Fetch flood & drought risk (from backend or demo)
 */
export async function fetchFloodDroughtRisk(lat, lng) {
    try {
        const API_BASE = import.meta.env.VITE_API_URL || ''
        const res = await fetch(`${API_BASE}/api/climate-data/${lat}/${lng}`)
        if (!res.ok) throw new Error('API unavailable')
        const data = await res.json()
        return {
            floodRisk: { value: data.flood_risk ?? 0.45, source: 'Cedar API', lastUpdated: new Date().toISOString() },
            droughtIndex: { value: data.drought_risk ?? 0.30, source: 'Cedar API', lastUpdated: new Date().toISOString() }
        }
    } catch {
        // Latitude-based demo estimates
        const floodBase = lat > 20 && lat < 30 ? 0.65 : lat < 0 ? 0.35 : 0.45
        const droughtBase = lat > 20 && lat < 30 ? 0.25 : lat < 0 ? 0.55 : 0.40
        return {
            floodRisk: { value: parseFloat(floodBase.toFixed(2)), source: 'estimate', lastUpdated: new Date().toISOString() },
            droughtIndex: { value: parseFloat(droughtBase.toFixed(2)), source: 'estimate', lastUpdated: new Date().toISOString() }
        }
    }
}

/**
 * Fetch soil type (demo — SoilGrids requires complex queries)
 */
export async function fetchSoilType(lat, lng) {
    // Latitude-based classification
    let soilType = 'Loam'
    if (lat > 20 && lat < 30) soilType = 'Alluvial Clay'
    else if (lat > -5 && lat < 5) soilType = 'Laterite'
    else if (lat < -10) soilType = 'Andisol'
    else if (lat > 30) soilType = 'Chernozem'

    return { value: soilType, source: 'SoilGrids (est.)', lastUpdated: new Date().toISOString() }
}

/**
 * Fetch land use classification (demo)
 */
export async function fetchLandUse(lat, lng) {
    let landUse = 'Cropland'
    if (lng > 90 && lat > 20) landUse = 'Rice Paddy / Wetland'
    else if (lat < -10) landUse = 'Highland Agriculture'
    else if (lat > -5 && lat < 5) landUse = 'Tropical Mixed'

    return { value: landUse, source: 'ESA WorldCover (est.)', lastUpdated: new Date().toISOString() }
}

/**
 * Fetch all climate data in parallel
 */
export async function fetchAllClimateData(lat, lng) {
    const [elevation, rainfall, floodDrought, soilType, landUse] = await Promise.allSettled([
        fetchElevation(lat, lng),
        fetchRainfall(lat, lng),
        fetchFloodDroughtRisk(lat, lng),
        fetchSoilType(lat, lng),
        fetchLandUse(lat, lng)
    ])

    return {
        elevation: elevation.status === 'fulfilled' ? elevation.value : null,
        rainfall: rainfall.status === 'fulfilled' ? rainfall.value : null,
        floodRisk: floodDrought.status === 'fulfilled' ? floodDrought.value.floodRisk : null,
        droughtIndex: floodDrought.status === 'fulfilled' ? floodDrought.value.droughtIndex : null,
        soilType: soilType.status === 'fulfilled' ? soilType.value : null,
        landUse: landUse.status === 'fulfilled' ? landUse.value : null
    }
}

export default {
    fetchElevation,
    fetchRainfall,
    fetchFloodDroughtRisk,
    fetchSoilType,
    fetchLandUse,
    fetchAllClimateData
}
