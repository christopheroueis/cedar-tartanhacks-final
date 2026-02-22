import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import {
  CheckCircle, AlertTriangle, XCircle, Droplets, Thermometer,
  DollarSign, Download, ArrowLeft, Flame, Mountain,
  Shield, RefreshCw, Leaf,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

/* ─── Impact badge ─── */
function ImpactBadge({ level }) {
  const map = {
    Low:    { bg: 'rgba(39,174,96,0.10)',  color: '#27AE60' },
    Medium: { bg: 'rgba(230,126,34,0.10)', color: '#E67E22' },
    High:   { bg: 'rgba(192,57,43,0.10)',  color: '#C0392B' },
  }
  const { bg, color } = map[level] || map.Medium
  return (
    <span
      className="text-xs px-2 py-0.5 rounded font-medium shrink-0"
      style={{ background: bg, color, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}
    >
      {level.toUpperCase()}
    </span>
  )
}

/* ─── Radial gauge (semicircle) ─── */
function RiskGauge({ score, size = 200 }) {
  const radius = (size - 24) / 2
  const circumference = Math.PI * radius
  const dashOffset = circumference - (score / 100) * circumference
  const color = score <= 35 ? '#27AE60' : score <= 65 ? '#E67E22' : '#C0392B'
  const label = score <= 35 ? 'LOW RISK' : score <= 65 ? 'MODERATE' : 'HIGH RISK'

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 38} viewBox={`0 0 ${size} ${size / 2 + 38}`}>
        <path
          d={`M 12 ${size / 2 + 12} A ${radius} ${radius} 0 0 1 ${size - 12} ${size / 2 + 12}`}
          fill="none" stroke="#F0EBE2" strokeWidth="10" strokeLinecap="round"
        />
        <motion.path
          d={`M 12 ${size / 2 + 12} A ${radius} ${radius} 0 0 1 ${size - 12} ${size / 2 + 12}`}
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
        <text x={size / 2} y={size / 2 - 2} textAnchor="middle"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '2.8rem', fontWeight: 700, fill: '#1A1A18' }}>
          {score}
        </text>
        <text x={size / 2} y={size / 2 + 20} textAnchor="middle"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fill: '#9B9B8A', letterSpacing: '0.08em' }}>
          OUT OF 100
        </text>
      </svg>
      <div className="text-xs font-semibold px-4 py-1.5 rounded-full"
        style={{ fontFamily: 'var(--font-mono)', color, background: `${color}14`, letterSpacing: '0.08em' }}>
        {label}
      </div>
    </div>
  )
}

/* ─── Category bar ─── */
function CategoryBar({ label, value, icon: Icon, color }) {
  const pct = Math.round(value * 100)
  return (
    <div className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid #F0EBE2' }}>
      <div className="w-7 h-7 rounded flex items-center justify-center shrink-0"
        style={{ background: `${color}14` }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium" style={{ color: '#4A4A3F' }}>{label}</span>
          <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-mono)', color }}>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: '#F0EBE2' }}>
          <motion.div className="h-full rounded-full" style={{ background: color }}
            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} />
        </div>
      </div>
    </div>
  )
}

/* ─── Default probability bar ─── */
function DefaultProbBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs w-28 shrink-0" style={{ color: '#6B6B5A' }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: '#F0EBE2' }}>
        <motion.div className="h-full rounded-full" style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.55, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} />
      </div>
      <span className="text-xs font-semibold w-10 text-right"
        style={{ fontFamily: 'var(--font-mono)', color }}>
        {Math.round(value * 100)}%
      </span>
    </div>
  )
}

/* ─── Recommendation card ─── */
function RecCard({ title, detail, impact, reduction, icon: Icon, delay = 0 }) {
  const iconColor = impact === 'High' ? '#C0392B' : impact === 'Medium' ? '#E67E22' : '#27AE60'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-start gap-3 p-3 rounded-lg"
      style={{ background: '#FAFAF7', border: '1px solid #F0EBE2' }}
    >
      <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: `${iconColor}12` }}>
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="text-sm font-semibold leading-snug" style={{ color: '#1A1A18' }}>{title}</span>
          <ImpactBadge level={impact} />
        </div>
        <p className="text-xs leading-relaxed" style={{ color: '#6B6B5A' }}>{detail}</p>
        {reduction != null && (
          <div className="mt-1.5 text-xs font-medium"
            style={{ color: '#0D7377', fontFamily: 'var(--font-mono)' }}>
            ↓ {reduction}% estimated risk reduction
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ─── Verdict config ─── */
const recConfig = {
  approve: { icon: CheckCircle, label: 'Approve',  sublabel: 'with climate-adaptive terms',              color: '#27AE60', bg: 'rgba(39,174,96,0.05)',   border: '#27AE60' },
  caution: { icon: AlertTriangle, label: 'Caution', sublabel: 'additional safeguards recommended',       color: '#E67E22', bg: 'rgba(230,126,34,0.05)',  border: '#E67E22' },
  defer:   { icon: XCircle, label: 'Defer',         sublabel: 'high climate risk — restructure required', color: '#C0392B', bg: 'rgba(192,57,43,0.05)',   border: '#C0392B' },
}

/* ─── Trend data (deterministic from score) ─── */
function buildTrend(score) {
  const years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025']
  const base = score * 0.52
  return years.map((year, i) => ({
    year,
    risk: Math.round(Math.min(95, Math.max(8,
      base + (i / 6) * score * 0.52 + Math.sin(i * 1.4) * 5
    )))
  }))
}

/* ─── Smart recommendations (derived from categories) ─── */
function buildRecs(categories) {
  if (!categories.length) return []
  const flood = categories.find(c => c.label === 'Flood Risk')?.value        || 0
  const fire  = categories.find(c => c.label === 'Fire & Heat')?.value       || 0
  const soil  = categories.find(c => c.label === 'Soil Stability')?.value    || 0
  const fin   = categories.find(c => c.label === 'Financial Exposure')?.value || 0

  const recs = []

  if (flood > 0.35) recs.push({
    title: 'Require weather-indexed insurance',
    detail: 'Mandate WII coverage that triggers automatic payouts during flood events exceeding 150 mm/month, protecting both borrower income and loan repayment.',
    impact: flood > 0.65 ? 'High' : 'Medium',
    reduction: Math.round(flood * 22),
    icon: Shield,
  })

  if (flood > 0.28) recs.push({
    title: 'Defer first repayment to post-season',
    detail: 'Shift the initial payment date past peak monsoon or rainy season to reduce default pressure during the highest-risk months.',
    impact: 'Medium',
    reduction: 12,
    icon: RefreshCw,
  })

  if (fire > 0.38) recs.push({
    title: 'Vegetation & fire management plan',
    detail: 'Require a 10 m cleared buffer zone and demonstrated access to fire-suppression resources as a disbursement condition.',
    impact: fire > 0.6 ? 'High' : 'Medium',
    reduction: Math.round(fire * 18),
    icon: Flame,
  })

  if (soil > 0.45) recs.push({
    title: 'Commission soil stability assessment',
    detail: 'Engage an independent geotechnical review. If erosion risk is confirmed, require drainage improvements before loan activation.',
    impact: 'Medium',
    reduction: 8,
    icon: Mountain,
  })

  if (fin > 0.4) recs.push({
    title: 'Staggered disbursement schedule',
    detail: 'Release 40% at signing, 35% at mid-season, and 25% upon successful first-harvest confirmation to limit exposure.',
    impact: fin > 0.62 ? 'High' : 'Medium',
    reduction: Math.round(fin * 15),
    icon: DollarSign,
  })

  if (recs.length < 3) recs.push({
    title: 'Enroll in climate adaptation training',
    detail: 'Recommend a 2-session regional agricultural resilience workshop to improve the borrower\'s adaptive capacity and reduce long-term risk.',
    impact: 'Low',
    reduction: 5,
    icon: Leaf,
  })

  return recs.slice(0, 5)
}

/* ─── Main component ─── */
export default function RiskResults() {
  const { assessmentId } = useParams()
  const navigate = useNavigate()
  const { mfi } = useAuth()
  const [assessment, setAssessment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const data = sessionStorage.getItem(`assessment_${assessmentId}`)
    if (data) {
      const d = JSON.parse(data)
      if (d.results && d.recommendation) {
        setAssessment({
          locationName: d.location?.name || 'Unknown',
          loanAmount: d.loanDetails?.amount,
          loanPurpose: d.loanDetails?.purpose,
          cropType: d.loanDetails?.cropType,
          soilType: d.soilType,
          latitude: d.latitude,
          longitude: d.longitude,
          climateRiskScore: d.results.climateRiskScore,
          defaultProbabilityBaseline: d.results.defaultProbability?.unadjusted || 0.2,
          defaultProbabilityAdjusted: d.results.defaultProbability?.adjusted || 0.15,
          recommendationType: d.recommendation.type,
          climateFactors: [
            { type: 'flood',    value: d.results.riskFactors?.flood?.value    || 0.30 },
            { type: 'drought',  value: d.results.riskFactors?.drought?.value  || 0.20 },
            { type: 'heatwave', value: d.results.riskFactors?.heatwave?.value || 0.25 },
          ],
          products: d.products || [
            { name: 'Weather-Indexed Insurance', description: 'Automatic payout on adverse weather events' },
            { name: 'Flexible Repayment',        description: 'Grace period aligned with seasonal income' },
          ],
        })
      } else {
        const lat = parseFloat(d.latitude || 24)
        let base = 45
        if (lat > 20 && lat < 30) base = 62
        if (lat < 0 && lat > -5) base = 48
        if (d.cropType === 'rice') base += 10
        if (d.cropType === 'coffee') base += 5
        const climateRisk = Math.min(95, Math.max(15, base + 5))
        const baselineDefault = 0.15 + (climateRisk / 100) * 0.2
        const adjustedDefault = baselineDefault * 0.65
        const recommendationType = climateRisk > 70 ? 'defer' : climateRisk > 50 ? 'caution' : 'approve'
        setAssessment({
          ...d,
          climateRiskScore: Math.round(climateRisk),
          defaultProbabilityBaseline: baselineDefault,
          defaultProbabilityAdjusted: adjustedDefault,
          recommendationType,
          climateFactors: [
            { type: 'flood',    value: 0.50 },
            { type: 'drought',  value: 0.25 },
            { type: 'heatwave', value: 0.35 },
          ],
          products: [
            { name: 'Weather-Indexed Insurance',    description: 'Automatic payout on adverse weather events' },
            { name: 'Flexible Repayment Schedule',  description: 'Grace period aligned with peak monsoon' },
            { name: 'Climate Resilience Training',  description: 'Agricultural best-practice workshops' },
          ],
        })
      }
    }
    setLoading(false)
  }, [assessmentId])

  /* derived data */
  const categories = useMemo(() => {
    if (!assessment) return []
    const floodVal   = assessment.climateFactors?.find(f => f.type === 'flood')?.value    ?? 0.40
    const droughtVal = assessment.climateFactors?.find(f => f.type === 'drought')?.value  ?? 0.20
    const heatVal    = assessment.climateFactors?.find(f => f.type === 'heatwave')?.value ?? 0.25
    const fireVal    = Math.min(0.92, (droughtVal * 0.65 + heatVal * 0.55) / 0.60)
    const soilMap    = { sandy: 0.68, clay: 0.42, loam: 0.18, silt: 0.32, rocky: 0.28, alluvial: 0.35 }
    const soilRaw    = (assessment.soilType || '').toLowerCase()
    const soilVal    = Object.entries(soilMap).find(([k]) => soilRaw.includes(k))?.[1] ?? 0.42
    const adjDef     = assessment.defaultProbabilityAdjusted || 0.15
    const loanAmt    = parseFloat(assessment.loanAmount || 0)
    const finVal     = Math.min(0.88, adjDef * 3.2 + (loanAmt > 5000 ? 0.08 : 0))
    return [
      { label: 'Flood Risk',         value: floodVal, icon: Droplets,   color: '#2980B9' },
      { label: 'Fire & Heat',        value: fireVal,  icon: Flame,      color: '#E67E22' },
      { label: 'Soil Stability',     value: soilVal,  icon: Mountain,   color: '#8B6914' },
      { label: 'Financial Exposure', value: finVal,   icon: DollarSign, color: '#9B59B6' },
    ]
  }, [assessment])

  const trendData = useMemo(() => assessment ? buildTrend(assessment.climateRiskScore) : [], [assessment])
  const smartRecs = useMemo(() => buildRecs(categories), [categories])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 rounded-full skeleton-cedar" />
    </div>
  )

  if (!assessment) return (
    <div className="flex flex-col items-center justify-center py-20">
      <XCircle className="w-12 h-12 mb-4" style={{ color: '#C0392B' }} />
      <h2 className="text-lg font-semibold mb-2" style={{ color: '#1A1A18' }}>Assessment not found</h2>
      <p className="text-sm mb-6" style={{ color: '#6B6B5A' }}>This assessment may have expired.</p>
      <Link to="/app" className="btn-primary">New assessment</Link>
    </div>
  )

  const config = recConfig[assessment.recommendationType] || recConfig.caution
  const VerdictIcon = config.icon
  const reduction = Math.round((1 - assessment.defaultProbabilityAdjusted / assessment.defaultProbabilityBaseline) * 100)
  const purposeLabels = { agriculture: 'Agriculture', livestock: 'Livestock', small_business: 'Small Business', housing: 'Housing' }
  const loanAdj = assessment.recommendationType === 'defer' ? '0 – 50%' : assessment.recommendationType === 'caution' ? '70 – 85%' : '100%'
  const gaugeColor = assessment.climateRiskScore > 65 ? '#C0392B' : assessment.climateRiskScore > 35 ? '#E67E22' : '#27AE60'
  const floodHigh = categories.find(c => c.label === 'Flood Risk')?.value > 0.5

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="label-instrument mb-1">RISK ASSESSMENT · {assessmentId?.slice(-6).toUpperCase()}</div>
          <h1 className="text-xl tracking-tight" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A1A18' }}>
            Assessment Results
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Refine Inputs
          </button>
          <button
            onClick={() => navigate('/app')}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> New Assessment
          </button>
          <button className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
        </div>
      </div>

      {/* ── Row 1: Score | Categories | Verdict + Property ── */}
      <div className="grid grid-cols-3 gap-5">

        {/* Score gauge */}
        <div className="card-cedar flex flex-col items-center py-6">
          <div className="label-instrument mb-4">CLIMATE RISK SCORE</div>
          <RiskGauge score={assessment.climateRiskScore} size={200} />
          <div className="w-full mt-5 space-y-0.5">
            <DefaultProbBar label="Baseline default" value={assessment.defaultProbabilityBaseline} color="#C0392B" />
            <DefaultProbBar label="Adjusted default" value={assessment.defaultProbabilityAdjusted} color="#0D7377" />
          </div>
          <div className="mt-3 w-full text-xs px-3 py-2 rounded-md text-center"
            style={{ background: 'rgba(13,115,119,0.07)', color: '#0D7377', fontFamily: 'var(--font-mono)' }}>
            ↓ {reduction}% default risk reduction with recommended terms
          </div>
        </div>

        {/* Category breakdown */}
        <div className="card-cedar">
          <div className="label-instrument mb-3">RISK CATEGORIES</div>
          {categories.map(cat => <CategoryBar key={cat.label} {...cat} />)}
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid #F0EBE2' }}>
            <div className="label-instrument mb-2">PRIMARY DRIVERS</div>
            {categories
              .filter(c => c.value > 0.4)
              .sort((a, b) => b.value - a.value)
              .slice(0, 2)
              .map(c => (
                <div key={c.label} className="flex items-center gap-2 py-1 text-xs" style={{ color: '#4A4A3F' }}>
                  <c.icon className="w-3 h-3 shrink-0" style={{ color: c.color }} />
                  <span>{c.label} at <strong style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(c.value * 100)}%</strong></span>
                </div>
              ))
            }
            {categories.filter(c => c.value > 0.4).length === 0 && (
              <div className="text-xs" style={{ color: '#9B9B8A' }}>No major risk drivers identified.</div>
            )}
          </div>
        </div>

        {/* Verdict + property data */}
        <div className="space-y-4">
          <div className="card-cedar"
            style={{ borderLeft: `3px solid ${config.border}`, background: config.bg }}>
            <div className="flex items-start gap-3">
              <VerdictIcon className="w-6 h-6 shrink-0 mt-0.5" style={{ color: config.color }} />
              <div>
                <div className="label-instrument mb-1">RECOMMENDATION</div>
                <div className="text-2xl font-bold mb-1"
                  style={{ fontFamily: 'var(--font-display)', color: config.color }}>
                  {config.label}
                </div>
                <p className="text-xs" style={{ color: '#6B6B5A' }}>{config.sublabel}</p>
              </div>
            </div>
          </div>

          <div className="card-cedar">
            <div className="label-instrument mb-3">PROPERTY DATA</div>
            <DataRow label="LOCATION"  value={assessment.locationName} />
            <DataRow label="LOAN AMT"  value={assessment.loanAmount ? `$${Number(assessment.loanAmount).toLocaleString()}` : '—'} mono />
            <DataRow label="PURPOSE"   value={purposeLabels[assessment.loanPurpose] || assessment.loanPurpose || '—'} />
            {assessment.cropType && <DataRow label="CROP"  value={assessment.cropType} />}
            {assessment.soilType && <DataRow label="SOIL"  value={assessment.soilType} />}
          </div>
        </div>
      </div>

      {/* ── Row 2: Risk trend chart ── */}
      <div className="card-cedar">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="label-instrument mb-1">CLIMATE RISK TRAJECTORY</div>
            <p className="text-xs" style={{ color: '#9B9B8A' }}>
              Historical + projected risk score (2019 – 2025)
            </p>
          </div>
          <div className="text-xs px-2 py-1 rounded"
            style={{ background: '#F0EBE2', color: '#6B6B5A', fontFamily: 'var(--font-mono)' }}>
            Current: {assessment.climateRiskScore} / 100
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={trendData} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={gaugeColor} stopOpacity={0.22} />
                <stop offset="95%" stopColor={gaugeColor} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE2" vertical={false} />
            <XAxis dataKey="year"
              tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: '#9B9B8A' }}
              axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]}
              tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: '#9B9B8A' }}
              axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                background: '#FAFAF7', border: '1px solid #F0EBE2', borderRadius: '6px',
              }}
              formatter={(v) => [`${v}`, 'Risk Score']}
            />
            <Area type="monotone" dataKey="risk"
              stroke={gaugeColor} strokeWidth={2}
              fill="url(#riskGrad)" dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Row 3: Smart Recommendations | Financial Insights ── */}
      <div className="grid grid-cols-2 gap-5">

        {/* Smart recommendations */}
        <div className="card-cedar">
          <div className="label-instrument mb-3">SMART RECOMMENDATIONS</div>
          <div className="space-y-2.5">
            {smartRecs.map((rec, i) => (
              <RecCard key={i} {...rec} delay={i * 0.06} />
            ))}
          </div>
        </div>

        {/* Financial insights + suggested products */}
        <div className="space-y-4">
          <div className="card-cedar">
            <div className="label-instrument mb-4">FINANCIAL INSIGHTS</div>

            <div className="mb-4">
              <div className="text-xs font-semibold mb-1" style={{ color: '#4A4A3F' }}>
                Suggested Disbursement
              </div>
              <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#1A1A18' }}>
                {loanAdj} of requested
              </div>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: '#9B9B8A' }}>
                {assessment.recommendationType === 'defer'
                  ? 'Requires senior officer review and loan restructure before any disbursement.'
                  : assessment.recommendationType === 'caution'
                  ? 'Reduced initial disbursement limits exposure during peak climate risk months.'
                  : 'Full disbursement supported under climate-adaptive loan terms.'}
              </p>
            </div>

            <div className="pt-3 mb-4" style={{ borderTop: '1px solid #F0EBE2' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: '#4A4A3F' }}>
                Insurance Recommendation
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#6B6B5A' }}>
                {floodHigh
                  ? 'High flood risk detected. Weather-indexed insurance (WII) is strongly recommended and should be a mandatory loan condition.'
                  : 'Standard crop or property insurance is sufficient. WII can be offered as an optional add-on for lower-risk profiles.'}
              </p>
            </div>

            <div className="pt-3" style={{ borderTop: '1px solid #F0EBE2' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: '#4A4A3F' }}>
                Long-Term Exposure Outlook
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#6B6B5A' }}>
                {assessment.climateRiskScore > 65
                  ? 'Climate risk in this region is projected to intensify. Loans exceeding 18 months carry elevated tail risk — consider shorter terms or annual reviews.'
                  : assessment.climateRiskScore > 40
                  ? 'Risk is moderate and relatively stable. Annual climate condition reviews are recommended for multi-year loan structures.'
                  : 'Low long-term risk profile. Standard loan terms and review cycles are appropriate for this borrower.'}
              </p>
            </div>
          </div>

          <div className="card-cedar">
            <div className="label-instrument mb-3">SUGGESTED PRODUCTS</div>
            <div className="space-y-2">
              {assessment.products?.map((p, i) => (
                <div key={i} className="py-2"
                  style={{ borderBottom: i < assessment.products.length - 1 ? '1px solid #F0EBE2' : 'none' }}>
                  <div className="text-sm font-medium" style={{ color: '#1A1A18' }}>{p.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#9B9B8A' }}>{p.description}</div>
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
      <span className="text-sm text-right"
        style={{ color: '#1A1A18', fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', maxWidth: '60%', wordBreak: 'break-word' }}>
        {value}
      </span>
    </div>
  )
}
