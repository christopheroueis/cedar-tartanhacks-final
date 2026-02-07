// Cedar Animation Utilities
// Physics-based spring animations and easing functions

export const springConfig = {
    type: "spring",
    stiffness: 400,
    damping: 17
}

export const springConfigSoft = {
    type: "spring",
    stiffness: 300,
    damping: 20
}

export const springConfigStiff = {
    type: "spring",
    stiffness: 500,
    damping: 15
}

// Easing curves
export const easeOut = [0.22, 1, 0.36, 1]
export const easeInOut = [0.4, 0, 0.2, 1]
export const spring = [0.68, -0.55, 0.265, 1.55]

// Common animation variants
export const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: easeOut }
}

export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: easeOut }
}

export const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: easeOut }
}

export const slideInFromRight = {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
    transition: { duration: 0.3, ease: easeOut }
}

export const staggerChildren = {
    animate: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
}

export const staggerChildrenFast = {
    animate: {
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0
        }
    }
}

// Button interaction variants
export const buttonTap = {
    whileTap: { scale: 0.97 },
    whileHover: { y: -2 },
    transition: springConfig
}

export const cardHover = {
    whileHover: {
        y: -4,
        transition: { duration: 0.2, ease: easeOut }
    }
}

// Page transition variants
export const pageTransition = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3, ease: easeOut }
}

// Skeleton shimmer animation
export const shimmer = {
    initial: { x: '-100%' },
    animate: { x: '100%' },
    transition: {
        repeat: Infinity,
        duration: 2,
        ease: 'linear'
    }
}
