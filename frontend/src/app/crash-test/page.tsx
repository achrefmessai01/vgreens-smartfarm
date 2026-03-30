'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Bug, TestTube } from 'lucide-react';

// Component that will crash when button is clicked
function CrashComponent({ sectionName }: { sectionName: string }) {
  const [shouldCrash, setShouldCrash] = useState(false);

  if (shouldCrash) {
    throw new Error(
      `${sectionName} section crashed intentionally for testing!`,
    );
  }

  return (
    <div className="rounded-lg border border-red-500/30 bg-red-900/10 p-4">
      <h3 className="mb-2 text-lg font-semibold text-red-400">
        {sectionName} Crash Test
      </h3>
      <p className="mb-4 text-sm text-gray-300">
        Click to crash this section and see isolated error handling
      </p>
      <button
        onClick={() => setShouldCrash(true)}
        className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
      >
        <Bug className="h-4 w-4" />
        Crash {sectionName}
      </button>
    </div>
  );
}

export default function ErrorTestPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-4 flex items-center gap-3 text-3xl font-bold text-white">
            <TestTube className="h-8 w-8 text-blue-400" />
            Error Handling Test Center
          </h1>
          <p className="text-gray-300">
            Test "Something went wrong" pages for different sections. When one
            section crashes, others should remain functional.
          </p>
        </div>

        {/* Error Boundaries Explanation */}
        <div className="mb-8 rounded-lg border border-blue-500/30 bg-blue-900/20 p-6">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-blue-400">
            <AlertTriangle className="h-5 w-5" />
            How It Works
          </h2>
          <div className="space-y-2 text-sm text-gray-300">
            <p>
              <strong>Isolated Error Boundaries:</strong> Each section has its
              own error page
            </p>
            <p>
              <strong>Section Crashes:</strong> If Farm Overview crashes,
              Harvest still works
            </p>
            <p>
              <strong>Smart Recovery:</strong> Each error page has specific
              actions for that section
            </p>
            <p>
              <strong>Development Mode:</strong> Shows error details to help
              debugging
            </p>
          </div>
        </div>

        {/* Test Buttons Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <CrashComponent sectionName="Farm Overview" />
          <CrashComponent sectionName="Harvest" />
          <CrashComponent sectionName="Alerts" />
          <CrashComponent sectionName="Warnings" />
          <CrashComponent sectionName="Dashboard" />
          <CrashComponent sectionName="Camera" />
        </div>

        {/* Navigation Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Visit Sections to Test Live Error Boundaries:
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/tenant/farm-overview"
              className="rounded-lg border border-green-500/30 bg-green-900/20 p-4 transition-colors hover:bg-green-900/30"
            >
              <h4 className="font-medium text-green-400">Farm Overview</h4>
              <p className="text-sm text-gray-400">
                Test farm overview error boundary
              </p>
            </Link>

            <Link
              href="/tenant/harvest"
              className="rounded-lg border border-yellow-500/30 bg-yellow-900/20 p-4 transition-colors hover:bg-yellow-900/30"
            >
              <h4 className="font-medium text-yellow-400">Harvest</h4>
              <p className="text-sm text-gray-400">
                Test harvest section error boundary
              </p>
            </Link>

            <Link
              href="/tenant/alerts"
              className="rounded-lg border border-red-500/30 bg-red-900/20 p-4 transition-colors hover:bg-red-900/30"
            >
              <h4 className="font-medium text-red-400">Alerts</h4>
              <p className="text-sm text-gray-400">
                Test alerts section error boundary
              </p>
            </Link>

            <Link
              href="/tenant/warnings"
              className="rounded-lg border border-orange-500/30 bg-orange-900/20 p-4 transition-colors hover:bg-orange-900/30"
            >
              <h4 className="font-medium text-orange-400">Warnings</h4>
              <p className="text-sm text-gray-400">
                Test warnings section error boundary
              </p>
            </Link>

            <Link
              href="/tenant/dashboard"
              className="rounded-lg border border-blue-500/30 bg-blue-900/20 p-4 transition-colors hover:bg-blue-900/30"
            >
              <h4 className="font-medium text-blue-400">Dashboard</h4>
              <p className="text-sm text-gray-400">
                Test dashboard error boundary
              </p>
            </Link>

            <Link
              href="/tenant/camera-livestream"
              className="rounded-lg border border-purple-500/30 bg-purple-900/20 p-4 transition-colors hover:bg-purple-900/30"
            >
              <h4 className="font-medium text-purple-400">Camera Stream</h4>
              <p className="text-sm text-gray-400">
                Test camera error boundary
              </p>
            </Link>
          </div>
        </div>

        {/* Test 404 */}
        <div className="mt-8 rounded-lg bg-gray-800 p-4">
          <h3 className="mb-2 text-lg font-semibold text-white">
            Test 404 Error:
          </h3>
          <Link
            href="/non-existent-page"
            className="inline-flex items-center gap-2 rounded bg-gray-700 px-4 py-2 text-gray-300 transition-colors hover:bg-gray-600"
          >
            Visit Non-existent Page
          </Link>
        </div>
      </div>
    </div>
  );
}
