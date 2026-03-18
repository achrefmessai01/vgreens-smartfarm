'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Bug, TestTube } from 'lucide-react'

// Component that will crash when button is clicked
function CrashComponent({ sectionName }: { sectionName: string }) {
  const [shouldCrash, setShouldCrash] = useState(false)

  if (shouldCrash) {
    throw new Error(`${sectionName} section crashed intentionally for testing!`)
  }

  return (
    <div className="p-4 border border-red-500/30 rounded-lg bg-red-900/10">
      <h3 className="text-lg font-semibold text-red-400 mb-2">
        {sectionName} Crash Test
      </h3>
      <p className="text-gray-300 mb-4 text-sm">
        Click to crash this section and see isolated error handling
      </p>
      <button
        onClick={() => setShouldCrash(true)}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        <Bug className="h-4 w-4" />
        Crash {sectionName}
      </button>
    </div>
  )
}

export default function ErrorTestPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
            <TestTube className="h-8 w-8 text-blue-400" />
            Error Handling Test Center
          </h1>
          <p className="text-gray-300">
            Test "Something went wrong" pages for different sections. When one section crashes, 
            others should remain functional.
          </p>
        </div>

        {/* Error Boundaries Explanation */}
        <div className="mb-8 p-6 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            How It Works
          </h2>
          <div className="text-gray-300 space-y-2 text-sm">
            <p><strong>Isolated Error Boundaries:</strong> Each section has its own error page</p>
            <p><strong>Section Crashes:</strong> If Farm Overview crashes, Harvest still works</p>
            <p><strong>Smart Recovery:</strong> Each error page has specific actions for that section</p>
            <p><strong>Development Mode:</strong> Shows error details to help debugging</p>
          </div>
        </div>

        {/* Test Buttons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <CrashComponent sectionName="Farm Overview" />
          <CrashComponent sectionName="Harvest" />
          <CrashComponent sectionName="Alerts" />
          <CrashComponent sectionName="Warnings" />
          <CrashComponent sectionName="Dashboard" />
          <CrashComponent sectionName="Camera" />
        </div>

        {/* Navigation Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Visit Sections to Test Live Error Boundaries:</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/tenant/farm-overview"
              className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg hover:bg-green-900/30 transition-colors"
            >
              <h4 className="font-medium text-green-400">Farm Overview</h4>
              <p className="text-gray-400 text-sm">Test farm overview error boundary</p>
            </Link>
            
            <Link
              href="/tenant/harvest"
              className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg hover:bg-yellow-900/30 transition-colors"
            >
              <h4 className="font-medium text-yellow-400">Harvest</h4>
              <p className="text-gray-400 text-sm">Test harvest section error boundary</p>
            </Link>
            
            <Link
              href="/tenant/alerts"
              className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg hover:bg-red-900/30 transition-colors"
            >
              <h4 className="font-medium text-red-400">Alerts</h4>
              <p className="text-gray-400 text-sm">Test alerts section error boundary</p>
            </Link>
            
            <Link
              href="/tenant/warnings"
              className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg hover:bg-orange-900/30 transition-colors"
            >
              <h4 className="font-medium text-orange-400">Warnings</h4>
              <p className="text-gray-400 text-sm">Test warnings section error boundary</p>
            </Link>
            
            <Link
              href="/tenant/dashboard"
              className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg hover:bg-blue-900/30 transition-colors"
            >
              <h4 className="font-medium text-blue-400">Dashboard</h4>
              <p className="text-gray-400 text-sm">Test dashboard error boundary</p>
            </Link>
            
            <Link
              href="/tenant/camera-livestream"
              className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg hover:bg-purple-900/30 transition-colors"
            >
              <h4 className="font-medium text-purple-400">Camera Stream</h4>
              <p className="text-gray-400 text-sm">Test camera error boundary</p>
            </Link>
          </div>
        </div>

        {/* Test 404 */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Test 404 Error:</h3>
          <Link
            href="/non-existent-page"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
          >
            Visit Non-existent Page
          </Link>
        </div>
      </div>
    </div>
  )
}