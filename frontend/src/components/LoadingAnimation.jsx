import React, { useState, useEffect } from 'react'
import { TrendingUp, Cloud, AlertTriangle, Users, CheckCircle2, Loader2 } from 'lucide-react'

const metrics = [
    {
        icon: TrendingUp,
        text: 'Analyzing economic indicators...',
        color: 'from-blue-500 to-cyan-500',
        duration: 2000
    },
    {
        icon: Cloud,
        text: 'Fetching climate patterns...',
        color: 'from-green-500 to-emerald-500',
        duration: 2000
    },
    {
        icon: AlertTriangle,
        text: 'Assessing conflict risk...',
        color: 'from-orange-500 to-red-500',
        duration: 2000
    },
    {
        icon: Users,
        text: 'Loading social metrics...',
        color: 'from-purple-500 to-pink-500',
        duration: 1500
    }
]

export default function LoadingAnimation({ onComplete, minimumDuration = 5000 }) {
    const [currentMetric, setCurrentMetric] = useState(0)
    const [progress, setProgress] = useState(0)
    const [isComplete, setIsComplete] = useState(false)

    useEffect(() => {
        const startTime = Date.now()
        let metricIndex = 0
        let progressValue = 0

        // Metric cycling
        const metricInterval = setInterval(() => {
            if (metricIndex < metrics.length - 1) {
                metricIndex++
                setCurrentMetric(metricIndex)
            }
        }, metrics[0].duration)

        // Progress animation
        const progressInterval = setInterval(() => {
            const elapsed = Date.now() - startTime
            progressValue = Math.min((elapsed / minimumDuration) * 100, 100)
            setProgress(progressValue)

            if (progressValue >= 100) {
                clearInterval(progressInterval)
                clearInterval(metricInterval)
                setIsComplete(true)

                // Small delay before calling onComplete
                setTimeout(() => {
                    onComplete?.()
                }, 500)
            }
        }, 50)

        return () => {
            clearInterval(metricInterval)
            clearInterval(progressInterval)
        }
    }, [minimumDuration, onComplete])

    const CurrentIcon = metrics[currentMetric].icon

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4 pt-24 overflow-hidden relative">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Floating particles */}
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${5 + Math.random() * 5}s`
                        }}
                    />
                ))}

                {/* Gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/30 rounded-full filter blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                {/* Main Content */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-12 shadow-2xl">
                    {/* Icon Area */}
                    <div className="flex justify-center mb-8">
                        <div className={`w-24 h-24 bg-gradient-to-br ${metrics[currentMetric].color} rounded-full flex items-center justify-center shadow-xl transition-all duration-500`}>
                            {isComplete ? (
                                <CheckCircle2 className="w-12 h-12 text-white animate-scale-in" />
                            ) : (
                                <CurrentIcon className="w-12 h-12 text-white animate-pulse" />
                            )}
                        </div>
                    </div>

                    {/* Text */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-4 transition-all duration-500">
                            {isComplete ? 'Data Ready!' : metrics[currentMetric].text}
                        </h2>
                        <p className="text-slate-300">
                            {isComplete ? 'Preparing your assessment...' : 'Please wait while we gather information'}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${metrics[currentMetric].color} transition-all duration-300 ease-out relative`}
                                style={{ width: `${progress}%` }}
                            >
                                {/* Glow effect */}
                                <div className="absolute inset-0 bg-white/30 animate-shimmer" />
                            </div>
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-slate-400 text-sm">
                                {Math.round(progress)}%
                            </span>
                            <span className="text-slate-400 text-sm">
                                {isComplete ? 'Complete' : 'Loading...'}
                            </span>
                        </div>
                    </div>

                    {/* Metric Indicators */}
                    <div className="grid grid-cols-4 gap-4">
                        {metrics.map((metric, index) => {
                            const Icon = metric.icon
                            const isActive = index === currentMetric
                            const isCompleted = index < currentMetric || isComplete

                            return (
                                <div
                                    key={index}
                                    className={`
                                        flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300
                                        ${isActive && 'bg-white/10 ring-2 ring-white/30'}
                                        ${isCompleted && !isActive && 'opacity-50'}
                                    `}
                                >
                                    {isCompleted && !isActive ? (
                                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                                    ) : (
                                        <Icon
                                            className={`
                                                w-6 h-6 transition-all duration-300
                                                ${isActive ? 'text-white animate-pulse' : 'text-slate-400'}
                                            `}
                                        />
                                    )}
                                    <span className={`
                                        text-xs text-center transition-colors duration-300
                                        ${isActive ? 'text-white font-semibold' : 'text-slate-400'}
                                    `}>
                                        {metric.text.split(' ')[0]}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Loading spinner */}
                {!isComplete && (
                    <div className="flex justify-center mt-6">
                        <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
                    </div>
                )}
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes scale-in {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
                .animate-float {
                    animation: float linear infinite;
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
                .animate-scale-in {
                    animation: scale-in 0.5s ease-out;
                }
            `}</style>
        </div>
    )
}
