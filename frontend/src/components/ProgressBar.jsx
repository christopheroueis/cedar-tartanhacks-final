import React from 'react'
import { MapPin, Mic, BarChart3, CheckCircle2 } from 'lucide-react'

const steps = [
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'data-entry', label: 'Data entry', icon: Mic },
  { id: 'assessment', label: 'Assessment', icon: BarChart3 },
  { id: 'results', label: 'Results', icon: CheckCircle2 }
]

export default function ProgressBar({ currentStep }) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/98 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentIndex
            const isCompleted = index < currentIndex
            const isFuture = index > currentIndex

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-2 min-w-[72px]">
                  <div
                    className={`
                      relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200
                      ${isActive && 'ring-2 ring-[#14B8A6]/50 bg-[#0A4D3C]/80'}
                      ${isCompleted && 'bg-[#10B981]'}
                      ${isFuture && 'bg-white/5 border border-white/10'}
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Icon
                        className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium ${isActive ? 'text-white' : isCompleted ? 'text-[#10B981]' : 'text-slate-500'}`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1 relative min-w-[12px]">
                    <div className="absolute inset-0 bg-white/10 rounded-full" />
                    <div
                      className="absolute inset-0 bg-[#14B8A6] rounded-full transition-all duration-300"
                      style={{ width: isCompleted ? '100%' : '0%' }}
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
