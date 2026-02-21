import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, XCircle, ExternalLink } from 'lucide-react'

function generateHistoricalData() {
    const statuses = ['approve', 'caution', 'defer']
    const locations = ['Sylhet, BD', 'Nyeri, KE', 'Cusco, PE', 'Dhaka, BD', 'Mombasa, KE', 'Lima, PE']
    const purposes = ['Agriculture', 'Livestock', 'Small Business', 'Housing']

    return Array.from({ length: 12 }, (_, i) => {
        const status = statuses[Math.floor(Math.random() * 3)]
        const risk = status === 'approve' ? 15 + Math.floor(Math.random() * 30) : status === 'caution' ? 45 + Math.floor(Math.random() * 25) : 70 + Math.floor(Math.random() * 25)
        const amt = [1500, 2000, 2500, 3000, 5000, 8000, 10000][Math.floor(Math.random() * 7)]
        const daysAgo = i * 3 + Math.floor(Math.random() * 3)
        const date = new Date(Date.now() - daysAgo * 86400000)

        return {
            id: `hist_${i}`,
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            location: locations[Math.floor(Math.random() * locations.length)],
            purpose: purposes[Math.floor(Math.random() * purposes.length)],
            amount: amt,
            riskScore: risk,
            status
        }
    })
}

const statusConfig = {
    approve: { icon: CheckCircle, label: 'Approved', color: '#27AE60', bg: 'rgba(39,174,96,0.08)' },
    caution: { icon: AlertTriangle, label: 'Review', color: '#E67E22', bg: 'rgba(230,126,34,0.08)' },
    defer: { icon: XCircle, label: 'Deferred', color: '#C0392B', bg: 'rgba(192,57,43,0.08)' }
}

export default function History() {
    const { mfi } = useAuth()
    const [assessments, setAssessments] = useState([])

    useEffect(() => { setAssessments(generateHistoricalData()) }, [])

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="label-instrument mb-1">HISTORY</div>
                    <h1 className="text-xl tracking-tight" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A1A18' }}>
                        Assessment Log
                    </h1>
                </div>
                <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: '#9B9B8A' }}>
                    {assessments.length} records
                </div>
            </div>

            <div className="card-cedar p-0 overflow-hidden">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>DATE</th>
                            <th>LOCATION</th>
                            <th>PURPOSE</th>
                            <th>AMOUNT</th>
                            <th>RISK</th>
                            <th>STATUS</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {assessments.map((a) => {
                            const config = statusConfig[a.status]
                            const RiskColor = a.riskScore <= 35 ? '#27AE60' : a.riskScore <= 65 ? '#E67E22' : '#C0392B'
                            return (
                                <tr key={a.id}>
                                    <td>
                                        <div className="text-sm" style={{ color: '#1A1A18' }}>{a.date}</div>
                                        <div className="text-xs" style={{ color: '#9B9B8A', fontFamily: 'var(--font-mono)' }}>{a.time}</div>
                                    </td>
                                    <td className="text-sm">{a.location}</td>
                                    <td className="text-sm" style={{ color: '#4A4A3F' }}>{a.purpose}</td>
                                    <td>
                                        <span style={{ fontFamily: 'var(--font-mono)', color: '#1A1A18' }}>
                                            ${a.amount.toLocaleString()}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-xs px-2 py-1 rounded font-medium" style={{ fontFamily: 'var(--font-mono)', color: RiskColor, background: `${RiskColor}10` }}>
                                            {a.riskScore}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-xs px-2 py-1 rounded font-medium inline-flex items-center gap-1"
                                            style={{ color: config.color, background: config.bg, fontFamily: 'var(--font-mono)' }}>
                                            <config.icon className="w-3 h-3" />
                                            {config.label}
                                        </span>
                                    </td>
                                    <td>
                                        <Link to={`/app/results/${a.id}`} className="text-[#0D7377] hover:text-[#0A5C5F]">
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    )
}
