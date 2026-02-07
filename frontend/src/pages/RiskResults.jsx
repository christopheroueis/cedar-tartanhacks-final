import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    ArrowLeft, CheckCircle, AlertTriangle, XCircle, Shield,
    Umbrella, Thermometer, Droplets, TrendingDown, TrendingUp,
    FileText, Calendar, MapPin, DollarSign, ChevronRight
} from 'lucide-react'

// Risk Gauge Component
function RiskGauge({ score }) {
    const rotation = (score / 100) * 180 - 90 // -90deg to 90deg

    const getColor = () => {
        if (score <= 35) return { color: '#10b981', label: 'LOW' }
        if (score <= 65) return { color: '#f59e0b', label: 'MEDIUM' }
        return { color: '#ef4444', label: 'HIGH' }
    }

    const { color, label } = getColor()

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-48 h-24 overflow-hidden">
                {/* Background arc */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-t-full opacity-30"></div>

                {/* Gauge background */}
                <svg className="w-48 h-24" viewBox="0 0 200 100">
                    {/* Background arc */}
                    <path
                        d="M 10 100 A 90 90 0 0 1 190 100"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />
                    {/* Colored arc based on score */}
                    <path
                        d="M 10 100 A 90 90 0 0 1 190 100"
                        fill="none"
                        stroke="url(#gaugeGradient)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${(score / 100) * 283} 283`}
                    />
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Needle */}
                <div
                    className="absolute bottom-0 left-1/2 w-1 h-20 origin-bottom transition-transform duration-1000 ease-out"
                    style={{
                        transform: `translateX(-50%) rotate(${rotation}deg)`,
                        background: 'linear-gradient(to top, white, transparent)'
                    }}
                />

                {/* Center circle */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg" />
            </div>

            {/* Score display */}
            <div className="mt-4 text-center">
                <div className="text-5xl font-bold text-white">{score}</div>
                <div
                    className="text-sm font-semibold tracking-wider mt-1 px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${color}30`, color }}
                >
                    {label} RISK
                </div>
            </div>
        </div>
    )
}

// Default Probability Card
function ProbabilityCard({ baseline, adjusted }) {
    const reduction = ((baseline - adjusted) / baseline * 100).toFixed(0)

    return (
        <div className="card">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Default Probability</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-xl bg-slate-700/50">
                    <p className="text-xs text-slate-400 mb-1">Without Climate Data</p>
                    <p className="text-2xl font-bold text-red-400">{(baseline * 100).toFixed(1)}%</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-teal-500/20 border border-teal-500/30">
                    <p className="text-xs text-teal-300 mb-1">With Modifications</p>
                    <p className="text-2xl font-bold text-teal-400">{(adjusted * 100).toFixed(1)}%</p>
                </div>
            </div>
            {reduction > 0 && (
                <div className="flex items-center justify-center gap-2 mt-3 text-emerald-400 text-sm">
                    <TrendingDown className="w-4 h-4" />
                    <span>{reduction}% risk reduction with recommended modifications</span>
                </div>
            )}
        </div>
    )
}

// Recommendation Card
function RecommendationCard({ type, title, description, details, onAccept }) {
    const configs = {
        approve: {
            icon: CheckCircle,
            bgClass: 'recommendation-approve',
            iconColor: 'text-emerald-400',
            label: 'APPROVE',
            labelBg: 'bg-emerald-500/20 text-emerald-400'
        },
        caution: {
            icon: AlertTriangle,
            bgClass: 'recommendation-caution',
            iconColor: 'text-amber-400',
            label: 'CAUTION',
            labelBg: 'bg-amber-500/20 text-amber-400'
        },
        defer: {
            icon: XCircle,
            bgClass: 'recommendation-defer',
            iconColor: 'text-red-400',
            label: 'DEFER',
            labelBg: 'bg-red-500/20 text-red-400'
        }
    }

    const config = configs[type]
    const Icon = config.icon

    return (
        <div className={`card ${config.bgClass}`}>
            <div className="flex items-start gap-3">
                <Icon className={`w-6 h-6 ${config.iconColor} flex-shrink-0 mt-1`} />
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${config.labelBg}`}>
                            {config.label}
                        </span>
                    </div>
                    <h4 className="text-lg font-semibold text-white">{title}</h4>
                    <p className="text-sm text-slate-300 mt-1">{description}</p>
                </div>
            </div>

            {details && details.length > 0 && (
                <div className="mt-4 space-y-2">
                    {details.map((detail, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                            {detail}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// Climate Risk Factors
function ClimateFactors({ factors }) {
    const factorIcons = {
        flood: { icon: Droplets, label: 'Flood Risk', color: 'text-blue-400' },
        drought: { icon: Thermometer, label: 'Drought Risk', color: 'text-orange-400' },
        heatwave: { icon: Thermometer, label: 'Heat Stress', color: 'text-red-400' },
        insurance: { icon: Shield, label: 'Insurance Available', color: 'text-teal-400' }
    }

    return (
        <div className="card">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Climate Risk Factors</h3>
            <div className="space-y-3">
                {factors.map((factor, i) => {
                    const config = factorIcons[factor.type] || factorIcons.flood
                    const Icon = config.icon
                    return (
                        <div key={i} className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${config.color}`} />
                            <div className="flex-1">
                                <p className="text-sm text-white">{factor.label}</p>
                                <div className="w-full h-2 bg-slate-700 rounded-full mt-1">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500"
                                        style={{ width: `${factor.value * 100}%` }}
                                    />
                                </div>
                            </div>
                            <span className="text-sm font-medium text-slate-300">{(factor.value * 100).toFixed(0)}%</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// Product Recommendations
function ProductRecommendations({ products }) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                <Umbrella className="w-4 h-4" />
                Recommended Products
            </h3>
            {products.map((product, i) => (
                <div key={i} className="card p-4 hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-white">{product.name}</h4>
                            <p className="text-sm text-slate-400">{product.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function RiskResults() {
    const { assessmentId } = useParams()
    const navigate = useNavigate()
    const { mfi } = useAuth()
    const [assessment, setAssessment] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Load assessment data from sessionStorage
        const data = sessionStorage.getItem(`assessment_${assessmentId}`)
        if (data) {
            const parsedData = JSON.parse(data)

            // Check if this is API data (has results property) or demo data
            if (parsedData.results && parsedData.recommendation) {
                // API data structure - use directly
                setAssessment({
                    locationName: parsedData.location?.name || 'Unknown',
                    loanAmount: parsedData.loanDetails?.amount,
                    loanPurpose: parsedData.loanDetails?.purpose,
                    cropType: parsedData.loanDetails?.cropType,
                    climateRiskScore: parsedData.results.climateRiskScore,
                    defaultProbabilityBaseline: parsedData.results.defaultProbability?.unadjusted || 0.2,
                    defaultProbabilityAdjusted: parsedData.results.defaultProbability?.adjusted || 0.15,
                    recommendationType: parsedData.recommendation.type,
                    climateFactors: [
                        { type: 'flood', label: 'Flood Risk', value: parsedData.results.riskFactors?.flood?.value || 0.3 },
                        { type: 'drought', label: 'Drought Risk', value: parsedData.results.riskFactors?.drought?.value || 0.2 },
                        { type: 'heatwave', label: 'Heat Stress', value: parsedData.results.riskFactors?.heatwave?.value || 0.25 }
                    ],
                    products: parsedData.products || [
                        { name: 'Weather-Indexed Insurance', description: 'Automatic payout on adverse weather events' },
                        { name: 'Flexible Repayment', description: 'Grace period during high-risk seasons' }
                    ],
                    recommendation: parsedData.recommendation
                })
            } else {
                // Demo/fallback data - calculate mock values
                const lat = parseFloat(parsedData.latitude || 24)
                let baseClimateRisk = 45
                if (lat > 20 && lat < 30) baseClimateRisk = 62
                if (lat < 0 && lat > -5) baseClimateRisk = 48
                if (lat < -10 && lat > -20) baseClimateRisk = 55
                if (parsedData.cropType === 'rice') baseClimateRisk += 10
                if (parsedData.cropType === 'coffee') baseClimateRisk += 5

                const climateRisk = Math.min(95, Math.max(15, baseClimateRisk + Math.random() * 15 - 7))
                const baselineDefault = 0.15 + (climateRisk / 100) * 0.20
                const adjustedDefault = baselineDefault * 0.65

                let recommendationType = 'approve'
                if (climateRisk > 70) recommendationType = 'defer'
                else if (climateRisk > 50) recommendationType = 'caution'

                setAssessment({
                    ...parsedData,
                    climateRiskScore: Math.round(climateRisk),
                    defaultProbabilityBaseline: baselineDefault,
                    defaultProbabilityAdjusted: adjustedDefault,
                    recommendationType,
                    climateFactors: [
                        { type: 'flood', label: 'Flood Risk (Monsoon)', value: 0.3 + Math.random() * 0.4 },
                        { type: 'drought', label: 'Drought Risk', value: 0.1 + Math.random() * 0.3 },
                        { type: 'heatwave', label: 'Heat Stress', value: 0.2 + Math.random() * 0.3 }
                    ],
                    products: [
                        { name: 'Weather-Indexed Insurance', description: 'Automatic payout on adverse weather' },
                        { name: 'Flexible Repayment Schedule', description: 'Grace period during monsoon' },
                        { name: 'Climate Resilience Training', description: 'Agricultural best practices' }
                    ]
                })
            }
        }
        setLoading(false)
    }, [assessmentId])

    const handleAcceptRecommendation = () => {
        // In production, save the decision to backend
        navigate('/history')
    }

    const handleOverride = () => {
        // Show override modal or navigate
        navigate('/history')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!assessment) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6">
                <XCircle className="w-16 h-16 text-red-400 mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Assessment Not Found</h2>
                <p className="text-slate-400 mb-6">This assessment may have expired or doesn't exist.</p>
                <Link to="/" className="px-6 py-3 bg-teal-500 text-white rounded-xl font-medium">
                    Start New Assessment
                </Link>
            </div>
        )
    }

    const recommendationConfigs = {
        approve: {
            title: 'Approve with Climate Modifications',
            description: 'This loan has acceptable risk with recommended climate-smart modifications.',
            details: [
                'Attach weather-indexed insurance requirement',
                'Include flexible monsoon grace period',
                'Schedule mid-term climate check-in'
            ]
        },
        caution: {
            title: 'Approve with Enhanced Monitoring',
            description: 'Moderate climate risk detected. Enhanced oversight recommended.',
            details: [
                'Mandatory crop insurance coverage',
                'Quarterly loan review during peak season',
                'Reduced initial loan amount (consider 70%)',
                'Climate resilience training required'
            ]
        },
        defer: {
            title: 'Defer - High Climate Risk',
            description: 'Significant climate exposure detected. Additional review needed.',
            details: [
                'Request senior officer review',
                'Consider alternative loan structure',
                'Explore government subsidy programs',
                'Recommend client climate adaptation plan'
            ]
        }
    }

    const recConfig = recommendationConfigs[assessment.recommendationType]

    return (
        <div className="min-h-screen pb-32">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-lg border-b border-slate-700/50">
                <div className="flex items-center gap-3 px-4 py-3">
                    <button
                        onClick={() => navigate('/')}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 text-slate-300"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-white">Risk Assessment</h1>
                        <p className="text-xs text-slate-400">{mfi?.name}</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="px-4 py-6 space-y-6 max-w-lg mx-auto">

                {/* Summary Card */}
                <div className="card text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-4">
                        <MapPin className="w-4 h-4" />
                        <span>{assessment.locationName || 'Location'}</span>
                        <span className="mx-2">•</span>
                        <DollarSign className="w-4 h-4" />
                        <span>${parseFloat(assessment.loanAmount).toLocaleString()}</span>
                    </div>

                    {/* Risk Gauge */}
                    <RiskGauge score={assessment.climateRiskScore} />

                    <p className="text-sm text-slate-400 mt-4">
                        Climate Risk Score based on historical weather data and predictive modeling
                    </p>
                </div>

                {/* Default Probability */}
                <ProbabilityCard
                    baseline={assessment.defaultProbabilityBaseline}
                    adjusted={assessment.defaultProbabilityAdjusted}
                />

                {/* Recommendation */}
                <RecommendationCard
                    type={assessment.recommendationType}
                    {...recConfig}
                />

                {/* Climate Factors */}
                <ClimateFactors factors={assessment.climateFactors} />

                {/* Product Recommendations */}
                <ProductRecommendations products={assessment.products} />

            </main>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50">
                <div className="flex gap-3 max-w-lg mx-auto">
                    <button
                        onClick={handleOverride}
                        className="flex-1 py-4 px-6 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
                    >
                        Override
                    </button>
                    <button
                        onClick={handleAcceptRecommendation}
                        className="flex-[2] py-4 px-6 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 
                       text-white font-semibold rounded-xl shadow-lg shadow-teal-500/30 transition-all active:scale-[0.98]"
                    >
                        Accept Recommendation
                    </button>
                </div>
            </div>
        </div>
    )
}
