/**
 * Static Data Service
 * Contains pre-loaded data that doesn't need real-time API calls:
 * - Fragile States Index (FSI) by country
 * - World Governance Indicators
 * - Seasonal risk multipliers by region
 * - Crop vulnerability matrices
 */

// Fragile States Index 2024 (source: fragilestatesindex.org)
// Scale: 0-120 (higher = more fragile)
const FRAGILE_STATES_INDEX = {
    // Very High Alert / High Alert
    YE: 111.7, SO: 110.9, SS: 109.4, SD: 107.2, CF: 105.8,
    CD: 105.5, SY: 105.2, AF: 102.9, MM: 99.6, HT: 98.1,
    ET: 95.6, ZW: 93.1, PK: 90.7, NG: 90.3, ML: 87.5,

    // Alert
    NE: 86.2, UG: 85.8, CM: 85.1, KE: 83.2, BD: 81.6,
    NP: 78.4, MZ: 78.1, TZ: 75.3, SN: 73.2, GH: 67.8,

    // Warning
    IN: 72.4, PH: 70.3, ID: 66.8, PE: 58.4, CO: 62.1,
    MX: 64.5, EG: 73.8, MA: 62.4, TN: 60.3,

    // Stable (lower risk)
    BR: 56.2, AR: 48.3, CL: 38.7, UY: 32.5, CR: 40.1
}

// Normalize FSI to 0-1 risk scale
export function getFSIRisk(countryCode) {
    const fsi = FRAGILE_STATES_INDEX[countryCode.toUpperCase()]
    if (fsi === undefined) return 0.5 // Default medium
    return parseFloat((fsi / 120).toFixed(3))
}

// World Governance Indicators - Political Stability Index
// Scale: -2.5 to 2.5 (lower = less stable)
const POLITICAL_STABILITY = {
    // Least stable
    YE: -2.8, SO: -2.5, SS: -2.4, AF: -2.3, SY: -2.2,
    SD: -2.1, CD: -2.0, ML: -1.8, HT: -1.7, MM: -1.6,
    PK: -1.5, NG: -1.3, ET: -1.2, KE: -0.8, BD: -0.9,

    // Moderately stable
    IN: -0.7, PH: -0.9, NP: -0.6, TZ: -0.4, UG: -0.5,
    GH: 0.0, SN: -0.2, PE: -0.4, CO: -0.6,

    // More stable
    BR: -0.2, MX: -0.4, ID: -0.3, MA: -0.2, TN: -0.4,
    AR: 0.1, CL: 0.5, UY: 0.9, CR: 0.6
}

// Normalize Political Stability to 0-1 risk scale (inverted)
export function getPoliticalStabilityRisk(countryCode) {
    const stability = POLITICAL_STABILITY[countryCode.toUpperCase()]
    if (stability === undefined) return 0.5
    // Convert from [-2.5, 2.5] to [0, 1] where lower stability = higher risk
    return parseFloat(((2.5 - stability) / 5).toFixed(3))
}

// Seasonal Risk Multipliers by Region/Country
const SEASONAL_RISK = {
    BD: { // Bangladesh - Monsoon
        name: 'Bangladesh Monsoon',
        peakMonths: [6, 7, 8, 9], // June-September
        peakMultiplier: 1.4,
        offseasonMultiplier: 1.0
    },
    KE: { // Kenya - Rainy seasons
        name: 'Kenya Rainy Seasons',
        peakMonths: [3, 4, 5, 10, 11], // March-May, Oct-Nov
        peakMultiplier: 1.3,
        offseasonMultiplier: 1.0
    },
    PE: { // Peru - Wet season
        name: 'Peru Wet Season',
        peakMonths: [12, 1, 2, 3], // Dec-March
        peakMultiplier: 1.25,
        offseasonMultiplier: 1.0
    },
    IN: { // India - Monsoon
        name: 'India Monsoon',
        peakMonths: [6, 7, 8, 9],
        peakMultiplier: 1.35,
        offseasonMultiplier: 1.0
    },
    PH: { // Philippines - Typhoon season
        name: 'Philippines Typhoon Season',
        peakMonths: [7, 8, 9, 10, 11],
        peakMultiplier: 1.4,
        offseasonMultiplier: 1.0
    },
    NG: { // Nigeria - Rainy season
        name: 'Nigeria Rainy Season',
        peakMonths: [4, 5, 6, 7, 8, 9],
        peakMultiplier: 1.25,
        offseasonMultiplier: 1.0
    },
    DEFAULT: {
        name: 'Default',
        peakMonths: [],
        peakMultiplier: 1.0,
        offseasonMultiplier: 1.0
    }
}

export function getSeasonalMultiplier(countryCode, month = null) {
    const currentMonth = month || (new Date().getMonth() + 1)
    const seasonal = SEASONAL_RISK[countryCode.toUpperCase()] || SEASONAL_RISK.DEFAULT

    const isPeakSeason = seasonal.peakMonths.includes(currentMonth)
    return {
        seasonName: seasonal.name,
        isPeakSeason,
        multiplier: isPeakSeason ? seasonal.peakMultiplier : seasonal.offseasonMultiplier
    }
}

// Crop Vulnerability Matrix
// Values represent vulnerability (0-1) to each hazard
const CROP_VULNERABILITY = {
    rice: {
        flood: 0.90, drought: 0.55, heatwave: 0.40,
        climateSensitivity: 'very-high'
    },
    wheat: {
        flood: 0.35, drought: 0.85, heatwave: 0.75,
        climateSensitivity: 'high'
    },
    maize: {
        flood: 0.50, drought: 0.90, heatwave: 0.70,
        climateSensitivity: 'high'
    },
    coffee: {
        flood: 0.45, drought: 0.65, heatwave: 0.95,
        climateSensitivity: 'very-high'
    },
    tea: {
        flood: 0.40, drought: 0.60, heatwave: 0.85,
        climateSensitivity: 'high'
    },
    cotton: {
        flood: 0.45, drought: 0.90, heatwave: 0.75,
        climateSensitivity: 'high'
    },
    sugarcane: {
        flood: 0.30, drought: 0.80, heatwave: 0.50,
        climateSensitivity: 'medium'
    },
    vegetables: {
        flood: 0.70, drought: 0.75, heatwave: 0.65,
        climateSensitivity: 'high'
    },
    fruits: {
        flood: 0.55, drought: 0.70, heatwave: 0.60,
        climateSensitivity: 'medium'
    },
    pulses: {
        flood: 0.45, drought: 0.85, heatwave: 0.60,
        climateSensitivity: 'high'
    },
    livestock: {
        flood: 0.35, drought: 0.70, heatwave: 0.80,
        climateSensitivity: 'medium'
    },
    poultry: {
        flood: 0.40, drought: 0.30, heatwave: 0.85,
        climateSensitivity: 'medium'
    },
    fishing: {
        flood: 0.60, drought: 0.75, heatwave: 0.55,
        climateSensitivity: 'very-high'
    }
}

export function getCropVulnerability(cropType) {
    const normalized = cropType?.toLowerCase().replace(/[^a-z]/g, '') || 'rice'
    return CROP_VULNERABILITY[normalized] || CROP_VULNERABILITY.rice
}

// Project Type Base Risk
const PROJECT_TYPE_RISK = {
    'agriculture-staple': { baseRisk: 0.55, climateDependency: 'very-high' },
    'agriculture-cash': { baseRisk: 0.50, climateDependency: 'high' },
    'livestock': { baseRisk: 0.45, climateDependency: 'high' },
    'fishing': { baseRisk: 0.50, climateDependency: 'very-high' },
    'retail': { baseRisk: 0.25, climateDependency: 'low' },
    'food-processing': { baseRisk: 0.35, climateDependency: 'medium' },
    'manufacturing': { baseRisk: 0.30, climateDependency: 'medium' },
    'services': { baseRisk: 0.20, climateDependency: 'low' },
    'transport': { baseRisk: 0.25, climateDependency: 'low' },
    'housing': { baseRisk: 0.40, climateDependency: 'medium' },
    'education': { baseRisk: 0.20, climateDependency: 'low' }
}

export function getProjectTypeRisk(projectType) {
    const normalized = projectType?.toLowerCase().replace(/\s+/g, '-') || 'agriculture-staple'
    return PROJECT_TYPE_RISK[normalized] || PROJECT_TYPE_RISK['agriculture-staple']
}

// Loan Type Risk Factors
const LOAN_TYPE_RISK = {
    'working-capital': 0.30,
    'equipment-purchase': 0.40,
    'land-acquisition': 0.50,
    'crop-inputs': 0.45,
    'livestock-purchase': 0.50,
    'construction': 0.55,
    'emergency': 0.60,
    'education': 0.25,
    'healthcare': 0.35
}

export function getLoanTypeRisk(loanType) {
    const normalized = loanType?.toLowerCase().replace(/\s+/g, '-') || 'working-capital'
    return LOAN_TYPE_RISK[normalized] || 0.40
}

// Collateral Type Risk
const COLLATERAL_RISK = {
    'land-title': 0.15,
    'savings-deposit': 0.20,
    'equipment': 0.40,
    'livestock': 0.35,
    'group-guarantee': 0.45,
    'personal-guarantee': 0.55,
    'none': 0.70
}

export function getCollateralRisk(collateralType) {
    const normalized = collateralType?.toLowerCase().replace(/\s+/g, '-') || 'none'
    return COLLATERAL_RISK[normalized] || 0.50
}

export default {
    getFSIRisk,
    getPoliticalStabilityRisk,
    getSeasonalMultiplier,
    getCropVulnerability,
    getProjectTypeRisk,
    getLoanTypeRisk,
    getCollateralRisk,
    FRAGILE_STATES_INDEX,
    CROP_VULNERABILITY,
    PROJECT_TYPE_RISK
}
