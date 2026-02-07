import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Leaf, Shield, BarChart3, Mic, MapPin } from 'lucide-react'

export default function About() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="border-b border-[var(--color-border)] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <img src="/cedarlogo.png" alt="Cedar" className="w-8 h-8 object-contain" />
            <span className="font-semibold text-white">Cedar</span>
          </div>
          <div className="w-16" aria-hidden />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">About Cedar</h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Cedar is a climate-informed micro-lending platform that helps Microfinance Institutions (MFIs)
              in developing countries make smarter lending decisions using real-time climate data,
              AI-powered data collection, and machine learning risk models.
            </p>
          </div>

          <div className="card-cedar p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Leaf className="w-5 h-5 text-[var(--color-primary-light)]" />
              What we do
            </h2>
            <ul className="space-y-4 text-slate-300 text-sm leading-relaxed">
              <li>
                <strong className="text-white">AI-powered data collection</strong> — Record or transcribe loan
                interviews; AI extracts structured data automatically so loan officers spend less time on paperwork.
              </li>
              <li>
                <strong className="text-white">Real-time climate risk</strong> — We use GPS location to pull
                flood, drought, and heat stress risks so you can factor climate into every loan.
              </li>
              <li>
                <strong className="text-white">Default prediction</strong> — Machine learning models combine
                climate and credit data for more accurate risk and product recommendations (e.g. insurance,
                flexible repayment).
              </li>
              <li>
                <strong className="text-white">Portfolio analytics</strong> — MFI managers get dashboards and
                exports to see how climate risk affects their portfolio.
              </li>
            </ul>
          </div>

          <div className="card-cedar p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--color-primary-light)]" />
              Who we serve
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Cedar is built for MFIs operating in climate-vulnerable regions—for example Bangladesh (flood
              and monsoon risk), Kenya (drought and livestock), and Peru (altitude and crop stress). We help
              protect both borrowers and lenders from climate-related default and support sustainable
              micro-lending.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <Mic className="w-4 h-4 text-emerald-400" />
              <span>Conversation transcription</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Climate risk scoring</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Portfolio analytics</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
