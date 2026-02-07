/**
 * Cedar Design System Badge Component
 * Semantic status indicators with appropriate colors
 */

export default function Badge({
    children,
    variant = 'default',
    size = 'md',
    icon: Icon,
    className = '',
    ...props
}) {
    const variants = {
        default: 'bg-white/10 border-white/20 text-gray-300',
        success: 'bg-[#10B981]/15 border-[#10B981] text-[#10B981]',
        warning: 'bg-[#F59E0B]/15 border-[#F59E0B] text-[#F59E0B]',
        error: 'bg-[#DC2626]/15 border-[#DC2626] text-[#DC2626]',
        info: 'bg-[#0EA5E9]/15 border-[#0EA5E9] text-[#0EA5E9]',
        // AI confidence levels
        'ai-high': 'bg-[#0EA5E9]/15 border-[#0EA5E9] text-[#0EA5E9]',
        'ai-medium': 'bg-[#3B82F6]/15 border-[#3B82F6] text-[#3B82F6]',
        'ai-low': 'bg-[#94A3B8]/15 border-[#94A3B8] text-[#94A3B8]'
    }

    const sizes = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-xs px-3 py-1',
        lg: 'text-sm px-4 py-1.5'
    }

    return (
        <span
            className={`
        inline-flex items-center gap-1.5
        rounded-full border font-medium
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
            {...props}
        >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {children}
        </span>
    )
}

/**
 * Confidence badge for AI-extracted data
 */
export function ConfidenceBadge({ level }) {
    const configs = {
        high: {
            variant: 'ai-high',
            icon: () => (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            ),
            label: 'High Confidence'
        },
        medium: {
            variant: 'ai-medium',
            icon: () => (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
            ),
            label: 'Please Verify'
        },
        low: {
            variant: 'ai-low',
            icon: () => (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            ),
            label: 'Manual Input Required'
        }
    }

    const config = configs[level] || configs.medium

    return (
        <Badge variant={config.variant} size="sm" icon={config.icon}>
            {config.label}
        </Badge>
    )
}

/**
 * Risk level badge
 */
export function RiskBadge({ level }) {
    const configs = {
        low: { variant: 'success', label: 'Low Risk' },
        moderate: { variant: 'warning', label: 'Moderate Risk' },
        high: { variant: 'error', label: 'High Risk' }
    }

    const config = configs[level] || configs.moderate

    return (
        <Badge variant={config.variant}>
            {config.label}
        </Badge>
    )
}
