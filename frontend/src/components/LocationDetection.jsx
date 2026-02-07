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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4 pt-24">
            <div className="w-full max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        📍 Where is the loan applicant located?
                    </h1>
                    <p className="text-slate-300 text-lg">
                        Choose how you'd like to provide the location
                    </p>
                </div>

                {!location ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* GPS Detection Option */}
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                            <div className="flex flex-col items-center text-center gap-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                                    {loading && mode === 'gps' ? (
                                        <Loader2 className="w-10 h-10 text-white animate-spin" />
                                    ) : (
                                        <Navigation className="w-10 h-10 text-white animate-pulse" />
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Use GPS</h3>
                                    <p className="text-slate-300">
                                        Automatically detect current location
                                    </p>
                                </div>

                                <button
                                    onClick={handleGPSDetect}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-violet-400 hover:to-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-violet-500/50"
                                >
                                    {loading && mode === 'gps' ? 'Detecting...' : 'Detect Location'}
                                </button>

                                {error && mode === 'gps' && (
                                    <div className="flex items-center gap-2 text-red-400 text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Manual Search Option */}
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col items-center text-center gap-6">
                                    <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
                                        <Search className="w-10 h-10 text-white" />
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Enter Address</h3>
                                        <p className="text-slate-300">
                                            Search for village, city, or district
                                        </p>
                                    </div>
                                </div>

                                {/* Search Input */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Type to search..."
                                        className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                    {searchLoading && (
                                        <Loader2 className="absolute right-3 top-3 w-5 h-5 text-slate-400 animate-spin" />
                                    )}
                                </div>

                                {/* Suggestions Dropdown */}
                                {suggestions.length > 0 && (
                                    <div className="bg-white/10 border border-white/20 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                                        {suggestions.map((suggestion) => (
                                            <button
                                                key={suggestion.id}
                                                onClick={() => handleSelectAddress(suggestion)}
                                                className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-white font-medium text-sm">
                                                            {suggestion.formatted}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Location Confirmation Card */
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-2xl mx-auto">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Location Selected</h3>
                                <p className="text-slate-300">Please confirm this is correct</p>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-6 mb-6">
                            <div className="flex items-start gap-3 mb-4">
                                <MapPin className="w-6 h-6 text-teal-400 flex-shrink-0" />
                                <div>
                                    <p className="text-white font-medium text-lg mb-2">
                                        {location.formatted}
                                    </p>
                                    <p className="text-slate-400 text-sm">
                                        Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                                    </p>
                                    {location.accuracy && (
                                        <p className="text-slate-400 text-sm">
                                            Accuracy: ±{Math.round(location.accuracy)}m
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setLocation(null)
                                    setMode(null)
                                    setSearchQuery('')
                                    setError(null)
                                }}
                                className="flex-1 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
                            >
                                Change Location
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-400 hover:to-emerald-500 transition-all duration-300 shadow-lg hover:shadow-green-500/50"
                            >
                                Confirm & Continue
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
