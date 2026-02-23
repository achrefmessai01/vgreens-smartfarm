'use client'

import * as React from 'react'
import { useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface TiltCardProps {
  children: React.ReactNode
  className?: string
}

export function TiltCard({ children, className }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState({
    transform: 'perspective(800px) rotateX(0deg) rotateY(0deg)',
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      const rx = -py * 8
      const ry = px * 8
      setStyle({
        transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`,
      })
    }
    const onLeave = () =>
      setStyle({
        transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)',
      })
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        'rounded-lg border bg-card p-6 transition-transform will-change-transform shadow-md',
        className,
      )}
    >
      {children}
    </div>
  )
}
