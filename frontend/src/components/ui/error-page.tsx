'use client'

import { AlertTriangle, RefreshCw, LucideIcon, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
  description?: string
  sectionName?: string
  theme?: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'indigo' | 'cyan' | 'emerald'
  backLink?: {
    href: string
    label: string
    icon: LucideIcon
  }
  resetLabel?: string
}

const themeConfig = {
  red: {
    gradient: 'from-red-500/20 via-red-600/10 to-red-700/20',
    iconColor: 'text-red-400',
    iconBg: 'bg-gradient-to-br from-red-500/20 to-red-600/30',
    buttonGradient: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    glowColor: 'shadow-red-500/25',
    borderColor: 'border-red-500/20'
  },
  orange: {
    gradient: 'from-orange-500/20 via-orange-600/10 to-orange-700/20',
    iconColor: 'text-orange-400',
    iconBg: 'bg-gradient-to-br from-orange-500/20 to-orange-600/30',
    buttonGradient: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    glowColor: 'shadow-orange-500/25',
    borderColor: 'border-orange-500/20'
  },
  yellow: {
    gradient: 'from-yellow-500/20 via-yellow-600/10 to-yellow-700/20',
    iconColor: 'text-yellow-400',
    iconBg: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30',
    buttonGradient: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
    glowColor: 'shadow-yellow-500/25',
    borderColor: 'border-yellow-500/20'
  },
  green: {
    gradient: 'from-green-500/20 via-green-600/10 to-green-700/20',
    iconColor: 'text-green-400',
    iconBg: 'bg-gradient-to-br from-green-500/20 to-green-600/30',
    buttonGradient: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    glowColor: 'shadow-green-500/25',
    borderColor: 'border-green-500/20'
  },
  blue: {
    gradient: 'from-blue-500/20 via-blue-600/10 to-blue-700/20',
    iconColor: 'text-blue-400',
    iconBg: 'bg-gradient-to-br from-blue-500/20 to-blue-600/30',
    buttonGradient: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    glowColor: 'shadow-blue-500/25',
    borderColor: 'border-blue-500/20'
  },
  purple: {
    gradient: 'from-purple-500/20 via-purple-600/10 to-purple-700/20',
    iconColor: 'text-purple-400',
    iconBg: 'bg-gradient-to-br from-purple-500/20 to-purple-600/30',
    buttonGradient: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    glowColor: 'shadow-purple-500/25',
    borderColor: 'border-purple-500/20'
  },
  indigo: {
    gradient: 'from-indigo-500/20 via-indigo-600/10 to-indigo-700/20',
    iconColor: 'text-indigo-400',
    iconBg: 'bg-gradient-to-br from-indigo-500/20 to-indigo-600/30',
    buttonGradient: 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
    glowColor: 'shadow-indigo-500/25',
    borderColor: 'border-indigo-500/20'
  },
  cyan: {
    gradient: 'from-cyan-500/20 via-cyan-600/10 to-cyan-700/20',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/30',
    buttonGradient: 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700',
    glowColor: 'shadow-cyan-500/25',
    borderColor: 'border-cyan-500/20'
  },
  emerald: {
    gradient: 'from-emerald-500/20 via-emerald-600/10 to-emerald-700/20',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/30',
    buttonGradient: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
    glowColor: 'shadow-emerald-500/25',
    borderColor: 'border-emerald-500/20'
  }
}

export default function ErrorPage({
  error,
  reset,
  title = 'Something went wrong!',
  description = 'An unexpected error occurred. Please try again.',
  sectionName,
  theme = 'red',
  backLink,
  resetLabel = 'Try again'
}: ErrorPageProps) {
  const themeStyles = themeConfig[theme]

  return (
    <div className="relative flex items-center justify-center min-h-screen w-full p-8">
      {/* Main content card */}
      <div className={`relative w-full max-w-md bg-gray-900/60 backdrop-blur-xl border ${themeStyles.borderColor} rounded-2xl shadow-2xl ${themeStyles.glowColor} p-8`}>
        {/* Sparkle decorations */}
        <div className="absolute top-4 right-4">
          <Sparkles className="h-5 w-5 text-gray-400 animate-pulse" />
        </div>
        
        <div className="text-center space-y-8">
          {/* Icon section with enhanced styling */}
          <div className="relative">
            <div className={`mx-auto w-20 h-20 ${themeStyles.iconBg} backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border ${themeStyles.borderColor} transform hover:scale-105 transition-transform duration-300`}>
              <AlertTriangle className={`h-10 w-10 ${themeStyles.iconColor} animate-bounce`} />
            </div>
            {/* Glow effect */}
            <div className={`absolute inset-0 w-20 h-20 mx-auto ${themeStyles.iconBg} rounded-2xl blur-xl opacity-50 -z-10`}></div>
          </div>
          
          {/* Text content with improved typography */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent leading-tight">
              {title}
            </h2>
            <p className="text-gray-400 leading-relaxed max-w-sm mx-auto">
              {description}
            </p>
            {sectionName && (
              <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${themeStyles.gradient} border ${themeStyles.borderColor} text-sm font-medium text-gray-300`}>
                {sectionName} Section
              </div>
            )}
          </div>

          {/* Enhanced buttons */}
          <div className="space-y-3">
            <button
              onClick={() => reset()}
              className={`group w-full flex items-center justify-center gap-3 px-6 py-4 ${themeStyles.buttonGradient} text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${themeStyles.glowColor} border border-white/10`}
            >
              <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
              {resetLabel}
            </button>
            
            {backLink && (
              <Link
                href={backLink.href}
                className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-800/80 backdrop-blur-sm text-gray-300 font-medium rounded-xl border border-gray-600/30 hover:bg-gray-700/80 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-gray-500/50"
              >
                <backLink.icon className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                {backLink.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}