import React, { useState, useEffect } from 'react'
import { MapPin, Search, Loader2, CheckCircle, AlertCircle, Navigation } from 'lucide-react'
import { detectGPS, reverseGeocode, searchAddress } from '../services/locationService'

export default function LocationDetection({ onLocationConfirmed }) {
    const [mode, setMode] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [location, setLocation] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [searchLoading, setSearchLoading] = useState(false)

    const handleGPSDetect = async () => {
        setMode('gps')
        setLoading(true)
        setError(null)
        try {
            const coords = await detectGPS()
            const address = await reverseGeocode(coords.lat, coords.lng)
            setLocation({ ...address, method: 'gps', accuracy: coords.accuracy })
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!searchQuery || searchQuery.length < 3) { setSuggestions([]); return }
        const timeoutId = setTimeout(async () => {
            setSearchLoading(true)
            try {
                const results = await searchAddress(searchQuery)
                setSuggestions(results)
            } catch (err) { console.error('Search error:', err) }
            finally { setSearchLoading(false) }
        }, 500)
        return () => clearTimeout(timeoutId)
    }, [searchQuery])

    const handleSelectAddress = (address) => {
        setLocation({ ...address, method: 'manual' })
        setSuggestions([])
        setSearchQuery(address.formatted)
        setMode('manual')
    }

    const handleConfirm = () => { if (location) onLocationConfirmed(location) }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 pt-24" style={{ background: '#F7F5F0' }}>
            <div className="w-full max-w-4xl">
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'var(--font-display)', color: '#1A1A18' }}>
                        Where is the loan applicant located?
                    </h1>
                    <p style={{ color: '#6B6B5A' }}>
                        Choose how you'd like to provide the location
                    </p>
                </div>

                {!location ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* GPS */}
                        <div className="card-cedar p-8">
                            <div className="flex flex-col items-center text-center gap-6">
                                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(13,115,119,0.1)' }}>
                                    {loading && mode === 'gps' ? (
                                        <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#0D7377' }} />
                                    ) : (
                                        <Navigation className="w-10 h-10" style={{ color: '#0D7377' }} />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2" style={{ color: '#1A1A18' }}>Automatically detect current location</h3>
                                </div>
                                <button type="button" onClick={handleGPSDetect} disabled={loading} className="btn-primary w-full">
                                    {loading && mode === 'gps' ? 'Detecting...' : 'Detect location'}
                                </button>
                                {error && mode === 'gps' && (
                                    <div className="flex items-center gap-2 text-sm" style={{ color: '#C0392B' }}>
                                        <AlertCircle className="w-4 h-4" /><span>{error}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Manual */}
                        <div className="card-cedar p-8">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(13,115,119,0.06)', border: '1px solid rgba(13,115,119,0.15)' }}>
                                        <Search className="w-10 h-10" style={{ color: '#0D7377' }} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2" style={{ color: '#1A1A18' }}>Search for village, city, or district</h3>
                                    </div>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Type to search..."
                                        className="input-cedar pr-10"
                                    />
                                    {searchLoading && (
                                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin" style={{ color: '#9B9B8A' }} />
                                    )}
                                </div>
                                {suggestions.length > 0 && (
                                    <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto" style={{ borderColor: '#E0D9CF' }}>
                                        {suggestions.map((suggestion) => (
                                            <button
                                                key={suggestion.id}
                                                type="button"
                                                onClick={() => handleSelectAddress(suggestion)}
                                                className="w-full text-left px-4 py-3 transition-colors last:border-b-0"
                                                style={{ borderBottom: '1px solid #F0EBE2' }}
                                                onMouseEnter={e => e.target.style.background = '#FAF8F5'}
                                                onMouseLeave={e => e.target.style.background = 'transparent'}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#0D7377' }} />
                                                    <p className="font-medium text-sm" style={{ color: '#1A1A18' }}>{suggestion.formatted}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="card-cedar p-8 max-w-2xl mx-auto">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(39,174,96,0.1)' }}>
                                <CheckCircle className="w-7 h-7" style={{ color: '#27AE60' }} />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold" style={{ color: '#1A1A18' }}>Location selected</h3>
                                <p className="text-sm" style={{ color: '#6B6B5A' }}>Please confirm this is correct</p>
                            </div>
                        </div>
                        <div className="rounded-lg p-5 mb-6" style={{ background: '#FAF8F5', border: '1px solid #E0D9CF' }}>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#0D7377' }} />
                                <div>
                                    <p className="font-medium mb-1" style={{ color: '#1A1A18' }}>{location.formatted}</p>
                                    <p className="text-sm" style={{ color: '#6B6B5A', fontFamily: 'var(--font-mono)' }}>
                                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                                    </p>
                                    {location.accuracy && (
                                        <p className="text-sm" style={{ color: '#9B9B8A', fontFamily: 'var(--font-mono)' }}>Accuracy: ±{Math.round(location.accuracy)}m</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => { setLocation(null); setMode(null); setSearchQuery(''); setError(null) }} className="btn-secondary flex-1">
                                Change location
                            </button>
                            <button type="button" onClick={handleConfirm} className="btn-primary flex-1">
                                Confirm & continue
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
