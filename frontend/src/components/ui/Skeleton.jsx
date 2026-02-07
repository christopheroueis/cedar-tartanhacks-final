import { motion } from 'framer-motion'

/**
 * Cedar Design System Skeleton Loader
 * Shimmer effect instead of spinners for professional look
 */

export default function Skeleton({
    className = '',
    variant = 'rect',
    width,
    height,
    ...props
}) {
    const variants = {
        rect: 'rounded-lg',
        circle: 'rounded-full',
        text: 'rounded h-4'
    }

    const style = {
        width: width || '100%',
        height: height || (variant === 'circle' ? width : '24px')
    }

    return (
        <div
            className={`
        relative overflow-hidden
        bg-white/[0.05]
        animate-pulse
        ${variants[variant]}
        ${className}
      `}
            style={style}
            {...props}
        >
            {/* Shimmer overlay */}
            <motion.div
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
                animate={{ x: ['0%', '200%'] }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear'
                }}
            />
        </div>
    )
}

/**
 * Skeleton for card content
 */
export function SkeletonCard({ rows = 3 }) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            {Array.from({ length: rows }).map((_, i) => (
                <Skeleton key={i} className="h-4" />
            ))}
        </div>
    )
}

/**
 * Skeleton for list items
 */
export function SkeletonList({ items = 3 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <Skeleton variant="circle" width="40px" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    )
}
