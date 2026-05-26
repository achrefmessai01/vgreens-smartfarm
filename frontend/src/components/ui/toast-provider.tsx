'use client';

import * as React from 'react';
import { AlertTriangle, Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

type ToastVariant = 'default' | 'destructive';

interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastInput {
  id?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
}

interface ToastRecord extends Required<
  Pick<ToastInput, 'id' | 'variant' | 'duration'>
> {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastAction;
}

interface ToastContextValue {
  toast: (input: ToastInput) => string;
  dismiss: (id: string) => void;
}

const DEFAULT_TOAST_DURATION = 10000;
const MAX_TOASTS = 1;

const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined,
);

function createToastId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastRecord[];
  onDismiss: (id: string) => void;
}) {
  const { t } = useI18n();
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] flex items-start justify-end p-3 sm:p-6">
      <div className="flex w-full max-w-[18.5rem] flex-col gap-2.5 sm:max-w-sm sm:gap-3">
        {toasts.map((toast) => {
          const Icon = toast.variant === 'destructive' ? AlertTriangle : Bell;

          return (
            <section
              key={toast.id}
              role={toast.variant === 'destructive' ? 'alert' : 'status'}
              aria-live={
                toast.variant === 'destructive' ? 'assertive' : 'polite'
              }
              className={cn(
                'animate-in slide-in-from-top-2 fade-in-0 zoom-in-95 bg-background/95 pointer-events-auto rounded-lg border p-3 shadow-lg backdrop-blur sm:rounded-xl sm:p-4',
                toast.variant === 'destructive'
                  ? 'border-destructive/30 bg-destructive/10'
                  : 'border-border',
              )}
            >
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div
                  className={cn(
                    'mt-0.5 rounded-full p-1.5 sm:p-2',
                    toast.variant === 'destructive'
                      ? 'bg-destructive/15 text-destructive'
                      : 'bg-primary/10 text-primary',
                  )}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-[13px] leading-4 font-semibold sm:text-sm sm:leading-5">
                    {toast.title}
                  </p>

                  {toast.description ? (
                    <div className="text-muted-foreground mt-0.5 text-xs leading-4 sm:mt-1 sm:text-sm sm:leading-5">
                      {toast.description}
                    </div>
                  ) : null}

                  {toast.action ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className={cn(
                        'mt-2 h-7 w-fit px-2.5 text-xs sm:mt-3 sm:h-8 sm:px-3 sm:text-sm',
                        toast.variant === 'destructive' &&
                          'border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive',
                      )}
                      onClick={() => {
                        toast.action?.onClick();
                        onDismiss(toast.id);
                      }}
                    >
                      {toast.action.label}
                    </Button>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => onDismiss(toast.id)}
                  className="text-muted-foreground hover:bg-accent hover:text-foreground focus:ring-ring rounded-md p-0.5 transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none sm:p-1"
                  aria-label={t.common.dismissNotification}
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastRecord[]>([]);
  const timersRef = React.useRef<Map<string, number>>(new Map());

  const clearTimer = React.useCallback((id: string) => {
    const timerId = timersRef.current.get(id);

    if (timerId) {
      window.clearTimeout(timerId);
      timersRef.current.delete(id);
    }
  }, []);

  const dismiss = React.useCallback(
    (id: string) => {
      clearTimer(id);
      setToasts((currentToasts) =>
        currentToasts.filter((toast) => toast.id !== id),
      );
    },
    [clearTimer],
  );

  const scheduleDismiss = React.useCallback(
    (id: string, duration: number) => {
      clearTimer(id);

      if (duration <= 0) {
        return;
      }

      const timerId = window.setTimeout(() => {
        dismiss(id);
      }, duration);

      timersRef.current.set(id, timerId);
    },
    [clearTimer, dismiss],
  );

  const toast = React.useCallback(
    (input: ToastInput) => {
      const id = input.id ?? createToastId();
      const nextToast: ToastRecord = {
        id,
        title: input.title,
        description: input.description,
        variant: input.variant ?? 'default',
        duration: input.duration ?? DEFAULT_TOAST_DURATION,
        action: input.action,
      };

      setToasts((currentToasts) => {
        const dedupedToasts = currentToasts.filter((toast) => toast.id !== id);
        const nextToasts = [...dedupedToasts, nextToast];
        const overflowToasts = nextToasts.slice(
          0,
          Math.max(0, nextToasts.length - MAX_TOASTS),
        );

        overflowToasts.forEach((toastToRemove) => {
          clearTimer(toastToRemove.id);
        });

        return nextToasts.slice(-MAX_TOASTS);
      });

      scheduleDismiss(id, nextToast.duration);
      return id;
    },
    [clearTimer, scheduleDismiss],
  );

  React.useEffect(() => {
    const timers = timersRef.current;

    return () => {
      timers.forEach((timerId) => {
        window.clearTimeout(timerId);
      });
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
