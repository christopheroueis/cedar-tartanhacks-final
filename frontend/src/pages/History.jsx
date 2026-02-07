import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    Search, MapPin, DollarSign,
    CheckCircle, AlertTriangle, XCircle, SlidersHorizontal
} from 'lucide-react'

// Mock historical assessments
const generateHistoricalData = (mfiId) => {
    const locations = {
        'bangladesh-mfi': ['Sylhet', 'Dhaka', 'Chittagong', 'Khulna'],
        'kenya-mfi': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'],
        'peru-mfi': ['Lima', 'Cusco', 'Arequipa', 'Trujillo']
    }

    const names = {
        'bangladesh-mfi': ['Ahmed Hassan', 'Fatima Begum', 'Mohammad Ali', 'Rashida Khatun', 'Kamal Hossain'],
        'kenya-mfi': ['John Kimani', 'Mary Wanjiku', 'Peter Ochieng', 'Grace Akinyi', 'James Mwangi'],
        'peru-mfi': ['Maria Santos', 'Carlos Mendoza', 'Ana Garcia', 'Jose Rodriguez', 'Rosa Martinez']
    }

    const locs = locations[mfiId] || locations['bangladesh-mfi']
    const clientNames = names[mfiId] || names['bangladesh-mfi']

    const assessments = []
    const now = Date.now()

    for (let i = 0; i < 25; i++) {
        const riskScore = Math.floor(20 + Math.random() * 60)
        let status = 'approved'
        if (riskScore > 65) status = 'deferred'
        else if (riskScore > 50) status = 'caution'

        assessments.push({
            id: `hist_${i}`,
            clientName: clientNames[i % clientNames.length],
            location: locs[i % locs.length],
            loanAmount: Math.floor(200 + Math.random() * 3000),
            loanPurpose: ['agriculture', 'livestock', 'small_business', 'housing'][i % 4],
            riskScore,
            status,
            date: new Date(now - i * 24 * 60 * 60 * 1000 * Math.random() * 3).toISOString(),
            officer: 'You'
        })
    }

    return assessments.sort((a, b) => new Date(b.date) - new Date(a.date))
}

const statusConfig = {
    approved: { icon: CheckCircle, label: 'Approved', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    caution: { icon: AlertTriangle, label: 'Caution', color: 'text-amber-400', bg: 'bg-amber-500/20' },
    deferred: { icon: XCircle, label: 'Deferred', color: 'text-red-400', bg: 'bg-red-500/20' }
}

const purposeLabels = {
    agriculture: '🌾 Agriculture',
    livestock: '🐄 Livestock',
    small_business: '🏪 Business',
    housing: '🏠 Housing'
}

function formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffHours = diffMs / (1000 * 60 * 60)
    const diffDays = diffMs / (1000 * 60 * 60 * 24)

    if (diffHours < 24) {
        if (diffHours < 1) return 'Just now'
        return `${Math.floor(diffHours)}h ago`
    }
    if (diffDays < 7) return `${Math.floor(diffDays)}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function History() {
    const { mfi } = useAuth()
    const navigate = useNavigate()
    const [assessments, setAssessments] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        setTimeout(() => {
            setAssessments(generateHistoricalData(mfi?.id))
            setLoading(false)
        }, 500)
    }, [mfi?.id])

    const filteredAssessments = assessments.filter(a => {
        const matchesSearch = searchQuery === '' ||
            a.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.location.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = filterStatus === 'all' || a.status === filterStatus

        return matchesSearch && matchesStatus
    })

    const stats = {
        total: assessments.length,
        approved: assessments.filter(a => a.status === 'approved').length,
        caution: assessments.filter(a => a.status === 'caution').length,
        deferred: assessments.filter(a => a.status === 'deferred').length
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="skeleton-cedar w-12 h-12 rounded-full" />
            </div>
        )
    }

    return (
        <div className="pb-24">
            {/* Search + Filters */}
            <div className="px-4 py-3 space-y-3 border-b border-white/5">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by client or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-cedar pl-12"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">{stats.total} assessments</span>
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showFilters ? 'bg-[#14B8A6] text-white' : 'bg-white/5 text-slate-400'}`}
                    >
                        <SlidersHorizontal className="w-4 h-4 inline mr-1.5 align-middle" />
                        Filters
                    </button>
                </div>
                {showFilters && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        <button
                            type="button"
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'all' ? 'bg-[#14B8A6] text-white' : 'bg-white/10 text-slate-300'}`}
                        >
                            All ({stats.total})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterStatus('approved')}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'approved' ? 'bg-[#10B981] text-white' : 'bg-white/10 text-slate-300'}`}
                        >
                            Approved ({stats.approved})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterStatus('caution')}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'caution' ? 'bg-[#F59E0B] text-white' : 'bg-white/10 text-slate-300'}`}
                        >
                            Caution ({stats.caution})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterStatus('deferred')}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'deferred' ? 'bg-[#DC2626] text-white' : 'bg-white/10 text-slate-300'}`}
                        >
                            Deferred ({stats.deferred})
                        </button>
                    </div>
                )}
            </div>

            <main className="px-4 py-4">
                {filteredAssessments.length === 0 ? (
                    <div className="text-center py-12">
                        <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">No assessments found</p>
                        <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredAssessments.map((assessment) => {
                            const config = statusConfig[assessment.status]
                            const Icon = config.icon

                            return (
                                <div
                                    key={assessment.id}
                                    className="card-cedar p-4 hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium text-white">{assessment.clientName}</h3>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                                                    {config.label}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {assessment.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <DollarSign className="w-3 h-3" />
                                                    ${assessment.loanAmount.toLocaleString()}
                                                </span>
                                                <span>{purposeLabels[assessment.loanPurpose]}</span>
                                            </div>
                                        </div>

                                        <div className="text-right ml-4">
                                            <div className={`text-xl font-bold ${assessment.riskScore > 65 ? 'text-red-400' :
                                                    assessment.riskScore > 50 ? 'text-amber-400' : 'text-emerald-400'
                                                }`}>
                                                {assessment.riskScore}
                                            </div>
                                            <p className="text-xs text-slate-500">{formatDate(assessment.date)}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>

            {/* FAB - New Assessment */}
            <Link
                to="/app"
                className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-14 h-14 rounded-full bg-gradient-to-br from-[#0A4D3C] to-[#14B8A6] shadow-lg shadow-[#0A4D3C]/40 flex items-center justify-center text-white text-2xl font-bold hover:shadow-[#0A4D3C]/50 transition-shadow"
            >
                +
            </Link>
        </div>
    )
}
