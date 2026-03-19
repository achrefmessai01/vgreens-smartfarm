'use client'

import { useEffect } from 'react'
import { initializeErrorMonitoring } from '@/lib/error-monitoring'

/**
 * Component to initialize error monitoring on app startup
 * Should be placed in the root layout to ensure it runs early
 */
export function ErrorMonitoringInitializer() {
  useEffect(() => {
    // Initialize error monitoring system
    const cleanup = initializeErrorMonitoring()
    
    // Return cleanup function for component unmount
    return cleanup
  }, [])

  // This component doesn't render anything visible
  return null
}