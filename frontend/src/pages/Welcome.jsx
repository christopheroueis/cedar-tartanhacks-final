import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  })
}

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen topo-bg relative overflow-hidden">
      {/* Topographic line overlay */}
      <div className="absolute inset-0 topo-lines opacity-60" aria-hidden />

      {/* Subtle heatmap-style gradient blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(13,115,119,0.07) 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] right-[5%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(230,126,34,0.05) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[10%] left-[30%] w-[350px] h-[350px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(192,57,43,0.04) 0%, transparent 70%)' }} />
      </div>

      {/* Top nav bar */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 flex items-center justify-between px-10 py-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-[#0D7377] flex items-center justify-center">
            <span className="text-white text-xs font-bold" style={{ fontFamily: 'var(--font-display)' }}>C</span>
          </div>
          <span className="text-sm font-semibold tracking-wide" style={{ fontFamily: 'var(--font-display)', color: '#1A1A18' }}>
            CEDAR
          </span>
        </div>
        <div className="flex items-center gap-8 text-sm text-[#6B6B5A]">
          <Link to="/about" className="hover:text-[#1A1A18] transition-colors">About</Link>
          <Link to="/privacy" className="hover:text-[#1A1A18] transition-colors">Privacy</Link>
          <Link
            to="/login"
            className="text-[#0D7377] font-medium hover:text-[#0A5C5F] transition-colors"
          >
            Log in →
          </Link>
        </div>
      </motion.nav>

      {/* Main hero content */}
      <div className="relative z-10 flex flex-col items-start justify-center px-10 lg:px-20 pt-[12vh]">
        <motion.div className="max-w-2xl" initial="hidden" animate="visible">

          {/* Instrument-style label */}
          <motion.div
            variants={fadeIn}
            custom={0}
            className="label-instrument mb-6 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-[#27AE60] inline-block" />
            CLIMATE RISK INTELLIGENCE PLATFORM
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeIn}
            custom={1}
            className="text-5xl lg:text-6xl leading-[1.08] tracking-tight mb-6"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A1A18' }}
          >
            Lend with the<br />land in mind.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeIn}
            custom={2}
            className="text-lg leading-relaxed mb-10 max-w-lg"
            style={{ color: '#4A4A3F' }}
          >
            Cedar integrates real-time climate data, ML risk models, and AI-powered transcription to help microfinance institutions make climate-smart lending decisions.
          </motion.p>

          {/* Terminal-style CTA button */}
          <motion.button
            variants={fadeIn}
            custom={3}
            onClick={() => navigate('/login')}
            className="btn-terminal"
          >
            <span style={{ color: '#27AE60' }}>→</span>
            Run Risk Assessment
          </motion.button>

          {/* Data badges */}
          <motion.div
            variants={fadeIn}
            custom={4}
            className="mt-14 flex gap-10"
          >
            {[
              { label: 'ACCURACY', value: '92%', sub: 'ML default prediction' },
              { label: 'REGIONS', value: '3', sub: 'Bangladesh · Kenya · Peru' },
              { label: 'RISK DIMS', value: '7', sub: 'Multidimensional scoring' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="label-instrument mb-1">{stat.label}</div>
                <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#1A1A18' }}>
                  {stat.value}
                </div>
                <div className="text-xs mt-1" style={{ color: '#9B9B8A' }}>{stat.sub}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Grid pattern bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#E0D9CF]" />
    </div>
  )
}
