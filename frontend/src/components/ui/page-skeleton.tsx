'use client'

import './page-skeleton.css'
import { cn } from '@/lib/utils'
import { LogoSVG } from './logo-svg'
import { Skeleton } from '@/components/ui/skeleton'

interface PageSkeletonProps {
  className?: string
}

export function PageSkeleton({ className }: PageSkeletonProps) {
  return (
    <div
      className={cn(
        'page-skeleton flex min-h-screen flex-col items-center justify-center bg-background',
        className,
      )}
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-2">
        <div className="perspective-scene">
          <div className="premium-3d-object">
            <div className="face front-face">
              <LogoSVG color="#016F7C" glow />
              <div className="surface-sheen" />
            </div>
            <div className="face back-face">
              <LogoSVG color="#004D56" />
            </div>
            <div className="ambient-aura" />
          </div>
        </div>

        {/* Enhanced Stylish Skeleton */}
        <div className="flex flex-col items-center gap-6 z-10">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-1 w-40 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary/40 font-medium animate-pulse">
              Initializing System
            </span>
          </div>

          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary/40"
                style={{
                  animation: 'dot-pulse 1.5s infinite ease-in-out',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
