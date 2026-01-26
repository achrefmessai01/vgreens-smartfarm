'use client'

import * as React from 'react'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, type LucideIcon } from 'lucide-react'

interface ComingSoonCardProps {
  icon: LucideIcon
  title: string
  description: string
  badgeText?: string
}

export function ComingSoonCard({
  icon: Icon,
  title,
  description,
  badgeText = 'Coming Soon',
}: ComingSoonCardProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] py-12">
      {/* Main Coming Soon Card */}
      <Card className="relative overflow-hidden border-2 w-full max-w-2xl shadow-2xl transition-all duration-300 hover:shadow-3xl dark:border-primary/30 dark:bg-card/95">
        {/* Animated Gradient Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-primary/10 animate-pulse dark:via-primary/15 dark:to-primary/25" />
        <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 via-transparent to-primary/10 dark:from-primary/15 dark:to-primary/20" />

        {/* Decorative Animated Circles */}
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl animate-pulse dark:bg-primary/25 dark:blur-3xl"
          style={{ animationDuration: '3s' }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl animate-pulse dark:bg-primary/25 dark:blur-3xl"
          style={{ animationDuration: '4s', animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-primary/5 blur-2xl animate-pulse dark:bg-primary/20 dark:blur-2xl"
          style={{ animationDuration: '5s', animationDelay: '2s' }}
        />

        {/* Sparkle Icons with Animation */}
        <div
          className="absolute top-8 left-8 opacity-20 animate-pulse dark:opacity-40"
          style={{ animationDuration: '2s' }}
        >
          <Sparkles className="h-6 w-6 text-primary dark:text-primary-foreground" />
        </div>
        <div
          className="absolute top-12 right-12 opacity-20 animate-pulse dark:opacity-40"
          style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
        >
          <Sparkles className="h-5 w-5 text-primary dark:text-primary-foreground" />
        </div>
        <div
          className="absolute bottom-12 left-12 opacity-20 animate-pulse dark:opacity-40"
          style={{ animationDuration: '3s', animationDelay: '1s' }}
        >
          <Sparkles className="h-4 w-4 text-primary dark:text-primary-foreground" />
        </div>
        <div
          className="absolute top-1/3 right-8 opacity-15 animate-pulse dark:opacity-35"
          style={{ animationDuration: '2.8s', animationDelay: '1.5s' }}
        >
          <Sparkles className="h-3 w-3 text-primary dark:text-primary-foreground" />
        </div>

        <CardHeader className="relative text-center py-16 px-6 sm:px-12">
          {/* Animated Icon Container with Pulsing Rings */}
          <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 dark:from-primary/40 dark:via-primary/30 dark:to-primary/20 shadow-xl relative">
            {/* Multiple Pulsing Rings for Depth */}
            <div
              className="absolute inset-0 rounded-full border-2 border-primary/30 dark:border-primary-foreground/40 animate-ping"
              style={{ animationDuration: '2s' }}
            />
            <div
              className="absolute inset-0 rounded-full border-2 border-primary/20 dark:border-primary-foreground/30 animate-ping"
              style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
            />
            <div
              className="absolute inset-0 rounded-full border border-primary/10 dark:border-primary-foreground/20 animate-ping"
              style={{ animationDuration: '3s', animationDelay: '1s' }}
            />

            {/* Icon with Subtle Animation */}
            <div className="relative z-10 transform transition-transform duration-300 hover:scale-110">
              <Icon className="h-14 w-14 text-primary dark:text-primary-foreground drop-shadow-lg" />
            </div>
          </div>

          {/* Badge with Animation */}
          <div className="mb-8">
            <Badge
              variant="secondary"
              className="px-5 py-2 text-sm font-semibold shadow-md border-2 hover:scale-105 transition-transform duration-200 dark:bg-secondary/80 dark:border-primary-foreground/20 dark:text-secondary-foreground"
            >
              {badgeText}
            </Badge>
          </div>

          {/* Title with Gradient Text */}
          <CardTitle className="text-4xl sm:text-5xl md:text-6xl mb-6 font-bold tracking-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 dark:from-card-foreground dark:via-card-foreground/95 dark:to-card-foreground/90 bg-clip-text text-transparent">
              {title}
            </span>
          </CardTitle>

          {/* Description with Better Typography */}
          <CardDescription className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-muted-foreground/90 dark:text-muted-foreground/80 font-normal">
            {description}
          </CardDescription>

          {/* Decorative Gradient Line */}
          <div className="mt-10 mx-auto w-32 h-1.5 bg-gradient-to-r from-transparent via-primary/40 dark:via-primary-foreground/50 to-transparent rounded-full shadow-lg" />
        </CardHeader>
      </Card>
    </div>
  )
}
