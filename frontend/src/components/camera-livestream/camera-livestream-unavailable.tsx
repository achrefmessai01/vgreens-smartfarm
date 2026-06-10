'use client';

import * as React from 'react';
import {
  ArrowRight,
  Brain,
  Cctv,
  MonitorPlay,
  PlayCircle,
  Video,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/i18n';

interface CameraLivestreamUnavailableProps {
  onRedirect?: () => void;
  redirectLabel?: string;
}

export function CameraLivestreamUnavailable({
  onRedirect,
  redirectLabel,
}: CameraLivestreamUnavailableProps) {
  const { t } = useI18n();
  const livestreamT = t.pages.cameraLivestream;

  const features = [
    {
      icon: MonitorPlay,
      title: livestreamT.features.realTimeMonitoring,
      description: livestreamT.features.realTimeMonitoringDesc,
    },
    {
      icon: Video,
      title: livestreamT.features.multipleCameras,
      description: livestreamT.features.multipleCamerasDesc,
    },
    {
      icon: PlayCircle,
      title: livestreamT.features.recording,
      description: livestreamT.features.recordingDesc,
    },
    {
      icon: Brain,
      title: livestreamT.features.aiAnalysis,
      description: livestreamT.features.aiAnalysisDesc,
    },
  ];

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 py-12">
      <Card className="dark:border-primary/30 dark:bg-card/95 relative w-full max-w-3xl overflow-hidden border-2 shadow-2xl">
        {/* Gradient background layers */}
        <div className="from-primary/10 via-primary/5 dark:from-primary/20 dark:via-primary/10 absolute inset-0 bg-gradient-to-br to-transparent" />
        <div
          className="bg-primary/10 dark:bg-primary/25 absolute -top-24 -right-24 h-48 w-48 animate-pulse rounded-full blur-3xl"
          style={{ animationDuration: '4s' }}
        />
        <div
          className="bg-primary/10 dark:bg-primary/25 absolute -bottom-24 -left-24 h-48 w-48 animate-pulse rounded-full blur-3xl"
          style={{ animationDuration: '5s', animationDelay: '1s' }}
        />

        {/* Viewfinder corner brackets */}
        <div className="border-primary/30 dark:border-primary/50 pointer-events-none absolute top-5 left-5 h-8 w-8 rounded-tl-md border-t-2 border-l-2" />
        <div className="border-primary/30 dark:border-primary/50 pointer-events-none absolute top-5 right-5 h-8 w-8 rounded-tr-md border-t-2 border-r-2" />
        <div className="border-primary/30 dark:border-primary/50 pointer-events-none absolute bottom-5 left-5 h-8 w-8 rounded-bl-md border-b-2 border-l-2" />
        <div className="border-primary/30 dark:border-primary/50 pointer-events-none absolute right-5 bottom-5 h-8 w-8 rounded-br-md border-b-2 border-r-2" />

        <CardContent className="relative px-6 py-14 text-center sm:px-12">
          {/* Camera icon with pulsing rings */}
          <div className="from-primary/20 via-primary/15 to-primary/10 dark:from-primary/40 dark:via-primary/30 dark:to-primary/20 relative mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br shadow-xl">
            <div
              className="border-primary/30 dark:border-primary-foreground/40 absolute inset-0 animate-ping rounded-full border-2"
              style={{ animationDuration: '2.5s' }}
            />
            <div
              className="border-primary/15 dark:border-primary-foreground/25 absolute -inset-3 animate-ping rounded-full border"
              style={{ animationDuration: '3s', animationDelay: '0.75s' }}
            />
            <Cctv className="text-primary dark:text-primary-foreground relative z-10 h-12 w-12 drop-shadow-lg" />
          </div>

          <Badge
            variant="secondary"
            className="dark:bg-secondary/80 dark:border-primary-foreground/20 mb-6 border-2 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase shadow-md"
          >
            <span className="bg-primary mr-1.5 h-2 w-2 animate-pulse rounded-full" />
            {livestreamT.comingSoon}
          </Badge>

          <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {livestreamT.title}
          </h2>

          <p className="text-muted-foreground mx-auto max-w-xl text-base leading-relaxed sm:text-lg">
            {livestreamT.comingSoonDescription}
          </p>

          <div className="via-primary/40 mx-auto mt-8 h-1 w-28 rounded-full bg-gradient-to-r from-transparent to-transparent" />

          {/* Feature highlights */}
          <div className="mt-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="border-border/60 bg-background/60 dark:border-primary/20 dark:bg-card/60 hover:border-primary/40 flex items-start gap-3 rounded-lg border p-4 backdrop-blur-sm transition-colors duration-200"
              >
                <div className="bg-primary/10 dark:bg-primary/25 flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
                  <feature.icon className="text-primary dark:text-primary-foreground h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-foreground text-sm font-semibold">
                    {feature.title}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {onRedirect && (
            <div className="mt-10">
              <Button
                onClick={onRedirect}
                size="lg"
                className="group px-8 text-base font-semibold shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
              >
                <span className="flex items-center gap-2">
                  {redirectLabel ?? t.pages.admin.features.goToDashboard}
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
