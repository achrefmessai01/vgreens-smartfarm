'use client';

import { RefreshCw, WifiOff } from 'lucide-react';

export default function OfflinePage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* WiFi Off Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-900/20">
          <WifiOff className="h-10 w-10 text-orange-400" />
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-white">
            No Internet Connection
          </h1>
          <p className="text-lg text-gray-300">
            Please check your connection and try again.
          </p>
          <p className="text-sm text-gray-400">
            Connect to Wi-Fi or mobile data to continue using vGreens Lab.
          </p>
        </div>

        {/* Reload Button */}
        <button
          onClick={handleReload}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-orange-600 px-4 py-3 text-white transition-colors hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
        >
          <RefreshCw className="h-5 w-5" />
          Reload Page
        </button>

        {/* Additional Info */}
        <div className="pt-4 text-xs text-gray-500">
          <p>Make sure you&apos;re connected to the internet</p>
        </div>
      </div>
    </div>
  );
}
