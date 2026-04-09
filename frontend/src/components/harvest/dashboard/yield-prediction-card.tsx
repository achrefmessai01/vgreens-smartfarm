import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/i18n';
import { Sparkles, TrendingUp } from 'lucide-react';

export function YieldPredictionCard() {
  const { t } = useI18n();
  const harvest = t.pages.harvest;

  return (
    <Card className="from-primary/10 via-background to-primary/5 border-primary/20 mb-6 bg-gradient-to-r shadow-md sm:mb-8">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg">
              {harvest?.yieldPredictionTitle ?? 'Yield Prediction'}
            </CardTitle>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              {harvest?.yieldPredictionSubtitle ??
                'Preview for upcoming harvest performance.'}
            </p>
          </div>
          <div className="bg-primary/15 text-primary rounded-full p-2">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap items-end justify-between gap-4 pt-0">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            {harvest?.predictedYieldLabel ?? 'Predicted Yield'}
          </p>
          <p className="text-2xl font-bold sm:text-3xl">
            {harvest?.predictedYieldValue ?? '1,280 kg'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
          <TrendingUp className="h-4 w-4" />
          {harvest?.yieldPredictionTrend ?? '+8.4% vs last month'}
        </div>
      </CardContent>
    </Card>
  );
}
