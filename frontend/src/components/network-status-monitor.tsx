'use client';

import { useToast } from '@/components/ui/toast-provider';
import { Wifi, WifiOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function NetworkStatusMonitor() {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(true);
  const hasMountedRef = useRef(false);
  const lastKnownStatusRef = useRef<boolean | null>(null);

  useEffect(() => {
    const updateStatus = (online: boolean, showToast = true) => {
      setIsOnline(online);

      if (!hasMountedRef.current) {
        lastKnownStatusRef.current = online;
        hasMountedRef.current = true;
        return;
      }

      const previousStatus = lastKnownStatusRef.current;
      lastKnownStatusRef.current = online;

      if (!showToast || previousStatus === online) {
        return;
      }

      if (online) {
        toast({
          title: 'Connection restored',
          description:
            'You are back online. You can continue using the application.',
          duration: 3000,
          variant: 'default',
        });
      } else {
        toast({
          title: 'No internet connection',
          description:
            'Please turn on Wi-Fi or mobile data to use this application.',
          duration: 5000,
          variant: 'destructive',
        });
      }
    };

    const handleOnline = () => updateStatus(true);
    const handleOffline = () => updateStatus(false);

    updateStatus(navigator.onLine, false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  if (isOnline) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-6 shadow-2xl dark:bg-zinc-900">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <WifiOff className="h-6 w-6" />
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              No internet connection
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              This application requires an active internet connection. Please
              turn on Wi-Fi or mobile data to continue.
            </p>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              <Wifi className="h-4 w-4" />
              Waiting for connection…
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
