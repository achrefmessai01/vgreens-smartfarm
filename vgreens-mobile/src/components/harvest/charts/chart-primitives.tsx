import type { ReactNode } from 'react';
import { Line, Text as SvgText } from 'react-native-svg';

export interface AxisPadding {
  l: number;
  r: number;
  t: number;
  b: number;
}

export function buildTicks(min: number, max: number, count = 3): number[] {
  if (count < 2) return [max];
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + step * i);
}

export function formatTick(n: number): string {
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}k`;
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1);
}

export function formatAxisDate(raw: string): string {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw.slice(5);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

interface GridAxesProps {
  width: number;
  height: number;
  padding: AxisPadding;
  ticks: number[];
  stroke: string;
  textColor: string;
  formatY?: (n: number) => string;
}

export function GridAxes({
  width,
  height,
  padding,
  ticks,
  stroke,
  textColor,
  formatY = formatTick,
}: GridAxesProps): ReactNode {
  const innerH = height - padding.t - padding.b;
  return (
    <>
      {ticks.map((tick, i) => {
        const y = padding.t + innerH * (1 - i / (ticks.length - 1 || 1));
        return (
          <Line
            key={`g-${i}-${tick}`}
            x1={padding.l}
            y1={y}
            x2={width - padding.r}
            y2={y}
            stroke={stroke}
            strokeWidth={1}
            strokeDasharray="3,4"
          />
        );
      })}
      {ticks.map((tick, i) => {
        const y = padding.t + innerH * (1 - i / (ticks.length - 1 || 1));
        return (
          <SvgText
            key={`t-${i}-${tick}`}
            x={padding.l - 4}
            y={y + 3}
            fontSize={9}
            fill={textColor}
            textAnchor="end"
          >
            {formatY(tick)}
          </SvgText>
        );
      })}
    </>
  );
}

interface XAxisLabelsProps {
  labels: string[];
  width: number;
  height: number;
  padding: AxisPadding;
  textColor: string;
}

export function XAxisLabels({
  labels,
  width,
  height,
  padding,
  textColor,
}: XAxisLabelsProps): ReactNode {
  if (labels.length === 0) return null;
  const innerW = width - padding.l - padding.r;
  const y = height - padding.b + 12;
  const pickIndexes =
    labels.length <= 3
      ? labels.map((_, i) => i)
      : [0, Math.floor(labels.length / 2), labels.length - 1];
  return (
    <>
      {pickIndexes.map((i) => {
        const x =
          labels.length <= 1
            ? padding.l + innerW / 2
            : padding.l + (i / (labels.length - 1)) * innerW;
        const anchor: 'start' | 'middle' | 'end' =
          i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle';
        return (
          <SvgText
            key={`x-${i}`}
            x={x}
            y={y}
            fontSize={9}
            fill={textColor}
            textAnchor={anchor}
          >
            {formatAxisDate(labels[i])}
          </SvgText>
        );
      })}
    </>
  );
}
