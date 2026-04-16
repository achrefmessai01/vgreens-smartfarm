'use client';

import { useToast } from '@/components/ui/toast-provider';
import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NetworkStatusMonitor() {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(true);
  const [hasShownOfflineToast, setHasShownOfflineToast] = useState(false);

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setHasShownOfflineToast(false);

      toast({
        title: 'Connection Restored',
        description: 'You are back online.',
        duration: 3000,
        variant: 'default',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);

      if (!hasShownOfflineToast) {
        setHasShownOfflineToast(true);
        toast({
          title: 'No Internet Connection',
          description: 'Some features may be unavailable.',
          duration: 5000,
          variant: 'destructive',
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast, hasShownOfflineToast]);

  // Show persistent indicator when offline
  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-md bg-orange-600 px-4 py-2 text-sm text-white shadow-lg">
        <WifiOff className="h-4 w-4" />
        <span>Offline</span>
      </div>
    );
  }

  return null;
}
