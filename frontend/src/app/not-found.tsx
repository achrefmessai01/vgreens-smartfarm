'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/i18n';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* 404 Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-900/20">
          <span className="text-3xl font-bold text-blue-400">404</span>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            {t.errors.notFound.title}
          </h2>
          <p className="text-gray-300">{t.errors.notFound.description}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700"
          >
            <Home className="h-4 w-4" />
            {t.common.goHome}
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-800 px-4 py-3 text-gray-300 transition-colors hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.common.goBack}
          </button>
        </div>
      </div>
    </div>
  );
}
