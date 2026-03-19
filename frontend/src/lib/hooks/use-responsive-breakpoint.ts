'use client';

import { useEffect, useState } from 'react';

type ResponsiveBreakpoint = 'md' | 'lg' | 'xl';

const breakpointValues: Record<ResponsiveBreakpoint, number> = {
  md: 768,
  lg: 1024,
  xl: 1280,
};

export function useResponsiveBreakpoint(breakpoint: ResponsiveBreakpoint) {
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const minWidth = breakpointValues[breakpoint];

    // Check initial state
    const checkSize = () => {
      setIsMobile(window.innerWidth < minWidth);
      setIsInitialized(true);
    };

    checkSize();

    // Set up resize listener
    const handleResize = () => {
      setIsMobile(window.innerWidth < minWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return { isMobile, isInitialized };
}
