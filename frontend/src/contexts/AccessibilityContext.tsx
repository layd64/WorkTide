import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type FontSize = 'normal' | 'large' | 'xlarge';
type Saturation = 'normal' | 'low' | 'high' | 'bw';

interface AccessibilityContextType {
    fontSize: FontSize;
    setFontSize: (size: FontSize) => void;
    highContrast: boolean;
    setHighContrast: (enabled: boolean) => void;
    reducedMotion: boolean;
    setReducedMotion: (enabled: boolean) => void;
    highlightLinks: boolean;
    setHighlightLinks: (enabled: boolean) => void;
    bigCursor: boolean;
    setBigCursor: (enabled: boolean) => void;
    readingGuide: boolean;
    setReadingGuide: (enabled: boolean) => void;
    saturation: Saturation;
    setSaturation: (saturation: Saturation) => void;
    invertColors: boolean;
    setInvertColors: (enabled: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
};

interface AccessibilityProviderProps {
    children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
    // Initialize state from localStorage or defaults
    const [fontSize, setFontSizeState] = useState<FontSize>(() => {
        return (localStorage.getItem('accessibility_fontSize') as FontSize) || 'normal';
    });

    const [highContrast, setHighContrastState] = useState<boolean>(() => {
        return localStorage.getItem('accessibility_highContrast') === 'true';
    });

    const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
        return localStorage.getItem('accessibility_reducedMotion') === 'true';
    });

    const [highlightLinks, setHighlightLinksState] = useState<boolean>(() => {
        return localStorage.getItem('accessibility_highlightLinks') === 'true';
    });

    const [bigCursor, setBigCursorState] = useState<boolean>(() => {
        return localStorage.getItem('accessibility_bigCursor') === 'true';
    });

    const [readingGuide, setReadingGuideState] = useState<boolean>(() => {
        return localStorage.getItem('accessibility_readingGuide') === 'true';
    });

    const [saturation, setSaturationState] = useState<Saturation>(() => {
        return (localStorage.getItem('accessibility_saturation') as Saturation) || 'normal';
    });

    const [invertColors, setInvertColorsState] = useState<boolean>(() => {
        return localStorage.getItem('accessibility_invertColors') === 'true';
    });

    // Apply settings to document and persist to localStorage

    // Font Size
    useEffect(() => {
        localStorage.setItem('accessibility_fontSize', fontSize);

        const root = document.documentElement;
        switch (fontSize) {
            case 'large':
                root.style.fontSize = '110%';
                break;
            case 'xlarge':
                root.style.fontSize = '125%';
                break;
            default:
                root.style.fontSize = '100%';
                break;
        }
    }, [fontSize]);

    // High Contrast
    useEffect(() => {
        localStorage.setItem('accessibility_highContrast', String(highContrast));

        if (highContrast) {
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
    }, [highContrast]);

    // Reduced Motion
    useEffect(() => {
        localStorage.setItem('accessibility_reducedMotion', String(reducedMotion));

        if (reducedMotion) {
            document.documentElement.classList.add('motion-reduce');
        } else {
            document.documentElement.classList.remove('motion-reduce');
        }
    }, [reducedMotion]);

    // Highlight Links
    useEffect(() => {
        localStorage.setItem('accessibility_highlightLinks', String(highlightLinks));
        if (highlightLinks) {
            document.documentElement.classList.add('highlight-links');
        } else {
            document.documentElement.classList.remove('highlight-links');
        }
    }, [highlightLinks]);

    // Big Cursor
    useEffect(() => {
        localStorage.setItem('accessibility_bigCursor', String(bigCursor));
        if (bigCursor) {
            document.documentElement.classList.add('big-cursor');
        } else {
            document.documentElement.classList.remove('big-cursor');
        }
    }, [bigCursor]);

    // Reading Guide
    useEffect(() => {
        localStorage.setItem('accessibility_readingGuide', String(readingGuide));
        // The ReadingGuide component will handle the rendering based on this context value
    }, [readingGuide]);

    // Saturation
    useEffect(() => {
        localStorage.setItem('accessibility_saturation', saturation);
        document.documentElement.classList.remove('saturation-bw', 'saturation-low', 'saturation-high');
        if (saturation !== 'normal') {
            document.documentElement.classList.add(`saturation-${saturation}`);
        }
    }, [saturation]);

    // Invert Colors
    useEffect(() => {
        localStorage.setItem('accessibility_invertColors', String(invertColors));
        if (invertColors) {
            document.documentElement.classList.add('invert-colors');
        } else {
            document.documentElement.classList.remove('invert-colors');
        }
    }, [invertColors]);


    const setFontSize = (size: FontSize) => setFontSizeState(size);
    const setHighContrast = (enabled: boolean) => setHighContrastState(enabled);
    const setReducedMotion = (enabled: boolean) => setReducedMotionState(enabled);
    const setHighlightLinks = (enabled: boolean) => setHighlightLinksState(enabled);
    const setBigCursor = (enabled: boolean) => setBigCursorState(enabled);
    const setReadingGuide = (enabled: boolean) => setReadingGuideState(enabled);
    const setSaturation = (sat: Saturation) => setSaturationState(sat);
    const setInvertColors = (enabled: boolean) => setInvertColorsState(enabled);

    return (
        <AccessibilityContext.Provider
            value={{
                fontSize,
                setFontSize,
                highContrast,
                setHighContrast,
                reducedMotion,
                setReducedMotion,
                highlightLinks,
                setHighlightLinks,
                bigCursor,
                setBigCursor,
                readingGuide,
                setReadingGuide,
                saturation,
                setSaturation,
                invertColors,
                setInvertColors,
            }}
        >
            {children}
        </AccessibilityContext.Provider>
    );
};
