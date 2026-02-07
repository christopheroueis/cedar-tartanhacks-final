import axios from 'axios'
import NodeCache from 'node-cache'

// Cache geocoding results for 24 hours
const geoCache = new NodeCache({ stdTTL: 86400 })

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

/**
 * Generate a universal location_id from coordinates
 * Format: {country_code}_{admin1}_{lat}_{lng}
 * Example: BD_SYL_24.89_91.87
 */
export function generateLocationId(countryCode, admin1, lat, lng) {
    const adminCode = admin1
        ? admin1.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '')
        : 'UNK'
    const latRound = parseFloat(lat).toFixed(2)
    const lngRound = parseFloat(lng).toFixed(2)
    return `${countryCode.toUpperCase()}_${adminCode}_${latRound}_${lngRound}`
}

/**
 * Reverse geocode coordinates to get location details
 * Uses Nominatim (OpenStreetMap) - free, no API key required
 */
export async function reverseGeocode(lat, lng) {
    const cacheKey = `geo_${lat}_${lng}`
    const cached = geoCache.get(cacheKey)
    if (cached) return cached

    try {
        const response = await axios.get(`${NOMINATIM_BASE}/reverse`, {
            params: {
                lat,
                lon: lng,
                format: 'json',
                addressdetails: 1,
                'accept-language': 'en'
            },
            headers: {
                'User-Agent': 'ClimateCredit/1.0 (climate-informed lending platform)'
            },
            timeout: 10000
        })

        const data = response.data
        const address = data.address || {}

        const result = {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            displayName: data.display_name,
            country: address.country || 'Unknown',
            countryCode: (address.country_code || 'XX').toUpperCase(),
            admin1: address.state || address.region || address.province || '',
            admin2: address.county || address.district || '',
            city: address.city || address.town || address.village || address.hamlet || '',
            locationId: null // Will be set below
        }

        result.locationId = generateLocationId(
            result.countryCode,
            result.admin1,
            lat,
            lng
        )

        geoCache.set(cacheKey, result)
        return result

    } catch (error) {
        console.error('Geocoding error:', error.message)
        // Return basic fallback
        return {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            displayName: `${lat}, ${lng}`,
            country: 'Unknown',
            countryCode: 'XX',
            admin1: '',
            admin2: '',
            city: '',
            locationId: generateLocationId('XX', 'UNK', lat, lng)
        }
    }
}

/**
 * Forward geocode an address to coordinates
 * Uses Nominatim (OpenStreetMap) - free, no API key required
 */
export async function forwardGeocode(address) {
    const cacheKey = `addr_${address.toLowerCase().replace(/\s+/g, '_')}`
    const cached = geoCache.get(cacheKey)
    if (cached) return cached

    try {
        const response = await axios.get(`${NOMINATIM_BASE}/search`, {
            params: {
                q: address,
                format: 'json',
                addressdetails: 1,
                limit: 1,
                'accept-language': 'en'
            },
            headers: {
                'User-Agent': 'ClimateCredit/1.0 (climate-informed lending platform)'
            },
            timeout: 10000
        })

        if (!response.data || response.data.length === 0) {
            throw new Error('Address not found')
        }

        const data = response.data[0]
        const addressDetails = data.address || {}

        const result = {
            lat: parseFloat(data.lat),
            lng: parseFloat(data.lon),
            displayName: data.display_name,
            country: addressDetails.country || 'Unknown',
            countryCode: (addressDetails.country_code || 'XX').toUpperCase(),
            admin1: addressDetails.state || addressDetails.region || addressDetails.province || '',
            admin2: addressDetails.county || addressDetails.district || '',
            city: addressDetails.city || addressDetails.town || addressDetails.village || '',
            locationId: null
        }

        result.locationId = generateLocationId(
            result.countryCode,
            result.admin1,
            result.lat,
            result.lng
        )

        geoCache.set(cacheKey, result)
        return result

    } catch (error) {
        console.error('Forward geocoding error:', error.message)
        throw new Error(`Could not geocode address: ${error.message}`)
    }
}

/**
 * Get country ISO code for a location
 */
export async function getCountryCode(lat, lng) {
    const location = await reverseGeocode(lat, lng)
    return location.countryCode
}

export default {
    generateLocationId,
    reverseGeocode,
    forwardGeocode,
    getCountryCode
}
