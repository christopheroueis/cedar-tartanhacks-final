import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

/**
 * Cedar Risk Gauge Component
 * Semi-circular gauge (180°) with gradient fill and animated needle
 */

export default function RiskGauge({
    score = 0, // 0-100
    size = 'lg',
    showLabel = true
}) {
    const [animatedScore, setAnimatedScore] = useState(0)

    // Animate score on mount
    useEffect(() => {
        const timeout = setTimeout(() => {
            setAnimatedScore(score)
        }, 100)
        return () => clearTimeout(timeout)
    }, [score])

    // Calculate needle angle: -90° (left) to +90° (right)
    const angle = (animatedScore / 100) * 180 - 90

    // Determine risk level and color
    const getRiskLevel = (score) => {
        if (score < 33) return { level: 'Low Risk', color: '#10B981', zone: 'safe' }
        if (score < 67) return { level: 'Moderate Risk', color: '#F59E0B', zone: 'review' }
        return { level: 'High Risk', color: '#DC2626', zone: 'high' }
    }

    const riskInfo = getRiskLevel(score)

    const sizes = {
        sm: { width: 160, height: 100, strokeWidth: 12, needleLength: 50 },
        md: { width: 200, height: 120, strokeWidth: 16, needleLength: 65 },
        lg: { width: 240, height: 140, strokeWidth: 20, needleLength: 80 }
    }

    const { width, height, strokeWidth, needleLength } = sizes[size]
    const radius = (width / 2) - strokeWidth
    const centerX = width / 2
    const centerY = height - 10

    // Create arc path
    const createArc = (startAngle, endAngle) => {
        const start = polarToCartesian(centerX, centerY, radius, endAngle)
        const end = polarToCartesian(centerX, centerY, radius, startAngle)
        const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
        return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
    }

    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        }
    }

    return (
        <div className="flex flex-col items-center">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                <defs>
                    {/* Gradient for risk spectrum */}
                    <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" /> {/* Low/Green */}
                        <stop offset="50%" stopColor="#F59E0B" /> {/* Medium/Amber */}
                        <stop offset="100%" stopColor="#DC2626" /> {/* High/Red */}
                    </linearGradient>

                    {/* Shadow for needle */}
                    <filter id="needleShadow">
                        <fe GaussianBlur in="SourceAlpha" stdDeviation="2" />
                        <feOffset dx="0" dy="2" result="offsetblur" />
                        <feFlood floodColor="#000" floodOpacity="0.3" />
                        <feComposite in2="offsetblur" operator="in" />
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Background arc (full semi-circle) */}
                <path
                    d={createArc(0, 180)}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />

                {/* Gradient arc */}
                <path
                    d={createArc(0, 180)}
                    fill="none"
                    stroke="url(#riskGradient)"
                    strokeWidth={strokeWidth - 4}
                    strokeLinecap="round"
                    opacity="0.6"
                />

                {/* Zone markers */}
                {[0, 33, 67].map((value, i) => {
                    const markerAngle = (value / 100) * 180
                    const point = polarToCartesian(centerX, centerY, radius + 15, markerAngle)
                    return (
                        <circle
                            key={i}
                            cx={point.x}
                            cy={point.y}
                            r="2"
                            fill="rgba(255, 255, 255, 0.4)"
                        />
                    )
                })}

                {/* Animated needle */}
                <motion.g
                    initial={{ rotate: -90 }}
                    animate={{ rotate: angle }}
                    transition={{
                        duration: 1.2,
                        ease: [0.34, 1.56, 0.64, 1] // Spring-like easing
                    }}
                    style={{ transformOrigin: `${centerX}px ${centerY}px` }}
                >
                    {/* Needle */}
                    <line
                        x1={centerX}
                        y1={centerY}
                        x2={centerX}
                        y2={centerY - needleLength}
                        stroke={riskInfo.color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        filter="url(#needleShadow)"
                    />

                    {/* Needle base dot */}
                    <circle
                        cx={centerX}
                        cy={centerY}
                        r="6"
                        fill={riskInfo.color}
                        stroke="rgba(255, 255, 255, 0.3)"
                        strokeWidth="2"
                    />
                </motion.g>
            </svg>

            {/* Score display */}
            <motion.div
                className="text-center -mt-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
            >
                <div className="flex items-baseline justify-center gap-1">
                    <motion.span
                        className="text-5xl font-bold tabular-nums"
                        style={{ color: riskInfo.color }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        {Math.round(animatedScore)}
                    </motion.span>
                    <span className="text-2xl text-gray-500 font-medium">/100</span>
                </div>

                {showLabel && (
                    <motion.p
                        className="text-sm font-medium mt-1"
                        style={{ color: riskInfo.color }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                    >
                        {riskInfo.level}
                    </motion.p>
                )}
            </motion.div>

            {/* Zone labels */}
            <div className="flex justify-between w-full max-w-[240px] mt-4 text-xs font-medium">
                <span className="text-emerald-400">Safe</span>
                <span className="text-amber-400">Review</span>
                <span className="text-red-400">High Risk</span>
            </div>
        </div>
    )
}
