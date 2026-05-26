'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocaleFormatters } from '@/i18n';
import { Droplet, Zap, Leaf, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RevenueData {
  water: number;
  energy: number;
  consumables: number;
  labor: number;
}

interface RevenueCardProps {
  data: RevenueData;
  title: string;
  waterLabel: string;
  energyLabel: string;
  consumablesLabel: string;
  laborLabel: string;
  totalLabel: string;
}

export function RevenueCard({
  data,
  title,
  waterLabel,
  energyLabel,
  consumablesLabel,
  laborLabel,
  totalLabel,
}: RevenueCardProps) {
  const { formatCurrency } = useLocaleFormatters();
  const total = data.water + data.energy + data.consumables + data.labor;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Droplet className="h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">{waterLabel}</span>
          </div>
          <span className="font-medium">
            {formatCurrency(data.water, 'EUR')}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-muted-foreground">{energyLabel}</span>
          </div>
          <span className="font-medium">
            {formatCurrency(data.energy, 'EUR')}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">{consumablesLabel}</span>
          </div>
          <span className="font-medium">
            {formatCurrency(data.consumables, 'EUR')}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-500" />
            <span className="text-muted-foreground">{laborLabel}</span>
          </div>
          <span className="font-medium">
            {formatCurrency(data.labor, 'EUR')}
          </span>
        </div>
        <div className="mt-3 border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{totalLabel}</span>
            <span className="text-primary text-lg font-bold">
              {formatCurrency(total, 'EUR')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
