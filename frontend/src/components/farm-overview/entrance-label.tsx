'use client';

import type { DoorPosition } from '@/generated/graphql';
import * as React from 'react';

interface EntranceLabelProps {
  label: string;
  doorPosition?: DoorPosition | null;
}

interface EntrancePosition {
  className: string;
  style?: React.CSSProperties;
}

function getEntrancePosition(
  doorPosition?: DoorPosition | null,
): EntrancePosition {
  // Default to BOTTOM_LEFT if no position specified
  const position = doorPosition ?? 'BOTTOM_LEFT';

  const baseClasses =
    'bg-secondary text-secondary-foreground absolute flex items-center justify-center border shadow-sm';

  switch (position) {
    // Bottom edge positions (horizontal bars)
    case 'BOTTOM_LEFT':
      return {
        className: `${baseClasses} bottom-0 left-0 h-4 w-[5.75rem] sm:h-8 sm:w-[12.5rem]`,
      };
    case 'BOTTOM_CENTER':
      return {
        className: `${baseClasses} bottom-0 left-1/2 h-4 w-[5.75rem] sm:h-8 sm:w-[12.5rem]`,
        style: { transform: 'translateX(-50%)' },
      };
    case 'BOTTOM_RIGHT':
      return {
        className: `${baseClasses} bottom-0 right-0 h-4 w-[5.75rem] sm:h-8 sm:w-[12.5rem]`,
      };

    // Top edge positions (horizontal bars)
    case 'TOP_LEFT':
      return {
        className: `${baseClasses} top-0 left-0 h-4 w-[5.75rem] sm:h-8 sm:w-[12.5rem]`,
      };
    case 'TOP_CENTER':
      return {
        className: `${baseClasses} top-0 left-1/2 h-4 w-[5.75rem] sm:h-8 sm:w-[12.5rem]`,
        style: { transform: 'translateX(-50%)' },
      };
    case 'TOP_RIGHT':
      return {
        className: `${baseClasses} top-0 right-0 h-4 w-[5.75rem] sm:h-8 sm:w-[12.5rem]`,
      };

    // Left edge positions (vertical bars)
    case 'LEFT_BOTTOM':
      return {
        className: `${baseClasses} bottom-0 left-0 h-[5.75rem] w-4 sm:h-[12.5rem] sm:w-8`,
      };
    case 'LEFT_CENTER':
      return {
        className: `${baseClasses} left-0 top-1/2 h-[5.75rem] w-4 sm:h-[12.5rem] sm:w-8`,
        style: { transform: 'translateY(-50%)' },
      };
    case 'LEFT_TOP':
      return {
        className: `${baseClasses} top-0 left-0 h-[5.75rem] w-4 sm:h-[12.5rem] sm:w-8`,
      };

    // Right edge positions (vertical bars)
    case 'RIGHT_BOTTOM':
      return {
        className: `${baseClasses} bottom-0 right-0 h-[5.75rem] w-4 sm:h-[12.5rem] sm:w-8`,
      };
    case 'RIGHT_CENTER':
      return {
        className: `${baseClasses} right-0 top-1/2 h-[5.75rem] w-4 sm:h-[12.5rem] sm:w-8`,
        style: { transform: 'translateY(-50%)' },
      };
    case 'RIGHT_TOP':
      return {
        className: `${baseClasses} top-0 right-0 h-[5.75rem] w-4 sm:h-[12.5rem] sm:w-8`,
      };

    default:
      return {
        className: `${baseClasses} bottom-0 left-0 h-[5.75rem] w-4 sm:h-[12.5rem] sm:w-8`,
      };
  }
}

function isVerticalEntrance(doorPosition?: DoorPosition | null): boolean {
  if (!doorPosition) return true; // Default LEFT_BOTTOM is vertical
  return [
    'LEFT_BOTTOM',
    'LEFT_CENTER',
    'LEFT_TOP',
    'RIGHT_BOTTOM',
    'RIGHT_CENTER',
    'RIGHT_TOP',
  ].includes(doorPosition);
}

export function EntranceLabel({ label, doorPosition }: EntranceLabelProps) {
  const entrancePos = getEntrancePosition(doorPosition);
  const isVertical = isVerticalEntrance(doorPosition);

  return (
    <div
      className={entrancePos.className}
      style={entrancePos.style}
      aria-label={label}
    >
      <span
        className="text-[7px] font-semibold tracking-[0.08em] whitespace-nowrap uppercase sm:text-[12px] sm:tracking-[0.18em]"
        style={
          isVertical
            ? {
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
              }
            : undefined
        }
      >
        {label}
      </span>
    </div>
  );
}
