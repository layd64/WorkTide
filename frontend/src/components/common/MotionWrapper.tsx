import React from 'react';
import { motion } from 'framer-motion';
import { useAccessibility } from '../../contexts/AccessibilityContext';

type AnimationType = 'fadeIn' | 'slideUp' | 'scaleIn';

interface MotionWrapperProps {
    children: React.ReactNode;
    type?: AnimationType;
    delay?: number;
    duration?: number;
    className?: string;
    viewport?: { once: boolean; amount: number };
}

const variants = {
    fadeIn: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    },
    slideUp: {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    },
    scaleIn: {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
    },
};

const MotionWrapper: React.FC<MotionWrapperProps> = ({
    children,
    type = 'fadeIn',
    delay = 0,
    duration = 0.5,
    className = '',
    viewport = { once: true, amount: 0.3 },
}) => {
    const { reducedMotion } = useAccessibility();

    if (reducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={variants[type]}
            transition={{ duration, delay, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default MotionWrapper;
