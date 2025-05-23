import React, { useEffect, useState } from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';

const ReadingGuide: React.FC = () => {
    const { readingGuide } = useAccessibility();
    const [mouseY, setMouseY] = useState(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMouseY(e.clientY);
        };

        if (readingGuide) {
            window.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [readingGuide]);

    if (!readingGuide) return null;

    return (
        <div
            className="fixed left-0 w-full h-8 bg-yellow-400 opacity-20 pointer-events-none z-[9999]"
            style={{ top: mouseY - 16 }} // Center the bar on the cursor
        />
    );
};

export default ReadingGuide;
