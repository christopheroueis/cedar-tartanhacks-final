/**
 * Location Service
 * Handles GPS detection, address search, and geocoding
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'
const GEOCODE_API = '/api/v2/geocode'

// Rate limiting for Nominatim (max 1 req/sec)
let lastRequestTime = 0
const MIN_DELAY = 1000

async function rateLimitedFetch(url) {
    const now = Date.now()
    const timeSinceLastRequest = now - lastRequestTime

    if (timeSinceLastRequest < MIN_DELAY) {
        await new Promise(resolve => setTimeout(resolve, MIN_DELAY - timeSinceLastRequest))
    }

    lastRequestTime = Date.now()
    return fetch(url)
}

/**
 * Get user's current location via browser geolocation
 */
export async function detectGPS() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported by browser'))
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                })
            },
            (error) => {
                let message = 'Unable to get location'
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location permission denied'
                        break
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location unavailable'
                        break
                    case error.TIMEOUT:
                        message = 'Location request timed out'
                        break
                }
                reject(new Error(message))
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        )
    })
}

/**
 * Reverse geocode coordinates to address
 */
export async function reverseGeocode(lat, lng) {
    try {
        const url = `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
        const response = await rateLimitedFetch(url)

        if (!response.ok) {
            throw new Error('Reverse geocoding failed')
        }

        const data = await response.json()

        return {
            formatted: data.display_name,
            address: data.address,
            lat: parseFloat(data.lat),
            lng: parseFloat(data.lon),
            place_id: data.place_id
        }
    } catch (error) {
        console.error('Reverse geocode error:', error)
        throw error
    }
}

/**
 * Search for addresses matching query
 */
export async function searchAddress(query) {
    if (!query || query.trim().length < 3) {
        return []
    }

    try {
        const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`
        const response = await rateLimitedFetch(url)

        if (!response.ok) {
            throw new Error('Address search failed')
        }

        const data = await response.json()

        return data.map(item => ({
            id: item.place_id,
            formatted: item.display_name,
            address: item.address,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            type: item.type,
            importance: item.importance
        }))
    } catch (error) {
        console.error('Address search error:', error)
        throw error
    }
}

/**
 * Validate and format location for backend
 */
export function formatLocationForBackend(location) {
    return {
        latitude: location.lat,
        longitude: location.lng,
        address: location.formatted || location.address,
        detectionMethod: location.method || 'manual'
    }
}

/**
 * Use backend geocoding service as fallback
 */
export async function geocodeViaBackend(address) {
    try {
        const response = await fetch(GEOCODE_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address })
        })

        if (!response.ok) {
            throw new Error('Backend geocoding failed')
        }

        const data = await response.json()
        return {
            lat: data.latitude,
            lng: data.longitude,
            formatted: data.display_name || address,
            address: data.address
        }
    } catch (error) {
        console.error('Backend geocode error:', error)
        throw error
    }
}

export default {
    detectGPS,
    reverseGeocode,
    searchAddress,
    formatLocationForBackend,
    geocodeViaBackend
}
