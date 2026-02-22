import { useState, useEffect } from 'react'
import { Cloud, TrendingUp, Droplets, Layers, Sparkles, CheckCircle2 } from 'lucide-react'

const defaultMetrics = [
  { icon: Cloud, text: 'Fetching environmental data…', duration: 1000 },
  { icon: TrendingUp, text: 'Retrieving land risk indicators…', duration: 1000 },
  { icon: Droplets, text: 'Analyzing regional flood history…', duration: 1000 },
  { icon: Layers, text: 'Mapping soil composition…', duration: 1000 },
  { icon: Sparkles, text: 'Finalizing risk profile…', duration: 1000 },
]

export default function LoadingAnimation({ onComplete, minimumDuration = 5000, messages }) {
  const metrics = messages || defaultMetrics

  const [currentMetric, setCurrentMetric] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const startTime = Date.now()
    let metricIndex = 0
    const interval = Math.floor(minimumDuration / metrics.length)

    const metricInterval = setInterval(() => {
      if (metricIndex < metrics.length - 1) {
        metricIndex++
        setCurrentMetric(metricIndex)
      }
    }, interval)

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
  }, [minimumDuration, onComplete, metrics.length])

  const CurrentIcon = metrics[currentMetric]?.icon || Sparkles
  const cols = metrics.length <= 4 ? metrics.length : metrics.length <= 6 ? 3 : 4

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-24" style={{ background: '#F7F5F0' }}>
      <div className="w-full max-w-md">
        <div className="card-cedar p-8">
          <div className="flex justify-center mb-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300"
              style={{
                background: isComplete
                  ? 'rgba(39,174,96,0.1)'
                  : 'rgba(13,115,119,0.08)',
              }}
            >
              {isComplete ? (
                <CheckCircle2 className="w-10 h-10" style={{ color: '#27AE60' }} />
              ) : (
                <CurrentIcon className="w-10 h-10" style={{ color: '#0D7377' }} />
              )}
            </div>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-display)', color: '#1A1A18' }}>
              {isComplete ? 'Ready' : metrics[currentMetric]?.text}
            </h2>
            <p className="text-sm" style={{ color: '#6B6B5A' }}>
              {isComplete ? 'Preparing your results…' : 'Please wait'}
            </p>
          </div>
          <div className="mb-6">
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#E8E3DA' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #0D7377, #14918A)' }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs" style={{ color: '#9B9B8A', fontFamily: 'var(--font-mono)' }}>
              <span>{Math.round(progress)}%</span>
              <span>{isComplete ? 'Complete' : 'Loading…'}</span>
            </div>
          </div>
          <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {metrics.map((metric, index) => {
              const Icon = metric.icon
              const isActive = index === currentMetric
              const isDone = index < currentMetric || isComplete
              return (
                <div
                  key={index}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors"
                  style={{
                    background: isActive ? 'rgba(13,115,119,0.06)' : 'transparent',
                    opacity: isDone && !isActive ? 0.5 : 1
                  }}
                >
                  {isDone && !isActive ? (
                    <CheckCircle2 className="w-4 h-4" style={{ color: '#27AE60' }} />
                  ) : (
                    <Icon className="w-4 h-4" style={{ color: isActive ? '#0D7377' : '#9B9B8A' }} />
                  )}
                  <span className="text-[9px] text-center leading-tight" style={{ color: '#6B6B5A' }}>
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
