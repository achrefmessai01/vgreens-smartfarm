'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { type Variety } from '@/lib/variety-data';
import { Card, CardContent } from '@/components/ui/card';

interface VarietyCardProps {
  variety: Variety;
  isSelected: boolean;
  onClick: () => void;
}

export function VarietyCard({
  variety,
  isSelected,
  onClick,
}: VarietyCardProps) {
  const { t } = useI18n();

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className={cn(
              'h-4 w-4 fill-yellow-400 text-yellow-400',
              isSelected && 'fill-yellow-300 text-yellow-300',
            )}
          />
        ))}
        {hasHalfStar && (
          <Star
            key="half"
            className={cn(
              'h-4 w-4 fill-yellow-200 text-yellow-200',
              isSelected && 'fill-yellow-300/50 text-yellow-300/50',
            )}
          />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={cn(
              'h-4 w-4 fill-gray-200 text-gray-200',
              isSelected && 'fill-white/20 text-white/20',
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <Card
      className={cn(
        'cursor-pointer border-0 shadow-sm transition-all hover:shadow-md',
        isSelected
          ? 'bg-primary text-primary-foreground shadow-lg'
          : 'bg-white dark:bg-gray-800',
      )}
      onClick={onClick}
    >
      <CardContent className="px-4 py-0">
        <div className="mb-4">
          <h3
            className={cn(
              'text-lg font-bold',
              isSelected
                ? 'text-primary-foreground'
                : 'text-gray-900 dark:text-gray-100',
            )}
          >
            {variety.name}
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span
              className={cn(
                isSelected
                  ? 'text-primary-foreground/90'
                  : 'text-gray-600 dark:text-gray-400',
              )}
            >
              {t.pages.nextCyclePlanner.yield}
            </span>
            <span
              className={cn(
                'font-semibold',
                isSelected
                  ? 'text-primary-foreground'
                  : 'text-gray-900 dark:text-gray-100',
              )}
            >
              {variety.yield} Kg
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span
              className={cn(
                isSelected
                  ? 'text-primary-foreground/90'
                  : 'text-gray-600 dark:text-gray-400',
              )}
            >
              {t.pages.nextCyclePlanner.shelfLife}
            </span>
            {renderStars(variety.shelfLife)}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span
              className={cn(
                isSelected
                  ? 'text-primary-foreground/90'
                  : 'text-gray-600 dark:text-gray-400',
              )}
            >
              {t.pages.nextCyclePlanner.taste}
            </span>
            {renderStars(variety.taste)}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span
              className={cn(
                isSelected
                  ? 'text-primary-foreground/90'
                  : 'text-gray-600 dark:text-gray-400',
              )}
            >
              {t.pages.nextCyclePlanner.diseaseResistance}
            </span>
            {renderStars(variety.diseaseResistance)}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span
              className={cn(
                isSelected
                  ? 'text-primary-foreground/90'
                  : 'text-gray-600 dark:text-gray-400',
              )}
            >
              {t.pages.nextCyclePlanner.plantCycle}
            </span>
            <span
              className={cn(
                'font-semibold',
                isSelected
                  ? 'text-primary-foreground'
                  : 'text-gray-900 dark:text-gray-100',
              )}
            >
              {variety.plantCycle}{' '}
              {variety.plantCycle === 1
                ? t.pages.nextCyclePlanner.month
                : t.pages.nextCyclePlanner.months}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
