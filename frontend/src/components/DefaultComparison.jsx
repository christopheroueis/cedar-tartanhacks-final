import { motion } from 'framer-motion'

/**
 * Default Probability Comparison Component
 * Shows the value of climate-informed lending
 */

export default function DefaultComparison({
    withoutClimate,
    withClimate,
    className = ''
}) {
    const reduction = withoutClimate - withClimate
    const reductionPercent = ((reduction / withoutClimate) * 100).toFixed(0)

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Title */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Default Probability
                </h4>
                <span className="text-xs text-gray-500">
                    ML Model Prediction
                </span>
            </div>

            {/* Bars */}
            <div className="space-y-4">
                {/* Without Climate Data */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Without Climate Data</span>
                        <span className="font-mono font-semibold text-red-400 tabular-nums">
                            {withoutClimate}%
                        </span>
                    </div>
                    <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 to-red-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${withoutClimate}%` }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        />
                    </div>
                </div>

                {/* With Climate Data */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">With Climate Data</span>
                        <span className="font-mono font-semibold text-emerald-400 tabular-nums">
                            {withClimate}%
                        </span>
                    </div>
                    <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${withClimate}%` }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        />
                    </div>
                </div>
            </div>

            {/* Insight callout */}
            <motion.div
                className="flex items-center gap-2 p-3 rounded-lg bg-teal-500/10 border border-teal-500/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.4 }}
            >
                <svg className="w-5 h-5 text-teal-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <div>
                    <p className="text-sm text-teal-300 font-medium">
                        {reduction}% reduction with climate insights
                    </p>
                    <p className="text-xs text-teal-400/70 mt-0.5">
                        {reductionPercent}% improvement in risk prediction
                    </p>
                </div>
            </motion.div>
        </div>
    )
}

/**
 * Compact version for dashboard widgets
 */
export function CompactDefaultComparison({ withoutClimate, withClimate }) {
    const reduction = withoutClimate - withClimate

    return (
        <div className="flex items-center gap-4">
            <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Standard</div>
                <div className="font-mono text-lg font-semibold text-red-400 tabular-nums">
                    {withoutClimate}%
                </div>
            </div>

            <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>

            <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">+Climate</div>
                <div className="font-mono text-lg font-semibold text-emerald-400 tabular-nums">
                    {withClimate}%
                </div>
            </div>

            <div className="ml-2 px-2 py-1 bg-teal-500/10 rounded text-xs font-medium text-teal-400">
                -{reduction}%
            </div>
        </div>
    )
}
