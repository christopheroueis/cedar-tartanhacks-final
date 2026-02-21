import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { assessmentsAPI } from '../services/api'
import {
    MapPin, DollarSign, Wheat, User, FileCheck,
    Navigation, Loader2, AlertCircle, Mic, MicOff, Square,
    Sparkles, PenLine, Check, ChevronLeft, ArrowRight
} from 'lucide-react'
import LocationDetection from '../components/LocationDetection'
import LoadingAnimation from '../components/LoadingAnimation'
import { formatLocationForBackend } from '../services/locationService'

// API base URL — empty string = same-origin (works on Vercel)
const API_BASE = import.meta.env.VITE_API_URL || ''

export default function NewAssessment() {
    const { user, mfi, logout } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [gpsLoading, setGpsLoading] = useState(false)

    // Multi-step flow state
    const [step, setStep] = useState('mode-select')
    const [entryMode, setEntryMode] = useState(null)

    // Location state
    const [location, setLocation] = useState(null)

    // Recording state
    const [isRecording, setIsRecording] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [interimTranscript, setInterimTranscript] = useState('')
    const recognitionRef = useRef(null)

    // AI extraction state
    const [extracting, setExtracting] = useState(false)
    const [extractedData, setExtractedData] = useState(null)
    const [confidence, setConfidence] = useState({})
    const [extractionError, setExtractionError] = useState('')

    const [formData, setFormData] = useState({
        latitude: '',
        longitude: '',
        locationName: '',
        loanAmount: '',
        loanPurpose: '',
        cropType: '',
        clientAge: '',
        clientName: '',
        existingLoans: '0',
        repaymentHistory: '95',
        monthlyIncome: ''
    })

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

    const demoLocations = {
        'bangladesh-mfi': { lat: 24.8949, lng: 91.8687, name: 'Sylhet, Bangladesh' },
        'kenya-mfi': { lat: -0.4167, lng: 36.9500, name: 'Nyeri, Kenya' },
        'peru-mfi': { lat: -13.5319, lng: -71.9675, name: 'Cusco, Peru' }
    }

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            recognitionRef.current = new SpeechRecognition()
            recognitionRef.current.continuous = true
            recognitionRef.current.interimResults = true
            recognitionRef.current.lang = 'en-US'

            recognitionRef.current.onresult = (event) => {
                let interim = '', final = ''
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) final += event.results[i][0].transcript + ' '
                    else interim += event.results[i][0].transcript
                }
                if (final) setTranscript(prev => prev + final)
                setInterimTranscript(interim)
            }

            recognitionRef.current.onerror = (event) => {
                if (event.error === 'not-allowed') setExtractionError('Microphone access denied.')
            }

            recognitionRef.current.onend = () => {
                if (isRecording) recognitionRef.current.start()
            }
        }
        return () => { if (recognitionRef.current) recognitionRef.current.stop() }
    }, [isRecording])

    const startRecording = () => {
        setTranscript(''); setInterimTranscript(''); setExtractionError('')
        setIsRecording(true)
        recognitionRef.current?.start()
    }

    const stopRecording = async () => {
        setIsRecording(false)
        recognitionRef.current?.stop()
        if (transcript.trim().length > 5) await extractDataFromTranscript()
        else setExtractionError('No speech detected.')
    }

    const extractDataFromTranscript = async () => {
        setExtracting(true); setExtractionError('')
        try {
            const response = await fetch(`${API_BASE}/api/v2/ai/extract`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript })
            })
            const result = await response.json()
            if (result.success) {
                setExtractedData(result.extracted)
                setConfidence(result.confidence || {})
                setFormData(prev => ({
                    ...prev,
                    clientName: result.extracted.clientName || prev.clientName,
                    clientAge: result.extracted.clientAge?.toString() || prev.clientAge,
                    loanAmount: result.extracted.loanAmount?.toString() || prev.loanAmount,
                    loanPurpose: mapProjectType(result.extracted.projectType) || prev.loanPurpose,
                    cropType: result.extracted.cropType || prev.cropType,
                    existingLoans: result.extracted.existingLoans?.toString() || prev.existingLoans,
                    repaymentHistory: result.extracted.repaymentHistory?.toString() || prev.repaymentHistory,
                    monthlyIncome: result.extracted.monthlyIncome?.toString() || prev.monthlyIncome
                }))
                setStep('review')
            } else {
                setExtractionError(result.error || 'Extraction failed.')
            }
        } catch {
            setExtractionError('Failed to connect to AI service.')
        } finally { setExtracting(false) }
    }

    const mapProjectType = (type) => {
        const mapping = { agriculture: 'agriculture', livestock: 'livestock', retail: 'small_business', manufacturing: 'small_business', services: 'small_business', housing: 'housing', fishing: 'agriculture', transport: 'small_business' }
        return mapping[type] || null
    }

    const getConfidenceBadge = (field) => {
        const level = confidence[field]
        if (level === 'high') return { text: 'HIGH', color: '#27AE60', bg: 'rgba(39,174,96,0.1)' }
        if (level === 'medium') return { text: 'MED', color: '#E67E22', bg: 'rgba(230,126,34,0.1)' }
        return { text: 'LOW', color: '#C0392B', bg: 'rgba(192,57,43,0.1)' }
    }

    const detectLocation = async () => {
        setGpsLoading(true)
        if (!navigator.geolocation) {
            const demoLoc = demoLocations[mfi?.id] || demoLocations['bangladesh-mfi']
            setFormData(prev => ({ ...prev, latitude: demoLoc.lat.toString(), longitude: demoLoc.lng.toString(), locationName: demoLoc.name + ' (Demo)' }))
            setGpsLoading(false); return
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({ ...prev, latitude: position.coords.latitude.toFixed(6), longitude: position.coords.longitude.toFixed(6), locationName: 'GPS Location Detected' }))
                setGpsLoading(false)
            },
            () => {
                const demoLoc = demoLocations[mfi?.id] || demoLocations['bangladesh-mfi']
                setFormData(prev => ({ ...prev, latitude: demoLoc.lat.toString(), longitude: demoLoc.lng.toString(), locationName: demoLoc.name + ' (Demo)' }))
                setGpsLoading(false)
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const result = await assessmentsAPI.createAssessment({
                latitude: parseFloat(formData.latitude), longitude: parseFloat(formData.longitude),
                locationName: formData.locationName, loanAmount: parseFloat(formData.loanAmount),
                loanPurpose: formData.loanPurpose, cropType: formData.cropType || null,
                clientAge: parseInt(formData.clientAge), existingLoans: parseInt(formData.existingLoans),
                repaymentHistory: parseFloat(formData.repaymentHistory)
            })
            if (result.success && result.assessment) {
                sessionStorage.setItem(`assessment_${result.assessment.id}`, JSON.stringify(result.assessment))
                setLoading(false); navigate(`/app/results/${result.assessment.id}`); return
            }
        } catch (error) { console.warn('API call failed, using demo mode:', error.message) }

        const assessmentId = `assess_${Date.now()}`
        sessionStorage.setItem(`assessment_${assessmentId}`, JSON.stringify({
            ...formData, mfiId: mfi?.slug || mfi?.id,
            loanOfficerId: user?.id, loanOfficerName: user?.name,
            timestamp: new Date().toISOString()
        }))
        setLoading(false)
        navigate(`/app/results/${assessmentId}`)
    }

    const handleModeSelect = (mode) => { setEntryMode(mode); setStep('location-detect') }

    const handleLocationConfirmed = (detectedLocation) => {
        setLocation(detectedLocation)
        setFormData(prev => ({ ...prev, latitude: detectedLocation.lat.toString(), longitude: detectedLocation.lng.toString(), locationName: detectedLocation.formatted }))
        setStep('loading')
    }

    const handleLoadingComplete = () => { setStep(entryMode === 'manual' ? 'manual-form' : 'recording') }

    const handleBack = () => {
        if (step === 'manual-form' || step === 'recording') { setStep('mode-select'); setEntryMode(null) }
        else if (step === 'review') setStep('recording')
    }

    // Get current step index for step bar
    const stepNames = ['MODE', 'LOCATION', 'DATA', 'ASSESS']
    const stepIndex = step === 'mode-select' ? 0 : (step === 'location-detect' ? 1 : (step === 'loading' ? 2 : (step === 'manual-form' || step === 'recording' || step === 'review' ? 2 : 3)))

    // ============ RENDER ============

    if (step === 'location-detect') {
        return <LocationDetection onLocationConfirmed={handleLocationConfirmed} />
    }

    if (step === 'loading') {
        return <LoadingAnimation onComplete={handleLoadingComplete} location={location} />
    }

    return (
        <div>
            {/* Page header with step bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="label-instrument mb-1">NEW ASSESSMENT</div>
                        <h1 className="text-xl tracking-tight" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A1A18' }}>
                            {step === 'mode-select' ? 'Data Entry Method' : step === 'recording' ? 'AI Assistant' : step === 'review' ? 'Review & Submit' : 'Loan Application Data'}
                        </h1>
                    </div>
                    {step !== 'mode-select' && (
                        <button onClick={handleBack} className="btn-secondary text-xs py-2 px-4">
                            <ChevronLeft className="w-3.5 h-3.5" /> Back
                        </button>
                    )}
                </div>

                {/* Step bar */}
                <div className="step-bar">
                    {stepNames.map((name, i) => (
                        <div key={name} className={`step-bar-item ${i === stepIndex ? 'active' : i < stepIndex ? 'complete' : ''}`}>
                            <div className="step-bar-dot">{i < stepIndex ? '✓' : i + 1}</div>
                            <div className="step-bar-label">{name}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mode selection */}
            {step === 'mode-select' && (
                <div className="grid grid-cols-2 gap-6 max-w-2xl">
                    <button onClick={() => handleModeSelect('ai')} className="card-cedar text-left p-6 hover:border-[#0D7377] transition-colors group cursor-pointer">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: 'rgba(13,115,119,0.1)' }}>
                            <Sparkles className="w-5 h-5" style={{ color: '#0D7377' }} />
                        </div>
                        <h3 className="text-sm font-semibold mb-1" style={{ color: '#1A1A18' }}>AI Assistant</h3>
                        <p className="text-xs leading-relaxed mb-3" style={{ color: '#6B6B5A' }}>
                            Record conversation → AI transcribes and extracts loan data automatically.
                        </p>
                        <div className="label-instrument flex items-center gap-1">
                            <span style={{ color: '#0D7377' }}>RECOMMENDED</span>
                        </div>
                    </button>

                    <button onClick={() => handleModeSelect('manual')} className="card-cedar text-left p-6 hover:border-[#0D7377] transition-colors group cursor-pointer">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: 'rgba(74,74,63,0.08)' }}>
                            <PenLine className="w-5 h-5" style={{ color: '#4A4A3F' }} />
                        </div>
                        <h3 className="text-sm font-semibold mb-1" style={{ color: '#1A1A18' }}>Manual Entry</h3>
                        <p className="text-xs leading-relaxed mb-3" style={{ color: '#6B6B5A' }}>
                            Fill out the assessment form manually with client data.
                        </p>
                        <div className="label-instrument">FULL CONTROL</div>
                    </button>
                </div>
            )}

            {/* Recording mode */}
            {step === 'recording' && (
                <div className="max-w-2xl space-y-6">
                    <div className="card-cedar text-center py-10">
                        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 transition-all ${isRecording ? 'bg-[#C0392B] animate-pulse' : 'bg-[#0D7377]'}`}>
                            {isRecording ? <Mic className="w-8 h-8 text-white" /> : <MicOff className="w-8 h-8 text-white/80" />}
                        </div>
                        {!isRecording && !extracting && (
                            <button type="button" onClick={startRecording} className="btn-primary">Start recording</button>
                        )}
                        {isRecording && (
                            <button type="button" onClick={stopRecording} className="btn-primary" style={{ background: '#C0392B' }}>
                                <Square className="w-4 h-4" /> Stop & extract
                            </button>
                        )}
                        {extracting && (
                            <div className="flex items-center justify-center gap-2" style={{ color: '#0D7377' }}>
                                <Loader2 className="w-5 h-5 animate-spin" /> <span className="text-sm font-medium">Extracting…</span>
                            </div>
                        )}
                    </div>

                    <div className="card-cedar">
                        <div className="flex items-center justify-between mb-3">
                            <span className="label-instrument">TRANSCRIPT</span>
                            <span className="text-xs" style={{ color: '#9B9B8A', fontFamily: 'var(--font-mono)' }}>
                                {transcript.length > 0 ? `${transcript.split(' ').length} words` : '0 words'}
                            </span>
                        </div>
                        <textarea
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            placeholder="Speech will appear here, or type/paste your conversation…"
                            className="input-cedar"
                            style={{ minHeight: '160px', resize: 'vertical' }}
                        />
                    </div>

                    {!isRecording && !extracting && transcript.trim().length > 0 && (
                        <button type="button" onClick={extractDataFromTranscript} className="btn-primary w-full py-3">
                            <Sparkles className="w-4 h-4" /> Extract data with AI
                        </button>
                    )}

                    {extractionError && (
                        <div className="p-3 rounded-md flex items-start gap-2 text-sm" style={{ background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.15)', color: '#C0392B' }}>
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {extractionError}
                        </div>
                    )}
                </div>
            )}

            {/* Review mode (AI-extracted data) */}
            {step === 'review' && (
                <div className="max-w-2xl">
                    <div className="p-4 rounded-md mb-6" style={{ background: 'rgba(13,115,119,0.06)', border: '1px solid rgba(13,115,119,0.15)' }}>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-4 h-4" style={{ color: '#0D7377' }} />
                            <span className="text-sm font-semibold" style={{ color: '#0D7377' }}>AI-extracted data ready</span>
                        </div>
                        <p className="text-xs" style={{ color: '#6B6B5A' }}>Review and edit before submitting.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Location */}
                        <div className="card-cedar space-y-4">
                            <div className="label-instrument flex items-center gap-1.5"><MapPin className="w-3 h-3" /> LOCATION</div>
                            <button type="button" onClick={detectLocation} disabled={gpsLoading} className="btn-secondary w-full py-2.5 text-xs">
                                {gpsLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Detecting…</> : <><Navigation className="w-3.5 h-3.5" /> Auto-Detect GPS</>}
                            </button>
                            {formData.locationName && (
                                <div className="p-3 rounded-md" style={{ background: 'rgba(13,115,119,0.06)', border: '1px solid rgba(13,115,119,0.1)' }}>
                                    <div className="text-sm font-medium" style={{ color: '#0D7377' }}>{formData.locationName}</div>
                                    <div className="text-xs mt-1" style={{ color: '#9B9B8A', fontFamily: 'var(--font-mono)' }}>
                                        LAT {formData.latitude} · LON {formData.longitude}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Fields with confidence badges */}
                        <div className="card-cedar space-y-4">
                            <div className="label-instrument flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> EXTRACTED FIELDS</div>

                            <Field label="CLIENT_NAME" name="clientName" value={formData.clientName} onChange={handleChange} confidence={confidence.clientName} getConfidenceBadge={getConfidenceBadge} />
                            <Field label="CLIENT_AGE" name="clientAge" value={formData.clientAge} onChange={handleChange} type="number" min="18" max="100" required confidence={confidence.clientAge} getConfidenceBadge={getConfidenceBadge} />
                            <Field label="LOAN_AMT" name="loanAmount" value={formData.loanAmount} onChange={handleChange} type="number" min="50" required prefix="$" confidence={confidence.loanAmount} getConfidenceBadge={getConfidenceBadge} />

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="label-instrument">LOAN_PURPOSE</span>
                                    {confidence.projectType && <ConfidenceBadge {...getConfidenceBadge('projectType')} />}
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {loanPurposes.map(p => (
                                        <button key={p.id} type="button" onClick={() => setFormData(prev => ({ ...prev, loanPurpose: p.id }))}
                                            className={`p-2.5 rounded-md border text-center text-xs font-medium transition-colors cursor-pointer ${formData.loanPurpose === p.id ? 'border-[#0D7377] bg-[rgba(13,115,119,0.06)] text-[#0D7377]' : 'border-[#E0D9CF] text-[#4A4A3F] hover:border-[#C8BFB0]'
                                                }`}>
                                            <span className="text-lg block mb-1">{p.icon}</span>{p.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="EXISTING_LOANS" name="existingLoans" value={formData.existingLoans} onChange={handleChange} type="number" min="0" max="10" required />
                                <Field label="MONTHLY_INC" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleChange} type="number" min="0" prefix="$" />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="label-instrument">REPAYMENT_HIST</span>
                                    <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)', color: '#0D7377' }}>{formData.repaymentHistory}%</span>
                                </div>
                                <input type="range" name="repaymentHistory" value={formData.repaymentHistory} onChange={handleChange} min="0" max="100"
                                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: '#E0D9CF', accentColor: '#0D7377' }} />
                            </div>
                        </div>

                        <button type="submit" disabled={loading || !formData.latitude || !formData.loanPurpose} className="btn-terminal w-full py-3 justify-center disabled:opacity-50">
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</> : <><span style={{ color: '#27AE60' }}>→</span> Run Risk Assessment</>}
                        </button>
                    </form>
                </div>
            )}

            {/* Manual form */}
            {step === 'manual-form' && (
                <div className="max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Location */}
                        <div className="card-cedar space-y-4">
                            <div className="label-instrument flex items-center gap-1.5"><MapPin className="w-3 h-3" /> LOCATION</div>
                            <button type="button" onClick={detectLocation} disabled={gpsLoading} className="btn-secondary w-full py-2.5 text-xs">
                                {gpsLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Detecting…</> : <><Navigation className="w-3.5 h-3.5" /> Auto-Detect GPS</>}
                            </button>
                            {formData.locationName && (
                                <div className="p-3 rounded-md" style={{ background: 'rgba(13,115,119,0.06)', border: '1px solid rgba(13,115,119,0.1)' }}>
                                    <div className="text-sm font-medium" style={{ color: '#0D7377' }}>{formData.locationName}</div>
                                    <div className="text-xs mt-1" style={{ color: '#9B9B8A', fontFamily: 'var(--font-mono)' }}>
                                        LAT {formData.latitude} · LON {formData.longitude}
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="LAT" name="latitude" value={formData.latitude} onChange={handleChange} type="number" step="any" placeholder="-90 to 90" required />
                                <Field label="LON" name="longitude" value={formData.longitude} onChange={handleChange} type="number" step="any" placeholder="-180 to 180" required />
                            </div>
                        </div>

                        {/* Client */}
                        <div className="card-cedar space-y-4">
                            <div className="label-instrument flex items-center gap-1.5"><User className="w-3 h-3" /> CLIENT</div>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="CLIENT_NAME" name="clientName" value={formData.clientName} onChange={handleChange} placeholder="Full name" />
                                <Field label="CLIENT_AGE" name="clientAge" value={formData.clientAge} onChange={handleChange} type="number" min="18" max="100" placeholder="Age" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="EXISTING_LOANS" name="existingLoans" value={formData.existingLoans} onChange={handleChange} type="number" min="0" max="10" required />
                                <Field label="MONTHLY_INC" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleChange} type="number" min="0" prefix="$" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="label-instrument">REPAYMENT_HIST</span>
                                    <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)', color: '#0D7377' }}>{formData.repaymentHistory}%</span>
                                </div>
                                <input type="range" name="repaymentHistory" value={formData.repaymentHistory} onChange={handleChange} min="0" max="100"
                                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: '#E0D9CF', accentColor: '#0D7377' }} />
                            </div>
                        </div>

                        {/* Loan details */}
                        <div className="card-cedar space-y-4">
                            <div className="label-instrument flex items-center gap-1.5"><DollarSign className="w-3 h-3" /> LOAN</div>
                            <Field label="LOAN_AMT" name="loanAmount" value={formData.loanAmount} onChange={handleChange} type="number" min="50" max="50000" required prefix="$" />

                            <div>
                                <span className="label-instrument block mb-2">LOAN_PURPOSE</span>
                                <div className="grid grid-cols-4 gap-2">
                                    {loanPurposes.map(p => (
                                        <button key={p.id} type="button" onClick={() => setFormData(prev => ({ ...prev, loanPurpose: p.id }))}
                                            className={`p-2.5 rounded-md border text-center text-xs font-medium transition-colors cursor-pointer ${formData.loanPurpose === p.id ? 'border-[#0D7377] bg-[rgba(13,115,119,0.06)] text-[#0D7377]' : 'border-[#E0D9CF] text-[#4A4A3F] hover:border-[#C8BFB0]'
                                                }`}>
                                            <span className="text-lg block mb-1">{p.icon}</span>{p.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {(formData.loanPurpose === 'agriculture') && (
                                <div>
                                    <span className="label-instrument block mb-2">CROP_TYPE</span>
                                    <select name="cropType" value={formData.cropType} onChange={handleChange} className="input-cedar text-sm">
                                        <option value="">Select crop type</option>
                                        {cropTypes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={loading || !formData.latitude || !formData.loanPurpose} className="btn-terminal w-full py-3 justify-center disabled:opacity-50">
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</> : <><span style={{ color: '#27AE60' }}>→</span> Run Risk Assessment</>}
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}

// Reusable field component
function Field({ label, name, value, onChange, type = 'text', placeholder, required, min, max, step, prefix, confidence, getConfidenceBadge }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="label-instrument">{label}</span>
                {confidence && getConfidenceBadge && <ConfidenceBadge {...getConfidenceBadge(name)} />}
            </div>
            <div className={prefix ? 'relative' : ''}>
                {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#9B9B8A' }}>{prefix}</span>}
                <input
                    type={type} name={name} value={value} onChange={onChange}
                    placeholder={placeholder} required={required} min={min} max={max} step={step}
                    className="input-cedar text-sm"
                    style={prefix ? { paddingLeft: '2rem' } : {}}
                />
            </div>
        </div>
    )
}

function ConfidenceBadge({ text, color, bg }) {
    return (
        <span className="text-[0.6rem] px-1.5 py-0.5 rounded font-medium" style={{ color, background: bg, fontFamily: 'var(--font-mono)' }}>
            {text}
        </span>
    )
}
