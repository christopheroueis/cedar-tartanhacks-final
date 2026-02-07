import React from 'react'
import { MapPin, Mic, BarChart3, CheckCircle2 } from 'lucide-react'

const steps = [
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'data-entry', label: 'Data Entry', icon: Mic },
    { id: 'assessment', label: 'Assessment', icon: BarChart3 },
    { id: 'results', label: 'Results', icon: CheckCircle2 }
]

export default function ProgressBar({ currentStep }) {
    const currentIndex = steps.findIndex(s => s.id === currentStep)

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900/95 via-indigo-900/95 to-purple-900/95 backdrop-blur-lg border-b border-white/10">
            <div className="max-w-4xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                        const Icon = step.icon
                        const isActive = index === currentIndex
                        const isCompleted = index < currentIndex
                        const isFuture = index > currentIndex

                        return (
                            <React.Fragment key={step.id}>
                                {/* Step */}
                                <div className="flex flex-col items-center gap-2 min-w-[80px]">
                                    {/* Icon */}
                                    <div
                                        className={`
                                            relative flex items-center justify-center w-12 h-12 rounded-full
                                            transition-all duration-300
                                            ${isActive && 'ring-4 ring-violet-500/50 shadow-lg shadow-violet-500/50'}
                                            ${isCompleted && 'bg-gradient-to-br from-green-500 to-emerald-600'}
                                            ${isActive && 'bg-gradient-to-br from-violet-500 to-purple-600'}
                                            ${isFuture && 'bg-slate-700/50 border border-slate-600'}
                                        `}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-6 h-6 text-white" />
                                        ) : (
                                            <Icon
                                                className={`
                                                    w-6 h-6 transition-all duration-300
                                                    ${isActive && 'text-white animate-pulse'}
                                                    ${isFuture && 'text-slate-400'}
                                                `}
                                            />
                                        )}

                                        {/* Active glow effect */}
                                        {isActive && (
                                            <div className="absolute inset-0 rounded-full bg-violet-500 animate-ping opacity-75" />
                                        )}
                                    </div>

                                    {/* Label */}
                                    <span
                                        className={`
                                            text-xs font-medium transition-colors duration-300
                                            ${isActive && 'text-white'}
                                            ${isCompleted && 'text-green-400'}
                                            ${isFuture && 'text-slate-500'}
                                        `}
                                    >
                                        {step.label}
                                    </span>
                                </div>

                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div className="flex-1 h-0.5 mx-2 relative">
                                        <div className="absolute inset-0 bg-slate-700/50" />
                                        <div
                                            className={`
                                                absolute inset-0 transition-all duration-500
                                                ${isCompleted && 'bg-gradient-to-r from-green-500 to-emerald-600'}
                                                ${isActive && index < currentIndex && 'bg-gradient-to-r from-green-500 to-emerald-600'}
                                            `}
                                            style={{
                                                width: isCompleted ? '100%' : '0%'
                                            }}
                                        />
                                    </div>
                                )}
                            </React.Fragment>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
