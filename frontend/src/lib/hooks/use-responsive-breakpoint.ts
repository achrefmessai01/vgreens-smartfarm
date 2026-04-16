'use client';

import { useEffect, useState } from 'react';

type ResponsiveBreakpoint = 'md' | 'lg' | 'xl' | '2xl';

const breakpointValues: Record<ResponsiveBreakpoint, number> = {
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useResponsiveBreakpoint(
  breakpoint: ResponsiveBreakpoint,
  element?: HTMLElement | null,
) {
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const minWidth = breakpointValues[breakpoint];

    const getWidth = () => {
      return element?.clientWidth ?? window.innerWidth;
    };

    const checkSize = () => {
      setIsMobile(getWidth() < minWidth);
      setIsInitialized(true);
    };

    checkSize();

    const handleResize = () => {
      setIsMobile(getWidth() < minWidth);
    };

    window.addEventListener('resize', handleResize);

    if (!element || typeof ResizeObserver === 'undefined') {
      return () => window.removeEventListener('resize', handleResize);
    }

    const observer = new ResizeObserver(() => {
      checkSize();
    });
    observer.observe(element);

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [breakpoint, element]);

  return { isMobile, isInitialized };
}
