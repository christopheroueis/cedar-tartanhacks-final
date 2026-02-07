import { motion } from 'framer-motion'
import { fadeInUp, cardHover } from '../../utils/animations'

/**
 * Cedar Design System Card Component
 * Professional elevation instead of overused glassmorphism
 */

export default function Card({
    children,
    variant = 'elevated',
    padding = 'default',
    className = '',
    hoverable = false,
    onClick,
    ...props
}) {
    const variants = {
        // Default card with proper elevation (not transparent glass)
        elevated: `
      bg-white/[0.03] border border-white/[0.08]
      shadow-[0_4px_12px_rgba(0,0,0,0.12)]
      hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]
      hover:border-white/[0.12]
    `,
        // Glass card - use sparingly, only for special components
        glass: `
      bg-white/[0.05] backdrop-blur-xl
      border border-white/10
      shadow-[0_4px_12px_rgba(0,0,0,0.12)]
    `,
        // Subtle card with minimal shadow
        subtle: `
      bg-white/[0.02] border border-white/[0.05]
      shadow-[0_2px_4px_rgba(0,0,0,0.08)]
    `,
        // No background, just border
        outline: `
      bg-transparent border border-gray-700
      hover:border-accent-teal/50
    `
    }

    const paddings = {
        none: 'p-0',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8'
    }

    const Component = hoverable || onClick ? motion.div : 'div'
    const hoverProps = hoverable ? cardHover : {}

    return (
        <Component
            className={`
        rounded-2xl transition-all duration-200
        ${variants[variant]}
        ${paddings[padding]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
            onClick={onClick}
            {...(hoverable ? hoverProps : {})}
            {...props}
        >
            {children}
        </Component>
    )
}

/**
 * Card with header section
 */
export function CardWithHeader({
    title,
    subtitle,
    action,
    children,
    ...props
}) {
    return (
        <Card {...props}>
            <div className="flex items-start justify-between mb-6">
                <div>
                    {title && (
                        <h3 className="text-xl font-semibold text-white mb-1">
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p className="text-sm text-gray-400">
                            {subtitle}
                        </p>
                    )}
                </div>
                {action && (
                    <div>{action}</div>
                )}
            </div>
            {children}
        </Card>
    )
}

/**
 * Animated card list item
 */
export function CardListItem({
    children,
    delay = 0,
    ...props
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
        >
            <Card hoverable {...props}>
                {children}
            </Card>
        </motion.div>
    )
}
