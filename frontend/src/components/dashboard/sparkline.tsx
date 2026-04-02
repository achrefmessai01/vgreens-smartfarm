'use client';

const W = 120;
const H = 28;

export interface SparklineProps {
  data?: number[];
  className?: string;
  strokeClassName?: string;
}

export function Sparkline({
  data = [10, 12, 8, 14, 11, 15],
  className,
  strokeClassName = 'stroke-cyan-500',
}: SparklineProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - min) / range) * H;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={W} height={H} className={className ?? 'block'} aria-hidden>
      <polyline
        fill="none"
        strokeWidth={2}
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={strokeClassName}
      />
    </svg>
  );
}
