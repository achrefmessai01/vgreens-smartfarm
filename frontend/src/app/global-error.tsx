'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html className="dark">
      <body className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          {/* Error Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-900/20">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">
              Something went wrong!
            </h2>
            <p className="text-gray-300">
              The application encountered a critical error. Please try
              refreshing the page.
            </p>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => reset()}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-3 text-white transition-colors hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
