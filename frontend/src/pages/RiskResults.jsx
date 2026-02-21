import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import {
  CheckCircle, AlertTriangle, XCircle, Droplets, Thermometer,
  MapPin, DollarSign, ChevronDown, ChevronUp, Download, ArrowLeft
} from 'lucide-react'

// Radial gauge component
function RiskGauge({ score, size = 180 }) {
  const radius = (size - 20) / 2
  const circumference = Math.PI * radius
  const dashOffset = circumference - (score / 100) * circumference

  const getColor = () => {
    if (score <= 35) return '#27AE60'
    if (score <= 65) return '#E67E22'
    return '#C0392B'
  }

  const getLabel = () => {
    if (score <= 35) return 'LOW RISK'
    if (score <= 65) return 'MODERATE'
    return 'HIGH RISK'
  }

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
        {/* Track */}
        <path
          d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
          className="risk-gauge-track"
        />
        {/* Fill */}
        <path
          d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
          className="risk-gauge-fill"
          style={{
            stroke: getColor(),
            strokeDasharray: circumference,
            strokeDashoffset: dashOffset,
          }}
        />
        {/* Score text */}
        <text x={size / 2} y={size / 2 - 5} textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: '2.2rem', fontWeight: 700, fill: '#1A1A18' }}>
          {score}
        </text>
        <text x={size / 2} y={size / 2 + 18} textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.1em', fill: '#6B6B5A' }}>
          / 100
        </text>
      </svg>
      <div className="text-xs font-medium mt-1 px-3 py-1 rounded" style={{ fontFamily: 'var(--font-mono)', color: getColor(), background: `${getColor()}12`, letterSpacing: '0.06em' }}>
        {getLabel()}
      </div>
    </div>
  )
}

// Risk factor bar
function RiskFactorBar({ label, value, icon: Icon }) {
  const percent = Math.round(value * 100)
  const getLevel = () => percent > 60 ? 'high' : percent > 35 ? 'medium' : 'low'
  const getColor = () => percent > 60 ? '#C0392B' : percent > 35 ? '#E67E22' : '#27AE60'

  return (
    <div className="flex items-center gap-4 py-3" style={{ borderBottom: '1px solid #F0EBE2' }}>
      <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ background: `${getColor()}10` }}>
        <Icon className="w-4 h-4" style={{ color: getColor() }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium" style={{ color: '#4A4A3F' }}>{label}</span>
          <span className="text-xs font-semibold" style={{ fontFamily: 'var(--font-mono)', color: getColor() }}>{percent}%</span>
        </div>
        <div className="risk-bar-track">
          <motion.div
            className={`risk-bar-fill ${getLevel()}`}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </div>
  )
}

// Default probability bar
function DefaultProbBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs w-28 shrink-0" style={{ color: '#6B6B5A' }}>{label}</span>
      <div className="flex-1 risk-bar-track">
        <motion.div className="risk-bar-fill" initial={{ width: 0 }} animate={{ width: `${value * 100}%` }} transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} style={{ background: color }} />
      </div>
      <span className="text-xs font-semibold w-10 text-right" style={{ fontFamily: 'var(--font-mono)', color }}>{Math.round(value * 100)}%</span>
    </div>
  )
}

const recConfig = {
  approve: { icon: CheckCircle, label: 'Approve', sublabel: 'with climate-adaptive terms', color: '#27AE60', bg: 'rgba(39,174,96,0.06)', border: '#27AE60' },
  caution: { icon: AlertTriangle, label: 'Review', sublabel: 'additional safeguards recommended', color: '#E67E22', bg: 'rgba(230,126,34,0.06)', border: '#E67E22' },
  defer: { icon: XCircle, label: 'Defer', sublabel: 'high climate risk — restructure required', color: '#C0392B', bg: 'rgba(192,57,43,0.06)', border: '#C0392B' }
}

const recActions = {
  approve: ['Bundle flood insurance', 'Defer 1st payment to post-season', 'Extend term to 15 months'],
  caution: ['Mandatory crop insurance', 'Quarterly review during peak season', 'Consider 70% of requested amount'],
  defer: ['Request senior officer review', 'Explore alternative loan structure', 'Recommend client adaptation plan']
}

export default function RiskResults() {
  const { assessmentId } = useParams()
  const navigate = useNavigate()
  const { mfi } = useAuth()
  const [assessment, setAssessment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandAnalysis, setExpandAnalysis] = useState(true)

  useEffect(() => {
    const data = sessionStorage.getItem(`assessment_${assessmentId}`)
    if (data) {
      const parsedData = JSON.parse(data)
      if (parsedData.results && parsedData.recommendation) {
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
            { type: 'flood', label: 'Flood Risk (Monsoon)', value: parsedData.results.riskFactors?.flood?.value || 0.3, icon: Droplets },
            { type: 'drought', label: 'Drought Risk', value: parsedData.results.riskFactors?.drought?.value || 0.2, icon: Thermometer },
            { type: 'heatwave', label: 'Heat Stress', value: parsedData.results.riskFactors?.heatwave?.value || 0.25, icon: Thermometer }
          ],
          products: parsedData.products || [
            { name: 'Weather-Indexed Insurance', description: 'Automatic payout on adverse weather' },
            { name: 'Flexible Repayment', description: 'Grace period during high-risk seasons' }
          ],
          recommendation: parsedData.recommendation
        })
      } else {
        const lat = parseFloat(parsedData.latitude || 24)
        let baseClimateRisk = 45
        if (lat > 20 && lat < 30) baseClimateRisk = 62
        if (lat < 0 && lat > -5) baseClimateRisk = 48
        if (lat < -10 && lat > -20) baseClimateRisk = 55
        if (parsedData.cropType === 'rice') baseClimateRisk += 10
        if (parsedData.cropType === 'coffee') baseClimateRisk += 5
        const climateRisk = Math.min(95, Math.max(15, baseClimateRisk + Math.random() * 15 - 7))
        const baselineDefault = 0.15 + (climateRisk / 100) * 0.2
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
            { type: 'flood', label: 'Flood Risk (Monsoon)', value: 0.3 + Math.random() * 0.4, icon: Droplets },
            { type: 'drought', label: 'Drought Risk', value: 0.1 + Math.random() * 0.3, icon: Thermometer },
            { type: 'heatwave', label: 'Heat Stress', value: 0.2 + Math.random() * 0.3, icon: Thermometer }
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

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="skeleton-cedar w-10 h-10 rounded-full" /></div>
  }

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <XCircle className="w-12 h-12 mb-4" style={{ color: '#C0392B' }} />
        <h2 className="text-lg font-semibold mb-2" style={{ color: '#1A1A18' }}>Assessment not found</h2>
        <p className="text-sm mb-6" style={{ color: '#6B6B5A' }}>This assessment may have expired.</p>
        <Link to="/app" className="btn-primary">New assessment</Link>
      </div>
    )
  }

  const config = recConfig[assessment.recommendationType]
  const Icon = config.icon
  const actions = recActions[assessment.recommendationType]
  const purposeLabels = { agriculture: 'Agriculture', livestock: 'Livestock', small_business: 'Small Business', housing: 'Housing' }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="label-instrument mb-1">RISK ASSESSMENT</div>
          <h1 className="text-xl tracking-tight" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A1A18' }}>
            Assessment Results
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/app')} className="btn-secondary text-xs py-2 px-4">
            <ArrowLeft className="w-3.5 h-3.5" /> New
          </button>
          <button className="btn-secondary text-xs py-2 px-4">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Three-panel layout */}
      <div className="grid grid-cols-3 gap-5">

        {/* LEFT — Property metadata */}
        <div className="space-y-4">
          <div className="card-cedar">
            <div className="label-instrument mb-3">PROPERTY DATA</div>
            <div className="space-y-3">
              <DataRow label="LOCATION" value={assessment.locationName} />
              <DataRow label="COORDINATES" value={`${assessment.latitude || '—'}, ${assessment.longitude || '—'}`} mono />
              <DataRow label="LOAN_AMT" value={assessment.loanAmount ? `$${Number(assessment.loanAmount).toLocaleString()}` : '—'} mono />
              <DataRow label="PURPOSE" value={purposeLabels[assessment.loanPurpose] || assessment.loanPurpose || '—'} />
              {assessment.cropType && <DataRow label="CROP" value={assessment.cropType} />}
            </div>
          </div>

          {/* Recommendation card */}
          <div className="card-cedar" style={{ borderLeft: `3px solid ${config.border}`, background: config.bg }}>
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: config.color }} />
              <div>
                <div className="label-instrument mb-1">RECOMMENDATION</div>
                <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: config.color }}>{config.label}</div>
                <p className="text-xs mt-1" style={{ color: '#6B6B5A' }}>{config.sublabel}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER — Risk gauge */}
        <div className="space-y-4">
          <div className="card-cedar flex flex-col items-center py-6">
            <div className="label-instrument mb-4">CLIMATE RISK SCORE</div>
            <RiskGauge score={assessment.climateRiskScore} />
          </div>

          {/* Default probability */}
          <div className="card-cedar">
            <div className="label-instrument mb-3">DEFAULT PROBABILITY</div>
            <DefaultProbBar label="Without climate" value={assessment.defaultProbabilityBaseline} color="#C0392B" />
            <DefaultProbBar label="With climate adj." value={assessment.defaultProbabilityAdjusted} color="#0D7377" />
            <div className="mt-3 text-xs px-2 py-1.5 rounded" style={{ background: 'rgba(13,115,119,0.06)', color: '#0D7377', fontFamily: 'var(--font-mono)' }}>
              ↓ {Math.round((1 - assessment.defaultProbabilityAdjusted / assessment.defaultProbabilityBaseline) * 100)}% reduction with recommended modifications
            </div>
          </div>
        </div>

        {/* RIGHT — Risk factors */}
        <div className="space-y-4">
          <div className="card-cedar">
            <div className="label-instrument mb-3">RISK FACTORS</div>
            {assessment.climateFactors.map((f, i) => (
              <RiskFactorBar
                key={f.type}
                label={f.label}
                value={f.value}
                icon={f.icon || Droplets}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="card-cedar">
            <div className="label-instrument mb-3">REQUIRED ACTIONS</div>
            <div className="space-y-2">
              {actions.map((action, i) => (
                <label key={i} className="flex items-start gap-2.5 py-1.5 text-sm cursor-pointer" style={{ color: '#4A4A3F' }}>
                  <input type="checkbox" className="mt-0.5 accent-[#0D7377]" />
                  {action}
                </label>
              ))}
            </div>
          </div>

          {/* Products */}
          <div className="card-cedar">
            <div className="label-instrument mb-3">SUGGESTED PRODUCTS</div>
            <div className="space-y-2">
              {assessment.products.map((p, i) => (
                <div key={i} className="py-2" style={{ borderBottom: i < assessment.products.length - 1 ? '1px solid #F0EBE2' : 'none' }}>
                  <div className="text-sm font-medium" style={{ color: '#1A1A18' }}>{p.name}</div>
                  <div className="text-xs" style={{ color: '#9B9B8A' }}>{p.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DataRow({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between py-1.5" style={{ borderBottom: '1px solid #F0EBE2' }}>
      <span className="label-instrument shrink-0">{label}</span>
      <span className={`text-sm text-right ${mono ? '' : ''}`}
        style={{ color: '#1A1A18', fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', maxWidth: '60%', wordBreak: 'break-word' }}>
        {value}
      </span>
    </div>
  )
}
