import React, { useState, useEffect } from 'react'
import { MapPin, Search, Loader2, CheckCircle, AlertCircle, Navigation } from 'lucide-react'
import { detectGPS, reverseGeocode, searchAddress } from '../services/locationService'

export default function LocationDetection({ onLocationConfirmed }) {
    const [mode, setMode] = useState(null) // 'gps' | 'manual' | null
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [location, setLocation] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [searchLoading, setSearchLoading] = useState(false)

    // Handle GPS detection
    const handleGPSDetect = async () => {
        setMode('gps')
        setLoading(true)
        setError(null)

        try {
            const coords = await detectGPS()
            const address = await reverseGeocode(coords.lat, coords.lng)

            setLocation({
                ...address,
                method: 'gps',
                accuracy: coords.accuracy
            })
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Handle manual address search
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 3) {
            setSuggestions([])
            return
        }

        const timeoutId = setTimeout(async () => {
            setSearchLoading(true)
            try {
                const results = await searchAddress(searchQuery)
                setSuggestions(results)
            } catch (err) {
                console.error('Search error:', err)
            } finally {
                setSearchLoading(false)
            }
        }, 500) // Debounce

        return () => clearTimeout(timeoutId)
    }, [searchQuery])

    const handleSelectAddress = (address) => {
        setLocation({
            ...address,
            method: 'manual'
        })
        setSuggestions([])
        setSearchQuery(address.formatted)
        setMode('manual')
    }

    const handleConfirm = () => {
        if (location) {
            onLocationConfirmed(location)
        }
    }

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 pt-24">
            <div className="w-full max-w-4xl">
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-semibold text-white mb-2">
                        Where is the loan applicant located?
                    </h1>
                    <p className="text-slate-400">
                        Choose how you'd like to provide the location
                    </p>
                </div>

                {!location ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="card-cedar p-8">
                            <div className="flex flex-col items-center text-center gap-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-[#0A4D3C] to-[#14B8A6] rounded-full flex items-center justify-center shadow-lg shadow-[#0A4D3C]/30">
                                    {loading && mode === 'gps' ? (
                                        <Loader2 className="w-10 h-10 text-white animate-spin" />
                                    ) : (
                                        <Navigation className="w-10 h-10 text-white" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Use GPS</h3>
                                    <p className="text-slate-400">Automatically detect current location</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleGPSDetect}
                                    disabled={loading}
                                    className="btn-primary w-full"
                                >
                                    {loading && mode === 'gps' ? 'Detecting...' : 'Detect location'}
                                </button>

                                {error && mode === 'gps' && (
                                    <div className="flex items-center gap-2 text-red-400 text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card-cedar p-8">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="w-20 h-20 bg-[#0EA5E9]/20 border border-[#0EA5E9]/40 rounded-full flex items-center justify-center">
                                        <Search className="w-10 h-10 text-[#0EA5E9]" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-2">Enter address</h3>
                                        <p className="text-slate-400">Search for village, city, or district</p>
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
                                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 animate-spin" />
                                    )}
                                </div>
                                {suggestions.length > 0 && (
                                    <div className="border border-white/10 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                                        {suggestions.map((suggestion) => (
                                            <button
                                                key={suggestion.id}
                                                type="button"
                                                onClick={() => handleSelectAddress(suggestion)}
                                                className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="w-5 h-5 text-[#14B8A6] flex-shrink-0 mt-0.5" />
                                                    <p className="text-white font-medium text-sm">{suggestion.formatted}</p>
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
                            <div className="w-14 h-14 bg-[#10B981] rounded-full flex items-center justify-center">
                                <CheckCircle className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">Location selected</h3>
                                <p className="text-slate-400 text-sm">Please confirm this is correct</p>
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-5 mb-6">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-[#14B8A6] flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-white font-medium mb-1">{location.formatted}</p>
                                    <p className="text-slate-400 text-sm">
                                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                                    </p>
                                    {location.accuracy && (
                                        <p className="text-slate-400 text-sm">Accuracy: ±{Math.round(location.accuracy)}m</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => { setLocation(null); setMode(null); setSearchQuery(''); setError(null); }}
                                className="btn-secondary flex-1"
                            >
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
