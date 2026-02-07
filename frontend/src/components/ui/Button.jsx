import { motion } from 'framer-motion'
import { springConfig } from '../../utils/animations'

/**
 * Cedar Design System Button Component
 * Professional, accessible, physics-based interactions
 */

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    onClick,
    type = 'button',
    className = '',
    ...props
}) {
    const baseStyles = 'font-semibold transition-all duration-150 rounded-xl inline-flex items-center justify-center gap-2'

    const variants = {
        primary: `bg-gradient-to-r from-[var(--cedar-green)] to-[var(--accent-teal)] text-white
               hover:shadow-lg hover:shadow-cedar-green/30 disabled:opacity-50 disabled:cursor-not-allowed`,
        secondary: `bg-transparent border-2 border-gray-700 text-gray-300
                hover:border-accent-teal hover:text-accent-teal hover:bg-accent-teal/5
                disabled:opacity-50 disabled:cursor-not-allowed`,
        ghost: `bg-transparent text-gray-300 hover:bg-white/5 disabled:opacity-50`,
        danger: `bg-gradient-to-r from-red-600 to-red-500 text-white
             hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-50`
    }

    const sizes = {
        sm: 'px-4 py-2 text-sm min-h-[36px]',
        md: 'px-6 py-3 text-base min-h-[48px]',
        lg: 'px-8 py-4 text-lg min-h-[56px]'
    }

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`

    return (
        <motion.button
            type={type}
            className={combinedClassName}
            onClick={onClick}
            disabled={disabled || loading}
            whileTap={{ scale: disabled ? 1 : 0.97 }}
            whileHover={{ y: disabled ? 0 : -2 }}
            transition={springConfig}
            {...props}
        >
            {loading ? (
                <>
                    <motion.div
                        className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <span>Loading...</span>
                </>
            ) : (
                children
            )}
        </motion.button>
    )
}

/**
 * Magnetic Button variant - cursor interaction
 * Moves slightly toward cursor on hover (desktop only)
 */
export function MagneticButton({ children, ...props }) {
    const [position, setPosition] = React.useState({ x: 0, y: 0 })

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = (e.clientX - rect.left - rect.width / 2) / 4
        const y = (e.clientY - rect.top - rect.height / 2) / 4
        setPosition({ x, y })
    }

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 })
    }

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={position}
            transition={springConfig}
        >
            <Button {...props}>{children}</Button>
        </motion.div>
    )
}
