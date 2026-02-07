import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Database, Lock, Mail } from 'lucide-react'

export default function Privacy() {
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
            <h1 className="text-2xl font-semibold text-white mb-2">Privacy Policy</h1>
            <p className="text-slate-400 text-sm">
              Last updated: February 2025. Cedar (“we”, “our”, or “the platform”) is committed to protecting
              the privacy of users and the borrowers whose data is processed through our climate-informed
              micro-lending services.
            </p>
          </div>

          <div className="card-cedar p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-[var(--color-primary-light)]" />
              Information we collect
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We collect and process data necessary to provide risk assessments and lending support: loan
              application details (e.g. name, contact, loan amount, purpose), location data for climate risk
              and geocoding, conversation or transcript data when you use AI-assisted data entry, and usage
              data (e.g. login, assessments created) for your institution. Data is provided by your MFI or
              by you when using the platform.
            </p>
          </div>

          <div className="card-cedar p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--color-primary-light)]" />
              How we use it
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We use this information to deliver climate and credit risk analysis, run ML models for default
              prediction, improve our AI extraction and product features, and support your MFI’s operations
              and reporting. We do not sell your or your borrowers’ personal data. Data may be shared with
              trusted service providers (e.g. cloud hosting, AI providers) under strict agreements to support
              the service.
            </p>
          </div>

          <div className="card-cedar p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-[var(--color-primary-light)]" />
              Security and retention
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We apply industry-standard measures to protect data in transit and at rest. Access is limited
              to authorized personnel and systems. We retain data only as long as needed for the service,
              legal, or regulatory requirements. Your MFI may have its own retention and privacy policies
              that also apply.
            </p>
          </div>

          <div className="card-cedar p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-[var(--color-primary-light)]" />
              Contact
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              For privacy-related questions, access requests, or complaints, please contact your MFI
              administrator or the Cedar team through your designated support channel. We will respond in
              line with applicable law and our commitments to your institution.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
