import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { assessmentsAPI } from '../services/api'
import { detectGPS, reverseGeocode, searchAddress } from '../services/locationService'
import { fetchAllClimateData } from '../services/climateDataService'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MapPin, Cloud, Layers, DollarSign, User, ChevronDown, ChevronRight,
    Loader2, Navigation, Sparkles, Check, PenLine, Search, ChevronLeft,
    Building2, FileText, Shield, TrendingUp
} from 'lucide-react'
import LoadingAnimation from '../components/LoadingAnimation'

// ─── Analyzing messages (post-submit 6-sec screen) ───────────────────────────

const analyzingMessages = [
    { icon: Cloud, text: 'Aggregating regional climate data…', duration: 1000 },
    { icon: TrendingUp, text: 'Running flood and wildfire simulations…', duration: 1000 },
    { icon: Layers, text: 'Calculating composite land risk score…', duration: 1000 },
    { icon: Shield, text: 'Cross-referencing insurance exposure…', duration: 1000 },
    { icon: Sparkles, text: 'Generating mitigation insights…', duration: 1000 },
    { icon: Check, text: 'Finalizing recommendation profile…', duration: 1000 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso) {
    if (!iso) return ''
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

function OptLabel({ children }) {
    return (
        <span className="label-instrument">
            {children}{' '}
            <span style={{ color: '#C8BFB0', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '0.65rem' }}>(opt)</span>
        </span>
    )
}

// ─── Collapsible Section ──────────────────────────────────────────────────────

function Section({ id, label, icon: Icon, children, isComplete, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className="card-cedar p-0 overflow-hidden mb-4">
            <div className="section-header" onClick={() => setOpen(!open)}>
                <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" style={{ color: '#0D7377' }} />
                    <span className="section-header-label">{id} · {label}</span>
                </div>
                <div className="flex items-center gap-2">
                    {isComplete && <div className="section-check">✓</div>}
                    {open ? <ChevronDown className="w-3.5 h-3.5" style={{ color: '#9B9B8A' }} /> : <ChevronRight className="w-3.5 h-3.5" style={{ color: '#9B9B8A' }} />}
                </div>
            </div>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="p-5 space-y-4">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ─── Smart Field ──────────────────────────────────────────────────────────────

function SmartField({ label, value, onChange, autoDetected, source, lastUpdated, type = 'text', placeholder, required, min, max, step, prefix, optional }) {
    const [editing, setEditing] = useState(false)
    const isAuto = autoDetected && !editing

    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                {optional ? <OptLabel>{label}</OptLabel> : <span className="label-instrument">{label}</span>}
                {isAuto && <span className="auto-detected-badge">AUTO-DETECTED</span>}
                {lastUpdated && !editing && (
                    <span className="freshness-tag">{source} · {timeAgo(lastUpdated)}</span>
                )}
            </div>
            <div className={`relative ${isAuto ? 'auto-detected-field' : ''} ${editing ? 'auto-detected-field editing' : ''}`} style={isAuto || editing ? { padding: 0 } : {}}>
                {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#9B9B8A', zIndex: 1 }}>{prefix}</span>}
                <input
                    type={type}
                    value={value ?? ''}
                    onChange={onChange}
                    onFocus={() => { if (autoDetected) setEditing(true) }}
                    placeholder={placeholder}
                    required={required}
                    min={min}
                    max={max}
                    step={step}
                    className="input-cedar text-sm"
                    style={{
                        ...(prefix ? { paddingLeft: '2rem' } : {}),
                        ...(isAuto ? { background: 'transparent', border: 'none' } : {}),
                    }}
                />
            </div>
        </div>
    )
}

function SkeletonField({ label }) {
    return (
        <div>
            <span className="label-instrument block mb-1.5">{label}</span>
            <div className="skeleton-cedar h-10 w-full rounded-md" />
        </div>
    )
}

function YesNoToggle({ value, onChange }) {
    return (
        <div className="flex gap-2">
            {['no', 'yes'].map(v => (
                <button key={v} type="button" onClick={() => onChange(v)}
                    className="flex-1 py-2 rounded-md border text-xs font-semibold transition-colors cursor-pointer"
                    style={{ borderColor: value === v ? '#0D7377' : '#E0D9CF', background: value === v ? 'rgba(13,115,119,0.06)' : '#FFFFFF', color: value === v ? '#0D7377' : '#4A4A3F' }}>
                    {v === 'yes' ? 'Yes' : 'No'}
                </button>
            ))}
        </div>
    )
}

// ─── Side Panel ───────────────────────────────────────────────────────────────

function SidePanel({ lat, lng, climateData, loadingClimate }) {
    return (
        <div className="side-panel space-y-4">
            <div className="card-cedar p-0 overflow-hidden">
                <div className="p-4" style={{ borderBottom: '1px solid #E0D9CF' }}>
                    <div className="label-instrument flex items-center gap-1.5 mb-1"><MapPin className="w-3 h-3" /> LOCATION PIN</div>
                </div>
                <div style={{ height: 200, background: '#E8E3DA', position: 'relative', overflow: 'hidden' }}>
                    {lat && lng ? (
                        <iframe
                            title="Location Map"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${(parseFloat(lng) - 0.05).toFixed(6)},${(parseFloat(lat) - 0.05).toFixed(6)},${(parseFloat(lng) + 0.05).toFixed(6)},${(parseFloat(lat) + 0.05).toFixed(6)}&layer=mapnik&marker=${parseFloat(lat).toFixed(6)},${parseFloat(lng).toFixed(6)}`}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center" style={{ color: '#9B9B8A', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                                <Navigation className="w-5 h-5 mx-auto mb-2 opacity-40" />
                                Awaiting location…
                            </div>
                        </div>
                    )}
                </div>
                {lat && lng && (
                    <div className="px-4 py-2" style={{ borderTop: '1px solid #E0D9CF' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#9B9B8A' }}>
                            LAT {parseFloat(lat).toFixed(4)} · LNG {parseFloat(lng).toFixed(4)}
                        </span>
                    </div>
                )}
            </div>

            <div className="card-cedar">
                <div className="label-instrument mb-3">DATA FRESHNESS</div>
                {loadingClimate ? (
                    <div className="space-y-2">
                        {['Elevation', 'Rainfall', 'Flood Risk', 'Drought'].map(l => (
                            <div key={l} className="skeleton-cedar h-5 w-full rounded" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {[
                            { label: 'ELEVATION', data: climateData?.elevation },
                            { label: 'RAINFALL', data: climateData?.rainfall },
                            { label: 'FLOOD_RISK', data: climateData?.floodRisk },
                            { label: 'DROUGHT', data: climateData?.droughtIndex },
                            { label: 'SOIL_TYPE', data: climateData?.soilType },
                            { label: 'LAND_USE', data: climateData?.landUse },
                        ].filter(d => d.data).map(d => (
                            <div key={d.label} className="flex items-center justify-between py-1" style={{ borderBottom: '1px solid #F0EBE2' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#4A4A3F', letterSpacing: '0.04em' }}>{d.label}</span>
                                <span className="freshness-tag">{d.data.source} · {timeAgo(d.data.lastUpdated)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Preference Page ──────────────────────────────────────────────────────────

function PreferencePage({ entryMode, setEntryMode, locationChoice, setLocationChoice, onContinue }) {
    const canContinue = entryMode && locationChoice
    const modeOptions = [
        { id: 'ai', icon: Sparkles, title: 'Smart AI Assistant', description: 'Record conversation — AI transcribes and auto-fills loan data.', badge: 'RECOMMENDED' },
        { id: 'manual', icon: PenLine, title: 'Manual Entry', description: 'Fill out the assessment form directly with client data.', badge: null },
    ]
    const locationOptions = [
        { id: 'gps', icon: Navigation, title: 'Use current location', description: 'GPS auto-detects position with device permission.' },
        { id: 'manual', icon: Search, title: 'Enter manually', description: 'Search for a village, city, or district by name.' },
    ]

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="max-w-2xl">
            <div className="mb-8">
                <div className="label-instrument mb-1">NEW ASSESSMENT</div>
                <h1 className="text-xl tracking-tight" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A1A18' }}>How would you like to proceed?</h1>
                <p className="text-xs mt-1" style={{ color: '#9B9B8A', fontFamily: 'var(--font-mono)' }}>Choose your data entry method and location preference.</p>
            </div>
            <div className="mb-6">
                <div className="label-instrument mb-3">DATA ENTRY METHOD</div>
                <div className="grid grid-cols-2 gap-4">
                    {modeOptions.map(opt => {
                        const Icon = opt.icon
                        const selected = entryMode === opt.id
                        return (
                            <button key={opt.id} type="button" onClick={() => setEntryMode(opt.id)} className="card-cedar text-left p-5 cursor-pointer transition-all" style={{ borderColor: selected ? '#0D7377' : '#E0D9CF', background: selected ? 'rgba(13,115,119,0.04)' : '#FFFFFF', outline: 'none' }}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: selected ? 'rgba(13,115,119,0.12)' : 'rgba(74,74,63,0.07)' }}>
                                        <Icon className="w-4 h-4" style={{ color: selected ? '#0D7377' : '#4A4A3F' }} />
                                    </div>
                                    {selected && <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#0D7377' }}><Check className="w-3 h-3 text-white" /></div>}
                                </div>
                                <div className="text-sm font-semibold mb-1" style={{ color: '#1A1A18' }}>{opt.title}</div>
                                <div className="text-xs leading-relaxed" style={{ color: '#6B6B5A' }}>{opt.description}</div>
                                {opt.badge && <div className="mt-3 label-instrument" style={{ color: '#0D7377' }}>{opt.badge}</div>}
                            </button>
                        )
                    })}
                </div>
            </div>
            <div className="mb-8">
                <div className="label-instrument mb-3">LOCATION PREFERENCE</div>
                <div className="grid grid-cols-2 gap-4">
                    {locationOptions.map(opt => {
                        const Icon = opt.icon
                        const selected = locationChoice === opt.id
                        return (
                            <button key={opt.id} type="button" onClick={() => setLocationChoice(opt.id)} className="card-cedar text-left p-5 cursor-pointer transition-all" style={{ borderColor: selected ? '#0D7377' : '#E0D9CF', background: selected ? 'rgba(13,115,119,0.04)' : '#FFFFFF', outline: 'none' }}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: selected ? 'rgba(13,115,119,0.12)' : 'rgba(74,74,63,0.07)' }}>
                                        <Icon className="w-4 h-4" style={{ color: selected ? '#0D7377' : '#4A4A3F' }} />
                                    </div>
                                    {selected && <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#0D7377' }}><Check className="w-3 h-3 text-white" /></div>}
                                </div>
                                <div className="text-sm font-semibold mb-1" style={{ color: '#1A1A18' }}>{opt.title}</div>
                                <div className="text-xs leading-relaxed" style={{ color: '#6B6B5A' }}>{opt.description}</div>
                            </button>
                        )
                    })}
                </div>
            </div>
            <button type="button" onClick={onContinue} disabled={!canContinue} className="btn-primary w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed" style={{ fontSize: '0.95rem' }}>
                Continue →
            </button>
        </motion.div>
    )
}

// ─── Manual Location Search ───────────────────────────────────────────────────

function ManualLocationSearch({ onConfirmed, onBack }) {
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [searching, setSearching] = useState(false)
    const [selected, setSelected] = useState(null)

    const handleQueryChange = async (value) => {
        setQuery(value)
        setSelected(null)
        if (value.length < 3) { setSuggestions([]); return }
        setSearching(true)
        try { const results = await searchAddress(value); setSuggestions(results) }
        catch { /* ignore */ }
        finally { setSearching(false) }
    }

    const handleSelect = (item) => { setSelected(item); setQuery(item.formatted); setSuggestions([]) }

    const handleConfirm = () => {
        if (!selected) return
        const addr = selected.address || {}
        onConfirmed({ lat: selected.lat, lng: selected.lng, formatted: selected.formatted, country: addr.country || '', region: addr.state || addr.region || '', district: addr.county || addr.city || addr.town || addr.village || '', method: 'manual' })
    }

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="max-w-xl">
            <div className="mb-8">
                <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-xs mb-5" style={{ color: '#9B9B8A', fontFamily: 'var(--font-mono)' }}>
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                </button>
                <div className="label-instrument mb-1">LOCATION</div>
                <h1 className="text-xl tracking-tight" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A1A18' }}>Where is the applicant located?</h1>
                <p className="text-xs mt-1" style={{ color: '#9B9B8A', fontFamily: 'var(--font-mono)' }}>Search by village, city, or district.</p>
            </div>
            <div className="card-cedar p-5 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9B9B8A' }} />
                    <input type="text" value={query} onChange={e => handleQueryChange(e.target.value)} placeholder="Type to search locations…" className="input-cedar text-sm" style={{ paddingLeft: '2.25rem' }} autoFocus />
                    {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" style={{ color: '#9B9B8A' }} />}
                </div>
                {suggestions.length > 0 && !selected && (
                    <div className="rounded-md overflow-hidden" style={{ border: '1px solid #E0D9CF' }}>
                        {suggestions.map(s => (
                            <button key={s.id} type="button" onClick={() => handleSelect(s)} className="w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-[#FAF8F5]" style={{ borderBottom: '1px solid #F0EBE2' }}>
                                <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#0D7377' }} />
                                <span className="text-sm" style={{ color: '#1A1A18' }}>{s.formatted}</span>
                            </button>
                        ))}
                    </div>
                )}
                {selected && (
                    <div className="flex items-start gap-3 p-3 rounded-md" style={{ background: 'rgba(13,115,119,0.06)', border: '1px solid rgba(13,115,119,0.15)' }}>
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#0D7377' }} />
                        <div>
                            <div className="text-sm font-medium" style={{ color: '#0D7377' }}>{selected.formatted}</div>
                            <div className="text-xs mt-0.5" style={{ color: '#9B9B8A', fontFamily: 'var(--font-mono)' }}>{selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}</div>
                        </div>
                    </div>
                )}
            </div>
            <button type="button" onClick={handleConfirm} disabled={!selected} className="btn-primary w-full py-3 mt-5 disabled:opacity-40 disabled:cursor-not-allowed">Confirm location →</button>
        </motion.div>
    )
}

// ─── Data constants ───────────────────────────────────────────────────────────

const loanPurposes = [
    { id: 'agriculture', name: 'Agriculture', icon: '🌾' },
    { id: 'livestock', name: 'Livestock', icon: '🐄' },
    { id: 'small_business', name: 'Small Business', icon: '🏪' },
    { id: 'housing', name: 'Housing', icon: '🏠' }
]

const cropTypes = [
    { id: 'rice', name: 'Rice' }, { id: 'wheat', name: 'Wheat' },
    { id: 'maize', name: 'Maize/Corn' }, { id: 'coffee', name: 'Coffee' },
    { id: 'tea', name: 'Tea' }, { id: 'sugarcane', name: 'Sugarcane' },
    { id: 'vegetables', name: 'Vegetables' }, { id: 'fruits', name: 'Fruits' },
    { id: 'cotton', name: 'Cotton' }, { id: 'other', name: 'Other' }
]

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SmartAssessment() {
    const { user, mfi } = useAuth()
    const navigate = useNavigate()

    const [phase, setPhase] = useState('preference')
    const [entryMode, setEntryMode] = useState(null)
    const [locationChoice, setLocationChoice] = useState(null)
    const [pendingAssessmentId, setPendingAssessmentId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [locationData, setLocationData] = useState(null)
    const [locationError, setLocationError] = useState(null)
    const [climateLoading, setClimateLoading] = useState(false)
    const [climateData, setClimateData] = useState(null)

    const [form, setForm] = useState({
        latitude: '', longitude: '', locationName: '', country: '', region: '', district: '',
        elevation: '', rainfall: '', floodRisk: '', droughtIndex: '', soilType: '', landUse: '',
        loanAmount: '', loanPurpose: '', cropType: '', loanTerm: '12',
        clientName: '', clientAge: '', existingLoans: '0', repaymentHistory: '95', monthlyIncome: '',
        propertySize: '', propertySizeUnit: 'acres', propertyType: '', yearBuilt: '',
        proximityToWater: '', floodZoneClass: '', historicalDamage: 'no', historicalDamageDesc: '',
        insuranceCoverage: 'no', insuranceType: '', mitigationMeasures: '',
        additionalNotes: ''
    })

    const set = useCallback((field, val) => setForm(prev => ({ ...prev, [field]: val })), [])

    const fetchClimate = useCallback(async (lat, lng) => {
        setClimateLoading(true)
        try {
            const climate = await fetchAllClimateData(lat, lng)
            setClimateData(climate)
            setForm(prev => ({
                ...prev,
                elevation: climate.elevation?.value?.toString() || '',
                rainfall: climate.rainfall?.value?.toString() || '',
                floodRisk: climate.floodRisk?.value ? (climate.floodRisk.value * 100).toFixed(0) : '',
                droughtIndex: climate.droughtIndex?.value ? (climate.droughtIndex.value * 100).toFixed(0) : '',
                soilType: climate.soilType?.value || '',
                landUse: climate.landUse?.value || ''
            }))
        } catch (err) {
            console.warn('Climate fetch failed:', err)
        } finally {
            setClimateLoading(false)
        }
    }, [])

    const useDemoLocation = useCallback((errMsg) => {
        setLocationError(errMsg)
        const demoLocs = {
            'bangladesh-mfi': { lat: 24.8949, lng: 91.8687, country: 'Bangladesh', region: 'Sylhet Division', district: 'Sylhet', formatted: 'Sylhet, Bangladesh' },
            'kenya-mfi': { lat: -0.4167, lng: 36.9500, country: 'Kenya', region: 'Central', district: 'Nyeri', formatted: 'Nyeri, Kenya' },
            'peru-mfi': { lat: -13.5319, lng: -71.9675, country: 'Peru', region: 'Cusco', district: 'Cusco', formatted: 'Cusco, Peru' },
        }
        const demo = demoLocs[mfi?.id || mfi?.slug] || demoLocs['bangladesh-mfi']
        setLocationData(demo)
        setForm(prev => ({ ...prev, latitude: demo.lat.toFixed(6), longitude: demo.lng.toFixed(6), locationName: demo.formatted + ' (Demo)', country: demo.country, region: demo.region, district: demo.district }))
        fetchClimate(demo.lat, demo.lng)
    }, [mfi, fetchClimate])

    const handleContinue = useCallback(() => {
        if (!entryMode || !locationChoice) return
        if (locationChoice === 'gps') {
            setPhase('data-loading')
            detectGPS()
                .then(coords => reverseGeocode(coords.lat, coords.lng).then(geo => ({ coords, geo })))
                .then(({ coords, geo }) => {
                    const addr = geo.address || {}
                    const locData = { lat: coords.lat, lng: coords.lng, accuracy: coords.accuracy, formatted: geo.formatted, country: addr.country || '', region: addr.state || addr.region || '', district: addr.county || addr.city || addr.town || addr.village || '' }
                    setLocationData(locData)
                    setLocationError(null)
                    setForm(prev => ({ ...prev, latitude: coords.lat.toFixed(6), longitude: coords.lng.toFixed(6), locationName: geo.formatted, country: locData.country, region: locData.region, district: locData.district }))
                    fetchClimate(coords.lat, coords.lng)
                })
                .catch(err => useDemoLocation(err.message))
        } else {
            setPhase('location-manual')
        }
    }, [entryMode, locationChoice, fetchClimate, useDemoLocation])

    const handleManualLocationConfirmed = useCallback((location) => {
        setLocationData(location)
        setLocationError(null)
        setForm(prev => ({ ...prev, latitude: location.lat.toFixed(6), longitude: location.lng.toFixed(6), locationName: location.formatted, country: location.country || '', region: location.region || '', district: location.district || '' }))
        setPhase('data-loading')
        fetchClimate(location.lat, location.lng)
    }, [fetchClimate])

    const locationComplete = useMemo(() => !!(form.latitude && form.longitude && form.country), [form.latitude, form.longitude, form.country])
    const climateComplete = useMemo(() => !!(form.elevation && form.rainfall), [form.elevation, form.rainfall])
    const loanComplete = useMemo(() => !!(form.loanAmount && form.loanPurpose), [form.loanAmount, form.loanPurpose])
    const borrowerComplete = useMemo(() => !!(form.clientAge && form.monthlyIncome), [form.clientAge, form.monthlyIncome])
    const canSubmit = locationComplete && loanComplete && borrowerComplete

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        let targetId = null
        try {
            const result = await assessmentsAPI.createAssessment({
                latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude),
                locationName: form.locationName, loanAmount: parseFloat(form.loanAmount),
                loanPurpose: form.loanPurpose, cropType: form.cropType || null,
                clientAge: parseInt(form.clientAge), existingLoans: parseInt(form.existingLoans),
                repaymentHistory: parseFloat(form.repaymentHistory)
            })
            if (result.success && result.assessment) {
                sessionStorage.setItem(`assessment_${result.assessment.id}`, JSON.stringify(result.assessment))
                targetId = result.assessment.id
            }
        } catch (error) { console.warn('API failed, demo mode:', error.message) }

        if (!targetId) {
            targetId = `assess_${Date.now()}`
            sessionStorage.setItem(`assessment_${targetId}`, JSON.stringify({ ...form, mfiId: mfi?.slug || mfi?.id, loanOfficerId: user?.id, loanOfficerName: user?.name, timestamp: new Date().toISOString() }))
        }
        setPendingAssessmentId(targetId)
        setLoading(false)
        setPhase('analyzing')
    }

    // ─── Phase routing ────────────────────────────────────────────────

    if (phase === 'preference') return <PreferencePage entryMode={entryMode} setEntryMode={setEntryMode} locationChoice={locationChoice} setLocationChoice={setLocationChoice} onContinue={handleContinue} />
    if (phase === 'location-manual') return <ManualLocationSearch onConfirmed={handleManualLocationConfirmed} onBack={() => setPhase('preference')} />
    if (phase === 'data-loading') return <LoadingAnimation onComplete={() => setPhase('form')} minimumDuration={5000} />
    if (phase === 'analyzing') return <LoadingAnimation onComplete={() => navigate(`/app/results/${pendingAssessmentId}`)} minimumDuration={6000} messages={analyzingMessages} />

    // ─── Form ─────────────────────────────────────────────────────────

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="mb-6">
                <div className="label-instrument mb-1">NEW ASSESSMENT</div>
                <h1 className="text-xl tracking-tight" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A1A18' }}>Smart Data Entry</h1>
                <p className="text-xs mt-1" style={{ color: '#9B9B8A', fontFamily: 'var(--font-mono)' }}>Fields auto-populate from your location. Edit any value freely.</p>
                {locationError && (
                    <div className="mt-3 p-2.5 rounded-md text-xs" style={{ background: 'rgba(230,126,34,0.06)', border: '1px solid rgba(230,126,34,0.15)', color: '#E67E22', fontFamily: 'var(--font-mono)' }}>
                        GPS unavailable — using demo location for {mfi?.name || 'your region'}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="smart-assessment-layout">
                    <div>
                        {/* SECTION 01 — LOCATION */}
                        <Section id="SECTION_01" label="LOCATION" icon={MapPin} isComplete={locationComplete}>
                            <div className="grid grid-cols-2 gap-4">
                                <SmartField label="LATITUDE" value={form.latitude} onChange={e => set('latitude', e.target.value)} autoDetected={!!locationData} source="GPS" lastUpdated={locationData ? new Date().toISOString() : null} type="number" step="any" required />
                                <SmartField label="LONGITUDE" value={form.longitude} onChange={e => set('longitude', e.target.value)} autoDetected={!!locationData} source="GPS" lastUpdated={locationData ? new Date().toISOString() : null} type="number" step="any" required />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <SmartField label="COUNTRY" value={form.country} onChange={e => set('country', e.target.value)} autoDetected={!!locationData} source="Nominatim" lastUpdated={locationData ? new Date().toISOString() : null} />
                                <SmartField label="REGION" value={form.region} onChange={e => set('region', e.target.value)} autoDetected={!!locationData} source="Nominatim" lastUpdated={locationData ? new Date().toISOString() : null} />
                                <SmartField label="DISTRICT" value={form.district} onChange={e => set('district', e.target.value)} autoDetected={!!locationData} source="Nominatim" lastUpdated={locationData ? new Date().toISOString() : null} />
                            </div>
                        </Section>

                        {/* SECTION 02 — CLIMATE INDICATORS */}
                        <Section id="SECTION_02" label="CLIMATE INDICATORS" icon={Cloud} isComplete={climateComplete}>
                            {climateLoading ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {['ELEVATION', 'RAINFALL', 'FLOOD_RISK', 'DROUGHT_IDX', 'SOIL_TYPE', 'LAND_USE'].map(l => <SkeletonField key={l} label={l} />)}
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <SmartField label="ELEVATION (m)" value={form.elevation} onChange={e => set('elevation', e.target.value)} autoDetected={!!climateData?.elevation} source={climateData?.elevation?.source} lastUpdated={climateData?.elevation?.lastUpdated} type="number" />
                                        <SmartField label="RAINFALL (mm/mo)" value={form.rainfall} onChange={e => set('rainfall', e.target.value)} autoDetected={!!climateData?.rainfall} source={climateData?.rainfall?.source} lastUpdated={climateData?.rainfall?.lastUpdated} type="number" />
                                        <SmartField label="FLOOD_RISK (%)" value={form.floodRisk} onChange={e => set('floodRisk', e.target.value)} autoDetected={!!climateData?.floodRisk} source={climateData?.floodRisk?.source} lastUpdated={climateData?.floodRisk?.lastUpdated} type="number" min="0" max="100" />
                                        <SmartField label="DROUGHT_IDX (%)" value={form.droughtIndex} onChange={e => set('droughtIndex', e.target.value)} autoDetected={!!climateData?.droughtIndex} source={climateData?.droughtIndex?.source} lastUpdated={climateData?.droughtIndex?.lastUpdated} type="number" min="0" max="100" />
                                        <SmartField label="SOIL_TYPE" value={form.soilType} onChange={e => set('soilType', e.target.value)} autoDetected={!!climateData?.soilType} source={climateData?.soilType?.source} lastUpdated={climateData?.soilType?.lastUpdated} />
                                        <SmartField label="LAND_USE" value={form.landUse} onChange={e => set('landUse', e.target.value)} autoDetected={!!climateData?.landUse} source={climateData?.landUse?.source} lastUpdated={climateData?.landUse?.lastUpdated} />
                                    </div>
                                    <div className="pt-3" style={{ borderTop: '1px solid #F0EBE2' }}>
                                        <div className="label-instrument mb-3" style={{ color: '#C8BFB0' }}>ENVIRONMENTAL CONTEXT — OPTIONAL</div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <OptLabel>WATER_PROXIMITY</OptLabel>
                                                <select value={form.proximityToWater} onChange={e => set('proximityToWater', e.target.value)} className="input-cedar text-sm mt-1.5">
                                                    <option value="">Select…</option>
                                                    <option value="under100m">{'< 100 m'}</option>
                                                    <option value="100-500m">100–500 m</option>
                                                    <option value="500m-1km">500 m–1 km</option>
                                                    <option value="over1km">{'> 1 km'}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <OptLabel>FLOOD_ZONE_CLASS</OptLabel>
                                                <select value={form.floodZoneClass} onChange={e => set('floodZoneClass', e.target.value)} className="input-cedar text-sm mt-1.5">
                                                    <option value="">Select…</option>
                                                    <option value="zone-a">Zone A — High Risk</option>
                                                    <option value="zone-b">Zone B — Moderate</option>
                                                    <option value="zone-c">Zone C — Minimal</option>
                                                    <option value="none">No designation</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <OptLabel>HISTORICAL_DAMAGE</OptLabel>
                                            <div className="mt-1.5"><YesNoToggle value={form.historicalDamage} onChange={v => set('historicalDamage', v)} /></div>
                                            {form.historicalDamage === 'yes' && (
                                                <textarea value={form.historicalDamageDesc} onChange={e => set('historicalDamageDesc', e.target.value)} placeholder="Brief description of past flood/storm damage…" className="input-cedar text-sm mt-2" style={{ minHeight: '64px', resize: 'vertical' }} />
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </Section>

                        {/* SECTION 03 — LOAN DETAILS */}
                        <Section id="SECTION_03" label="LOAN DETAILS" icon={DollarSign} isComplete={loanComplete}>
                            <SmartField label="LOAN_AMOUNT" value={form.loanAmount} onChange={e => set('loanAmount', e.target.value)} type="number" min="50" max="50000" required prefix="$" placeholder="Enter amount" />
                            <div>
                                <span className="label-instrument block mb-2">LOAN_PURPOSE</span>
                                <div className="grid grid-cols-4 gap-2">
                                    {loanPurposes.map(p => (
                                        <button key={p.id} type="button" onClick={() => set('loanPurpose', p.id)}
                                            className={`p-2.5 rounded-md border text-center text-xs font-medium transition-colors cursor-pointer ${form.loanPurpose === p.id ? 'border-[#0D7377] bg-[rgba(13,115,119,0.06)] text-[#0D7377]' : 'border-[#E0D9CF] text-[#4A4A3F] hover:border-[#C8BFB0]'}`}>
                                            <span className="text-lg block mb-1">{p.icon}</span>{p.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {form.loanPurpose === 'agriculture' && (
                                <div>
                                    <span className="label-instrument block mb-2">CROP_TYPE</span>
                                    <select value={form.cropType} onChange={e => set('cropType', e.target.value)} className="input-cedar text-sm">
                                        <option value="">Select crop type</option>
                                        {cropTypes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <SmartField label="LOAN_TERM (months)" value={form.loanTerm} onChange={e => set('loanTerm', e.target.value)} type="number" min="1" max="60" />
                            <div className="pt-3" style={{ borderTop: '1px solid #F0EBE2' }}>
                                <div className="label-instrument mb-3" style={{ color: '#C8BFB0' }}>RISK CONTEXT — OPTIONAL</div>
                                <div>
                                    <OptLabel>INSURANCE_COVERAGE</OptLabel>
                                    <div className="mt-1.5 mb-2"><YesNoToggle value={form.insuranceCoverage} onChange={v => set('insuranceCoverage', v)} /></div>
                                    {form.insuranceCoverage === 'yes' && (
                                        <SmartField label="INSURANCE_TYPE" value={form.insuranceType} onChange={e => set('insuranceType', e.target.value)} placeholder="e.g., Weather-indexed, Crop, Property…" optional />
                                    )}
                                </div>
                                <div className="mt-3">
                                    <OptLabel>MITIGATION_MEASURES</OptLabel>
                                    <textarea value={form.mitigationMeasures} onChange={e => set('mitigationMeasures', e.target.value)} placeholder="Existing flood defenses, drainage improvements, protective infrastructure…" className="input-cedar text-sm mt-1.5" style={{ minHeight: '72px', resize: 'vertical' }} />
                                </div>
                            </div>
                        </Section>

                        {/* SECTION 04 — BORROWER PROFILE */}
                        <Section id="SECTION_04" label="BORROWER PROFILE" icon={User} isComplete={borrowerComplete}>
                            <div className="grid grid-cols-2 gap-4">
                                <SmartField label="CLIENT_NAME" value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="Full name" />
                                <SmartField label="CLIENT_AGE" value={form.clientAge} onChange={e => set('clientAge', e.target.value)} type="number" min="18" max="100" required placeholder="Age" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <SmartField label="EXISTING_LOANS" value={form.existingLoans} onChange={e => set('existingLoans', e.target.value)} type="number" min="0" max="10" />
                                <SmartField label="MONTHLY_INCOME" value={form.monthlyIncome} onChange={e => set('monthlyIncome', e.target.value)} type="number" min="0" prefix="$" required placeholder="USD" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="label-instrument">REPAYMENT_HIST</span>
                                    <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)', color: '#0D7377' }}>{form.repaymentHistory}%</span>
                                </div>
                                <input type="range" value={form.repaymentHistory} onChange={e => set('repaymentHistory', e.target.value)} min="0" max="100"
                                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: '#E0D9CF', accentColor: '#0D7377' }} />
                            </div>
                        </Section>

                        {/* SECTION 05 — PROPERTY DETAILS (optional) */}
                        <Section id="SECTION_05" label="PROPERTY DETAILS" icon={Building2} isComplete={false} defaultOpen={false}>
                            <div className="label-instrument mb-2" style={{ color: '#C8BFB0' }}>ALL FIELDS OPTIONAL</div>
                            <div className="grid grid-cols-2 gap-4">
                                <SmartField label="PROPERTY_SIZE" value={form.propertySize} onChange={e => set('propertySize', e.target.value)} type="number" min="0" step="0.01" placeholder="e.g., 2.5" optional />
                                <div>
                                    <OptLabel>SIZE_UNIT</OptLabel>
                                    <select value={form.propertySizeUnit} onChange={e => set('propertySizeUnit', e.target.value)} className="input-cedar text-sm mt-1.5">
                                        <option value="acres">Acres</option>
                                        <option value="hectares">Hectares</option>
                                        <option value="sqft">Sq ft</option>
                                        <option value="sqm">Sq m</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <OptLabel>PROPERTY_TYPE</OptLabel>
                                <select value={form.propertyType} onChange={e => set('propertyType', e.target.value)} className="input-cedar text-sm mt-1.5">
                                    <option value="">Select type…</option>
                                    <option value="residential">Residential</option>
                                    <option value="agricultural">Agricultural</option>
                                    <option value="commercial">Commercial</option>
                                    <option value="mixed">Mixed Use</option>
                                </select>
                            </div>
                            <SmartField label="YEAR_BUILT" value={form.yearBuilt} onChange={e => set('yearBuilt', e.target.value)} type="number" min="1800" max={new Date().getFullYear()} placeholder={`e.g., ${new Date().getFullYear() - 10}`} optional />
                        </Section>

                        {/* SECTION 06 — ADDITIONAL NOTES (optional) */}
                        <Section id="SECTION_06" label="ADDITIONAL NOTES" icon={FileText} isComplete={false} defaultOpen={false}>
                            <div className="label-instrument mb-2" style={{ color: '#C8BFB0' }}>OPTIONAL FREE TEXT</div>
                            <textarea value={form.additionalNotes} onChange={e => set('additionalNotes', e.target.value)} placeholder="Any additional context, observations, or comments about this assessment…" className="input-cedar text-sm" style={{ minHeight: '100px', resize: 'vertical' }} />
                        </Section>

                        <button type="submit" disabled={loading || !canSubmit} className={`btn-terminal w-full py-3.5 justify-center text-sm disabled:opacity-40 disabled:cursor-not-allowed ${canSubmit && !loading ? 'pulse-green' : ''}`}>
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparing…</> : <><span style={{ color: '#27AE60' }}>→</span> Compute Risk Score</>}
                        </button>
                    </div>

                    <SidePanel lat={form.latitude} lng={form.longitude} climateData={climateData} loadingClimate={climateLoading} />
                </div>
            </form>
        </motion.div>
    )
}
