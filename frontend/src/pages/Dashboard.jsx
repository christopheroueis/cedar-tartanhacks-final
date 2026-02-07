import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    ArrowLeft, TrendingUp, TrendingDown, MapPin, Users,
    FileCheck, AlertTriangle, Filter, RefreshCw, Download,
    ChevronRight, Building2, Globe
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

// Mock dashboard data
const generateDashboardData = (mfiId) => {
    const regions = {
        'bangladesh-mfi': ['Sylhet', 'Dhaka', 'Chittagong', 'Khulna', 'Rajshahi'],
        'kenya-mfi': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'],
        'peru-mfi': ['Lima', 'Cusco', 'Arequipa', 'Trujillo', 'Piura']
    }

    const regionNames = regions[mfiId] || regions['bangladesh-mfi']

    return {
        totalAssessments: 1247,
        totalLoanVolume: 2340000,
        avgRiskScore: 48,
        riskTrend: -3.2,
        highRiskLoans: 89,
        portfolioByRisk: [
            { name: 'Low Risk', value: 45, color: '#10b981' },
            { name: 'Medium Risk', value: 38, color: '#f59e0b' },
            { name: 'High Risk', value: 17, color: '#ef4444' }
        ],
        regionRisks: regionNames.map((region, i) => ({
            region,
            floodRisk: 0.2 + Math.random() * 0.5,
            droughtRisk: 0.1 + Math.random() * 0.4,
            assessments: Math.floor(100 + Math.random() * 200)
        })),
        recentHighRisk: [
            { id: 'a1', client: 'Ahmed Hassan', amount: 1500, risk: 78, location: regionNames[0], date: '2h ago' },
            { id: 'a2', client: 'Maria Santos', amount: 2200, risk: 72, location: regionNames[1], date: '5h ago' },
            { id: 'a3', client: 'John Kimani', amount: 800, risk: 71, location: regionNames[2], date: '1d ago' }
        ],
        monthlyTrend: [
            { month: 'Sep', loans: 180, avgRisk: 52 },
            { month: 'Oct', loans: 205, avgRisk: 48 },
            { month: 'Nov', loans: 195, avgRisk: 45 },
            { month: 'Dec', loans: 220, avgRisk: 51 },
            { month: 'Jan', loans: 245, avgRisk: 47 },
            { month: 'Feb', loans: 202, avgRisk: 44 }
        ]
    }
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, subValue, trend, trendUp }) {
    return (
        <div className="card">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{value}</p>
                    {subValue && <p className="text-sm text-slate-400">{subValue}</p>}
                </div>
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-teal-400" />
                </div>
            </div>
            {trend !== undefined && (
                <div className={`flex items-center gap-1 mt-2 text-sm ${trendUp ? 'text-red-400' : 'text-emerald-400'}`}>
                    {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{Math.abs(trend).toFixed(1)}% vs last month</span>
                </div>
            )}
        </div>
    )
}

export default function Dashboard() {
    const { mfi, user } = useAuth()
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // In production, fetch from API
        setTimeout(() => {
            setData(generateDashboardData(mfi?.id))
            setLoading(false)
        }, 800)
    }, [mfi?.id])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-400 mt-4">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pb-8">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-lg border-b border-slate-700/50">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 text-slate-300"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-lg font-semibold text-white">Portfolio Dashboard</h1>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {mfi?.name}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="px-4 py-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <StatCard
                        icon={FileCheck}
                        label="Total Assessments"
                        value={data.totalAssessments.toLocaleString()}
                        subValue="This quarter"
                    />
                    <StatCard
                        icon={Users}
                        label="Loan Volume"
                        value={`$${(data.totalLoanVolume / 1000000).toFixed(1)}M`}
                        subValue="Active portfolio"
                    />
                    <StatCard
                        icon={Globe}
                        label="Avg. Climate Risk"
                        value={data.avgRiskScore}
                        trend={data.riskTrend}
                        trendUp={data.riskTrend > 0}
                    />
                    <StatCard
                        icon={AlertTriangle}
                        label="High Risk Loans"
                        value={data.highRiskLoans}
                        subValue="Require monitoring"
                    />
                </div>

                {/* Portfolio Risk Distribution */}
                <div className="card">
                    <h3 className="text-sm font-semibold text-slate-400 mb-4">Portfolio Risk Distribution</h3>
                    <div className="flex items-center gap-4">
                        <div className="w-32 h-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.portfolioByRisk}
                                        innerRadius={35}
                                        outerRadius={55}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {data.portfolioByRisk.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex-1 space-y-2">
                            {data.portfolioByRisk.map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-sm text-slate-300">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-medium text-white">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Monthly Trend */}
                <div className="card">
                    <h3 className="text-sm font-semibold text-slate-400 mb-4">Monthly Assessments</h3>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.monthlyTrend}>
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="loans" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Regional Risk Heatmap */}
                <div className="card">
                    <h3 className="text-sm font-semibold text-slate-400 mb-4">Regional Climate Risk</h3>
                    <div className="space-y-3">
                        {data.regionRisks.map((region, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-24 text-sm text-slate-300">{region.region}</div>
                                <div className="flex-1">
                                    <div className="h-6 bg-slate-700 rounded-lg overflow-hidden flex">
                                        <div
                                            className="h-full bg-blue-500"
                                            style={{ width: `${region.floodRisk * 100}%` }}
                                            title={`Flood: ${(region.floodRisk * 100).toFixed(0)}%`}
                                        />
                                        <div
                                            className="h-full bg-orange-500"
                                            style={{ width: `${region.droughtRisk * 100}%` }}
                                            title={`Drought: ${(region.droughtRisk * 100).toFixed(0)}%`}
                                        />
                                    </div>
                                </div>
                                <div className="text-xs text-slate-400 w-20 text-right">
                                    {region.assessments} loans
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-700">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <div className="w-3 h-3 rounded bg-blue-500" />
                            <span>Flood Risk</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <div className="w-3 h-3 rounded bg-orange-500" />
                            <span>Drought Risk</span>
                        </div>
                    </div>
                </div>

                {/* High Risk Loans */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-400">High Risk Loans</h3>
                        <Link to="/history" className="text-xs text-teal-400 hover:text-teal-300">
                            View All
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {data.recentHighRisk.map((loan) => (
                            <div
                                key={loan.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors cursor-pointer"
                            >
                                <div>
                                    <p className="text-sm font-medium text-white">{loan.client}</p>
                                    <p className="text-xs text-slate-400 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {loan.location} • ${loan.amount.toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-red-400">{loan.risk}</div>
                                    <p className="text-xs text-slate-500">{loan.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
