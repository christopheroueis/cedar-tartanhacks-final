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
    <div className="min-h-screen relative overflow-hidden">
      {/* Full-bleed video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="video-cover"
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="video-overlay" aria-hidden />

      {/* Top nav bar */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-20 flex items-center justify-between px-10 py-6"
      >
        <div className="flex items-center gap-3">
          <img src="/cedarlogo.png" alt="Cedar" style={{ height: 36 }} />
          <span className="text-sm font-semibold tracking-wide" style={{ fontFamily: 'var(--font-display)', color: '#FFFFFF' }}>
            CEDAR
          </span>
        </div>
        <div className="flex items-center gap-8 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link
            to="/login"
            className="font-medium hover:text-white transition-colors"
            style={{ color: '#5CE0D4' }}
          >
            Log in →
          </Link>
        </div>
      </motion.nav>

      {/* Main hero content — centered */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-[calc(100vh-100px)]" style={{ marginTop: '-80px' }}>
        <motion.div className="max-w-2xl px-6" initial="hidden" animate="visible">

          {/* Cedar logo above title */}
          <motion.div
            variants={fadeIn}
            custom={0}
            className="flex justify-center mb-6"
          >
            <img src="/cedarlogo.png" alt="Cedar" style={{ height: 64, filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeIn}
            custom={1}
            className="text-7xl lg:text-8xl leading-[1.0] tracking-tight mb-4"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#FFFFFF' }}
          >
            CEDAR
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeIn}
            custom={2}
            className="text-xl lg:text-2xl leading-relaxed mb-10"
            style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-display)', fontWeight: 400 }}
          >
            Lend with the land in mind.
          </motion.p>

          {/* Primary CTA button */}
          <motion.button
            variants={fadeIn}
            custom={3}
            onClick={() => navigate('/login')}
            className="btn-terminal"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(8px)',
              color: '#1A1A18',
              border: 'none',
              padding: '16px 48px',
              fontSize: '1rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            }}
          >
            <span style={{ color: '#27AE60' }}>→</span>
            Start Here
          </motion.button>

          {/* Data badges */}
          <motion.div
            variants={fadeIn}
            custom={4}
            className="mt-14 flex justify-center gap-10"
          >
            {[
              { label: 'ACCURACY', value: '92%', sub: 'ML default prediction' },
              { label: 'REGIONS', value: '3', sub: 'Bangladesh · Kenya · Peru' },
              { label: 'RISK DIMS', value: '7', sub: 'Multidimensional scoring' },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }} className="mb-1">{stat.label}</div>
                <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#FFFFFF' }}>
                  {stat.value}
                </div>
                <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{stat.sub}</div>
              </div>
            ))}
          </motion.div>

          {/* TartanHacks logo */}
          <motion.div
            variants={fadeIn}
            custom={5}
            className="mt-12 flex justify-center"
          >
            <img
              src="/tartanhackslogo.png"
              alt="TartanHacks"
              style={{ height: 72, opacity: 0.8, filter: 'brightness(0) invert(1)' }}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
