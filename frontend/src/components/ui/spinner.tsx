import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
}

function Spinner({ className }: SpinnerProps) {
  return (
    <Loader2
      aria-hidden="true"
      className={cn('h-4 w-4 animate-spin', className)}
    />
  );
}

export { Spinner };
