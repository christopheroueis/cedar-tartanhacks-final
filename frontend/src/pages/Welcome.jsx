import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

const logoContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.25 }
  }
}

const logoItem = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
  }
}

const floatAnimation = {
  y: [0, -8, 0],
  transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
}

const buttonVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }
  },
  tap: { scale: 0.97 },
  hover: { scale: 1.03, y: -2 }
}

export default function Welcome() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const [videoReady, setVideoReady] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
    const handler = () => setReduceMotion(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onCanPlay = () => setVideoReady(true)
    v.addEventListener('canplay', onCanPlay)
    v.play().catch(() => {})
    return () => v.removeEventListener('canplay', onCanPlay)
  }, [])

  const handleStart = () => {
    navigate('/login')
  }

  return (
    <div className="welcome-page fixed inset-0 overflow-hidden bg-[var(--color-bg)]">
      {/* Video background — optimized contrast and vignette */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          src="/background.mp4"
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: 'brightness(0.32) saturate(0.85) contrast(1.05)',
            opacity: videoReady ? 1 : 0
          }}
        />
        {/* Layered overlays: gradient + vignette for depth */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80"
          aria-hidden
        />
        <div
          className="absolute inset-0 welcome-vignette"
          aria-hidden
        />
      </div>

      {/* Content — centered with glass card for hierarchy */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-16">
        <motion.div
          className="welcome-card flex flex-col items-center text-center max-w-md"
          initial="hidden"
          animate="visible"
          variants={logoContainer}
        >
          <motion.div
            variants={logoItem}
            animate={reduceMotion ? {} : floatAnimation}
            className="relative welcome-logo-wrap"
          >
            <img
              src="/cedarlogo.png"
              alt="Cedar"
              className="w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 drop-shadow-2xl pointer-events-none select-none welcome-logo"
            />
          </motion.div>
          <motion.h1
            variants={logoItem}
            className="mt-5 text-[2rem] sm:text-4xl md:text-[2.75rem] font-semibold tracking-tight text-white welcome-title"
          >
            Cedar
          </motion.h1>
          <motion.p
            variants={logoItem}
            className="mt-2 text-[15px] sm:text-base text-[var(--color-primary-light)]/95 font-medium tracking-wide welcome-tagline"
          >
            Climate-informed micro-lending
          </motion.p>
          <motion.p
            variants={logoItem}
            className="mt-3 text-sm text-white/60 max-w-[280px] leading-relaxed welcome-sub"
          >
            Assess property risk with climate and environmental data.
          </motion.p>

          <motion.button
          type="button"
          onClick={handleStart}
          className="
            welcome-cta
            mt-12
            px-20 py-7
            rounded-2xl
            font-semibold
            text-sm
            text-white
            border-0
            focus:outline-none
            focus:ring-2
            focus:ring-[var(--color-primary-light)]
            focus:ring-offset-2
            focus:ring-offset-black/60
            transition-all
            duration-200
          "
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          whileTap="tap"
        >
          Get started
        </motion.button>

        </motion.div>

        {/* Minimal footer */}
        <motion.footer
          className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 text-xs text-white/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.4 }}
        >
          <Link to="/about" className="hover:text-white/60 transition-colors">About</Link>
          <span aria-hidden>·</span>
          <Link to="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
        </motion.footer>
      </div>
    </div>
  )
}
