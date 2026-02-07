import React, { useState, useEffect } from 'react'
import { TrendingUp, Cloud, AlertTriangle, Users, CheckCircle2, Loader2 } from 'lucide-react'

const metrics = [
  { icon: TrendingUp, text: 'Analyzing economic indicators...', duration: 2000 },
  { icon: Cloud, text: 'Fetching climate patterns...', duration: 2000 },
  { icon: AlertTriangle, text: 'Assessing conflict risk...', duration: 2000 },
  { icon: Users, text: 'Loading social metrics...', duration: 1500 }
]

export default function LoadingAnimation({ onComplete, minimumDuration = 5000 }) {
  const [currentMetric, setCurrentMetric] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const startTime = Date.now()
    let metricIndex = 0

    const metricInterval = setInterval(() => {
      if (metricIndex < metrics.length - 1) {
        metricIndex++
        setCurrentMetric(metricIndex)
      }
    }, metrics[0].duration)

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progressValue = Math.min((elapsed / minimumDuration) * 100, 100)
      setProgress(progressValue)

      if (progressValue >= 100) {
        clearInterval(progressInterval)
        clearInterval(metricInterval)
        setIsComplete(true)
        setTimeout(() => onComplete?.(), 400)
      }
    }, 50)

    return () => {
      clearInterval(metricInterval)
      clearInterval(progressInterval)
    }
  }, [minimumDuration, onComplete])

  const CurrentIcon = metrics[currentMetric].icon

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md">
        <div className="card-cedar p-8">
          <div className="flex justify-center mb-6">
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isComplete
                  ? 'bg-[#10B981]'
                  : 'bg-gradient-to-br from-[#0A4D3C] to-[#14B8A6] shadow-lg shadow-[#0A4D3C]/30'
              }`}
            >
              {isComplete ? (
                <CheckCircle2 className="w-10 h-10 text-white" />
              ) : (
                <CurrentIcon className="w-10 h-10 text-white" />
              )}
            </div>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">
              {isComplete ? 'Data ready' : metrics[currentMetric].text}
            </h2>
            <p className="text-sm text-slate-400">
              {isComplete ? 'Preparing your assessment...' : 'Gathering information'}
            </p>
          </div>
          <div className="mb-6">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#14B8A6] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>{Math.round(progress)}%</span>
              <span>{isComplete ? 'Complete' : 'Loading...'}</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {metrics.map((metric, index) => {
              const Icon = metric.icon
              const isActive = index === currentMetric
              const isDone = index < currentMetric || isComplete
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                    isActive ? 'bg-[#14B8A6]/15' : ''
                  } ${isDone && !isActive ? 'opacity-50' : ''}`}
                >
                  {isDone && !isActive ? (
                    <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#14B8A6]' : 'text-slate-500'}`} />
                  )}
                  <span className="text-[10px] text-slate-500 text-center leading-tight">
                    {metric.text.split(' ')[0]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
