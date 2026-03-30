'use client';

import * as React from 'react';
import { TiltCard } from './tilt-card';
import { cn } from '@/lib/utils';

export interface RecommendationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  orbClassName?: string;
  className?: string;
}

export function RecommendationCard({
  icon,
  title,
  description,
  orbClassName,
  className,
}: RecommendationCardProps) {
  return (
    <TiltCard className={className}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            {icon}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <p className="mt-2 text-sm">{description}</p>
        </div>
        <div className="flex items-center justify-center">
          <div className="relative h-20 w-20">
            <div
              className={cn(
                'absolute inset-0 [transform:rotateX(30deg)] rounded-full',
                'shadow-[0_10px_25px_rgba(6,182,212,0.15),inset_0_2px_8px_rgba(255,255,255,0.05)]',
                orbClassName ??
                  'bg-gradient-to-br from-cyan-500/90 to-emerald-900/85',
              )}
            />
            <div
              className="animate-spin-slow absolute inset-0 rounded-full border-2 border-white/10 mix-blend-overlay"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </TiltCard>
  );
}
