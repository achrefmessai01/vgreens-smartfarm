'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  hideDelayDuration?: number;
  interactive?: boolean;
  className?: string;
}

export function Tooltip({
  children,
  content,
  side = 'top',
  align = 'center',
  delayDuration = 200,
  hideDelayDuration = 120,
  interactive = false,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const openTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);

  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const offset = 8; // Gap between trigger and tooltip

    let top = 0;
    let left = 0;

    // Calculate position based on side
    switch (side) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - offset;
        left = triggerRect.left + triggerRect.width / 2;
        if (align === 'start') left = triggerRect.left;
        else if (align === 'end') left = triggerRect.right;
        else left -= tooltipRect.width / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + offset;
        left = triggerRect.left + triggerRect.width / 2;
        if (align === 'start') left = triggerRect.left;
        else if (align === 'end') left = triggerRect.right;
        else left -= tooltipRect.width / 2;
        break;
      case 'left':
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left - tooltipRect.width - offset;
        break;
      case 'right':
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + offset;
        break;
    }

    // Keep tooltip within viewport bounds
    const padding = 8;
    top = Math.max(
      padding,
      Math.min(top, window.innerHeight - tooltipRect.height - padding),
    );
    left = Math.max(
      padding,
      Math.min(left, window.innerWidth - tooltipRect.width - padding),
    );

    setPosition({ top, left });
  }, [side, align]);

  const clearOpenTimeout = React.useCallback(() => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
  }, []);

  const clearCloseTimeout = React.useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const openTooltip = React.useCallback(() => {
    clearCloseTimeout();
    clearOpenTimeout();
    openTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      openTimeoutRef.current = null;
    }, delayDuration);
  }, [clearCloseTimeout, clearOpenTimeout, delayDuration]);

  const closeTooltip = React.useCallback(
    (delay = interactive ? hideDelayDuration : 0) => {
      clearOpenTimeout();
      clearCloseTimeout();

      if (delay <= 0) {
        setIsVisible(false);
        return;
      }

      closeTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        closeTimeoutRef.current = null;
      }, delay);
    },
    [clearCloseTimeout, clearOpenTimeout, hideDelayDuration, interactive],
  );

  const handleMouseEnter = React.useCallback(() => {
    if (isVisible) {
      clearCloseTimeout();
      return;
    }

    openTooltip();
  }, [clearCloseTimeout, isVisible, openTooltip]);

  const handleMouseLeave = React.useCallback(() => {
    closeTooltip();
  }, [closeTooltip]);

  const handleTooltipMouseEnter = React.useCallback(() => {
    if (!interactive) return;
    clearOpenTimeout();
    clearCloseTimeout();
    setIsVisible(true);
  }, [clearCloseTimeout, clearOpenTimeout, interactive]);

  const handleTooltipMouseLeave = React.useCallback(() => {
    if (!interactive) return;
    closeTooltip(hideDelayDuration);
  }, [closeTooltip, hideDelayDuration, interactive]);

  const handleFocus = React.useCallback(() => {
    if (isVisible) {
      clearCloseTimeout();
      return;
    }

    openTooltip();
  }, [clearCloseTimeout, isVisible, openTooltip]);

  const handleBlur = React.useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      const nextFocused = event.relatedTarget as Node | null;
      if (interactive && tooltipRef.current?.contains(nextFocused)) {
        return;
      }

      closeTooltip();
    },
    [closeTooltip, interactive],
  );

  const handleTooltipBlur = React.useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      if (!interactive) return;

      const nextFocused = event.relatedTarget as Node | null;
      if (triggerRef.current?.contains(nextFocused)) {
        return;
      }

      closeTooltip(hideDelayDuration);
    },
    [closeTooltip, hideDelayDuration, interactive],
  );

  const wrapperRef = React.useCallback((node: HTMLDivElement | null) => {
    if (node) {
      // Find the first actual DOM element child
      const firstChild = node.firstElementChild as HTMLElement | null;
      triggerRef.current = firstChild;
    }
  }, []);

  React.useEffect(() => {
    if (!isVisible) return;

    const frameId = window.requestAnimationFrame(updatePosition);
    const handleViewportChange = () => updatePosition();

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [content, isVisible, updatePosition]);

  React.useEffect(() => {
    return () => {
      clearOpenTimeout();
      clearCloseTimeout();
    };
  }, [clearCloseTimeout, clearOpenTimeout]);

  return (
    <>
      <div
        ref={wrapperRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{ display: 'contents' }}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          onFocus={handleTooltipMouseEnter}
          onBlur={handleTooltipBlur}
          className={cn(
            'animate-in fade-in-0 zoom-in-95 fixed z-50',
            'border-border bg-popover text-popover-foreground rounded-md border px-3 py-1.5 text-sm shadow-md',
            interactive ? 'pointer-events-auto' : 'pointer-events-none',
            className,
          )}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}
