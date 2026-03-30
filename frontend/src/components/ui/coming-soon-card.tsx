'use client';

import * as React from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, type LucideIcon } from 'lucide-react';

interface ComingSoonCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badgeText?: string;
}

export function ComingSoonCard({
  icon: Icon,
  title,
  description,
  badgeText = 'Coming Soon',
}: ComingSoonCardProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center py-12">
      {/* Main Coming Soon Card */}
      <Card className="hover:shadow-3xl dark:border-primary/30 dark:bg-card/95 relative w-full max-w-2xl overflow-hidden border-2 shadow-2xl transition-all duration-300">
        {/* Animated Gradient Background Layers */}
        <div className="from-primary/10 via-primary/5 dark:from-primary/20 dark:via-primary/10 absolute inset-0 bg-gradient-to-br to-transparent dark:to-transparent" />
        <div className="via-primary/5 to-primary/10 dark:via-primary/15 dark:to-primary/25 absolute inset-0 animate-pulse bg-gradient-to-tr from-transparent" />
        <div className="from-primary/5 to-primary/10 dark:from-primary/15 dark:to-primary/20 absolute inset-0 bg-gradient-to-bl via-transparent" />

        {/* Decorative Animated Circles */}
        <div
          className="bg-primary/10 dark:bg-primary/25 absolute -top-20 -right-20 h-40 w-40 animate-pulse rounded-full blur-3xl dark:blur-3xl"
          style={{ animationDuration: '3s' }}
        />
        <div
          className="bg-primary/10 dark:bg-primary/25 absolute -bottom-20 -left-20 h-40 w-40 animate-pulse rounded-full blur-3xl dark:blur-3xl"
          style={{ animationDuration: '4s', animationDelay: '1s' }}
        />
        <div
          className="bg-primary/5 dark:bg-primary/20 absolute top-1/2 right-1/4 h-32 w-32 animate-pulse rounded-full blur-2xl dark:blur-2xl"
          style={{ animationDuration: '5s', animationDelay: '2s' }}
        />

        {/* Sparkle Icons with Animation */}
        <div
          className="absolute top-8 left-8 animate-pulse opacity-20 dark:opacity-40"
          style={{ animationDuration: '2s' }}
        >
          <Sparkles className="text-primary dark:text-primary-foreground h-6 w-6" />
        </div>
        <div
          className="absolute top-12 right-12 animate-pulse opacity-20 dark:opacity-40"
          style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
        >
          <Sparkles className="text-primary dark:text-primary-foreground h-5 w-5" />
        </div>
        <div
          className="absolute bottom-12 left-12 animate-pulse opacity-20 dark:opacity-40"
          style={{ animationDuration: '3s', animationDelay: '1s' }}
        >
          <Sparkles className="text-primary dark:text-primary-foreground h-4 w-4" />
        </div>
        <div
          className="absolute top-1/3 right-8 animate-pulse opacity-15 dark:opacity-35"
          style={{ animationDuration: '2.8s', animationDelay: '1.5s' }}
        >
          <Sparkles className="text-primary dark:text-primary-foreground h-3 w-3" />
        </div>

        <CardHeader className="relative px-6 py-16 text-center sm:px-12">
          {/* Animated Icon Container with Pulsing Rings */}
          <div className="from-primary/20 via-primary/15 to-primary/10 dark:from-primary/40 dark:via-primary/30 dark:to-primary/20 relative mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br shadow-xl">
            {/* Multiple Pulsing Rings for Depth */}
            <div
              className="border-primary/30 dark:border-primary-foreground/40 absolute inset-0 animate-ping rounded-full border-2"
              style={{ animationDuration: '2s' }}
            />
            <div
              className="border-primary/20 dark:border-primary-foreground/30 absolute inset-0 animate-ping rounded-full border-2"
              style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
            />
            <div
              className="border-primary/10 dark:border-primary-foreground/20 absolute inset-0 animate-ping rounded-full border"
              style={{ animationDuration: '3s', animationDelay: '1s' }}
            />

            {/* Icon with Subtle Animation */}
            <div className="relative z-10 transform transition-transform duration-300 hover:scale-110">
              <Icon className="text-primary dark:text-primary-foreground h-14 w-14 drop-shadow-lg" />
            </div>
          </div>

          {/* Badge with Animation */}
          <div className="mb-8">
            <Badge
              variant="secondary"
              className="dark:bg-secondary/80 dark:border-primary-foreground/20 dark:text-secondary-foreground border-2 px-5 py-2 text-sm font-semibold shadow-md transition-transform duration-200 hover:scale-105"
            >
              {badgeText}
            </Badge>
          </div>

          {/* Title with Gradient Text */}
          <CardTitle className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            <span className="from-foreground via-foreground/90 to-foreground/80 dark:from-card-foreground dark:via-card-foreground/95 dark:to-card-foreground/90 bg-gradient-to-r bg-clip-text text-transparent">
              {title}
            </span>
          </CardTitle>

          {/* Description with Better Typography */}
          <CardDescription className="text-muted-foreground/90 dark:text-muted-foreground/80 mx-auto max-w-2xl text-base leading-relaxed font-normal sm:text-lg md:text-xl">
            {description}
          </CardDescription>

          {/* Decorative Gradient Line */}
          <div className="via-primary/40 dark:via-primary-foreground/50 mx-auto mt-10 h-1.5 w-32 rounded-full bg-gradient-to-r from-transparent to-transparent shadow-lg" />
        </CardHeader>
      </Card>
    </div>
  );
}
