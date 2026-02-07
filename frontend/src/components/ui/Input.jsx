import { motion } from 'framer-motion'
import { fadeInUp } from '../../utils/animations'

/**
 * Cedar Design System Input Component
 * Professional input fields with depth and proper focus states
 */

export default function Input({
    label,
    helperText,
    error,
    type = 'text',
    className = '',
    containerClassName = '',
    icon: Icon,
    ...props
}) {
    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`

    return (
        <motion.div
            className={`w-full ${containerClassName}`}
            {...fadeInUp}
        >
            {label && (
                <label
                    htmlFor={inputId}
                    className="label text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 block"
                >
                    {label}
                </label>
            )}

            <div className="relative">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <Icon className="w-5 h-5" />
                    </div>
                )}

                <input
                    id={inputId}
                    type={type}
                    className={`
            input-field w-full
            bg-white/5 border border-white/10
            rounded-lg px-4 py-3
            ${Icon ? 'pl-12' : ''}
            text-white placeholder:text-white/40
            shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]
            transition-all duration-200
            focus:outline-none focus:border-[var(--accent-teal)]
            focus:shadow-[0_0_0_3px_rgba(20,184,166,0.1)]
            focus:bg-white/8
            ${error ? 'border-red-500 focus:border-red-500' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>

            {helperText && !error && (
                <p className="text-sm text-gray-500 mt-2">
                    {helperText}
                </p>
            )}

            {error && (
                <motion.p
                    className="text-sm text-red-400 mt-2 flex items-center gap-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </motion.p>
            )}
        </motion.div>
    )
}

/**
 * Select dropdown with Cedar styling
 */
export function Select({
    label,
    options = [],
    placeholder = "Select an option",
    error,
    className = '',
    ...props
}) {
    return (
        <div className="w-full">
            {label && (
                <label className="label text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 block">
                    {label}
                </label>
            )}

            <div className="relative">
                <select
                    className={`
            input-field w-full appearance-none
            bg-white/5 border border-white/10
            rounded-lg px-4 py-3 pr-10
            text-white
            shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]
            transition-all duration-200
            focus:outline-none focus:border-[var(--accent-teal)]
            focus:shadow-[0_0_0_3px_rgba(20,184,166,0.1)]
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
                    {...props}
                >
                    <option value="" disabled>{placeholder}</option>
                    {options.map(option => (
                        <option
                            key={option.value}
                            value={option.value}
                            className="bg-gray-800 text-white"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* Dropdown icon */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {error && (
                <p className="text-sm text-red-400 mt-2">{error}</p>
            )}
        </div>
    )
}

/**
 * Textarea with Cedar styling
 */
export function Textarea({
    label,
    helperText,
    error,
    className = '',
    ...props
}) {
    return (
        <div className="w-full">
            {label && (
                <label className="label text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 block">
                    {label}
                </label>
            )}

            <textarea
                className={`
          input-field w-full
          bg-white/5 border border-white/10
          rounded-lg px-4 py-3
          text-white placeholder:text-white/40
          shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]
          transition-all duration-200
          focus:outline-none focus:border-[var(--accent-teal)]
          focus:shadow-[0_0_0_3px_rgba(20,184,166,0.1)]
          focus:bg-white/8
          resize-vertical min-h-[100px]
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
                {...props}
            />

            {helperText && !error && (
                <p className="text-sm text-gray-500 mt-2">{helperText}</p>
            )}

            {error && (
                <p className="text-sm text-red-400 mt-2">{error}</p>
            )}
        </div>
    )
}
