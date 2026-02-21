import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { TrendingUp, DollarSign, BarChart3, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

const fadeIn = {
    hidden: { opacity: 0, y: 8 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] } })
}

function generateDashboardData() {
    return {
        stats: [
            { label: 'TOTAL_ASSESSMENTS', value: '1,247', delta: '+12%', icon: BarChart3, color: '#0D7377' },
            { label: 'LOAN_VOLUME', value: '$2.3M', delta: '+8%', icon: DollarSign, color: '#27AE60' },
            { label: 'AVG_RISK', value: '48', delta: '-3%', icon: Shield, color: '#E67E22' },
            { label: 'APPROVAL_RATE', value: '78%', delta: '+5%', icon: TrendingUp, color: '#0D7377' }
        ],
        riskDistribution: [
            { name: 'Low Risk', value: 45, color: '#27AE60' },
            { name: 'Moderate', value: 35, color: '#E67E22' },
            { name: 'High Risk', value: 20, color: '#C0392B' }
        ],
        monthlyAssessments: [
            { month: 'Aug', count: 89, approved: 71 },
            { month: 'Sep', count: 95, approved: 74 },
            { month: 'Oct', count: 112, approved: 85 },
            { month: 'Nov', count: 98, approved: 79 },
            { month: 'Dec', count: 121, approved: 94 },
            { month: 'Jan', count: 134, approved: 105 }
        ]
    }
}

export default function Dashboard() {
    const { mfi } = useAuth()
    const [data, setData] = useState(null)

    useEffect(() => { setData(generateDashboardData()) }, [])

    if (!data) return <div className="skeleton-cedar w-full h-48 mt-8" />

    return (
        <motion.div initial="hidden" animate="visible">
            <div className="mb-6">
                <div className="label-instrument mb-1">DASHBOARD</div>
                <h1 className="text-xl tracking-tight" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A1A18' }}>
                    Portfolio Overview
                </h1>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {data.stats.map((stat, i) => (
                    <motion.div key={stat.label} variants={fadeIn} custom={i} className="card-cedar">
                        <div className="flex items-center justify-between mb-2">
                            <span className="label-instrument">{stat.label}</span>
                            <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                        </div>
                        <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#1A1A18' }}>{stat.value}</div>
                        <div className="text-xs mt-1" style={{ fontFamily: 'var(--font-mono)', color: stat.delta.startsWith('+') ? '#27AE60' : '#C0392B' }}>
                            {stat.delta} vs last month
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-5">
                {/* Risk distribution */}
                <motion.div variants={fadeIn} custom={4} className="card-cedar">
                    <div className="label-instrument mb-4">RISK_DISTRIBUTION</div>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={data.riskDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                                {data.riskDistribution.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Legend
                                iconType="circle"
                                iconSize={8}
                                formatter={(value) => <span style={{ color: '#4A4A3F', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{value}</span>}
                            />
                            <Tooltip
                                contentStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: '#fff', border: '1px solid #E0D9CF', borderRadius: '6px' }}
                                formatter={(value) => [`${value}%`, '']}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Monthly assessments */}
                <motion.div variants={fadeIn} custom={5} className="card-cedar">
                    <div className="label-instrument mb-4">MONTHLY_ASSESSMENTS</div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={data.monthlyAssessments} barGap={2}>
                            <XAxis dataKey="month" tick={{ fill: '#6B6B5A', fontSize: 11, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#6B6B5A', fontSize: 11, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} width={30} />
                            <Tooltip
                                contentStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: '#fff', border: '1px solid #E0D9CF', borderRadius: '6px' }}
                            />
                            <Bar dataKey="count" fill="#E0D9CF" radius={[3, 3, 0, 0]} name="Total" />
                            <Bar dataKey="approved" fill="#0D7377" radius={[3, 3, 0, 0]} name="Approved" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>
        </motion.div>
    )
}
