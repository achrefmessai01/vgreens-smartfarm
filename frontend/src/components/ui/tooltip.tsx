'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  className?: string;
}

export function Tooltip({
  children,
  content,
  side = 'top',
  align = 'center',
  delayDuration = 200,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
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

  const handleMouseEnter = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delayDuration);
  }, [delayDuration]);

  const handleMouseLeave = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  }, []);

  const wrapperRef = React.useCallback((node: HTMLDivElement | null) => {
    if (node) {
      // Find the first actual DOM element child
      const firstChild = node.firstElementChild as HTMLElement | null;
      triggerRef.current = firstChild;
    }
  }, []);

  React.useEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [isVisible, updatePosition]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={wrapperRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        style={{ display: 'contents' }}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            'animate-in fade-in-0 zoom-in-95 pointer-events-none fixed z-50',
            'border-border bg-popover text-popover-foreground rounded-md border px-3 py-1.5 text-sm shadow-md',
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
