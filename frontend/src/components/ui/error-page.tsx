'use client';

import {
  AlertTriangle,
  RefreshCw,
  LucideIcon,
  Sparkles,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  sectionName?: string;
  theme?:
    | 'red'
    | 'orange'
    | 'yellow'
    | 'green'
    | 'blue'
    | 'purple'
    | 'indigo'
    | 'cyan'
    | 'emerald';
  backLink?: {
    href: string;
    label: string;
    icon: LucideIcon;
  };
  resetLabel?: string;
}

const themeConfig = {
  red: {
    // Light mode colors
    lightBg: 'bg-white/90 dark:bg-gray-900/60',
    lightBorder: 'border-red-200/50 dark:border-red-500/20',
    lightIconBg:
      'bg-gradient-to-br from-red-100/80 to-red-200/60 dark:from-red-500/20 dark:to-red-600/30',
    lightIconColor: 'text-red-600 dark:text-red-400',
    lightTextPrimary: 'text-gray-900 dark:text-white',
    lightTextSecondary: 'text-gray-600 dark:text-gray-300',
    lightSectionBadge:
      'bg-red-50/80 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200/30 dark:border-red-500/20',
    buttonGradient:
      'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    lightBackButton:
      'bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200/50 dark:border-gray-600/30 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 hover:border-gray-300/50 dark:hover:border-gray-500/50',
    lightReportButton:
      'bg-amber-50/80 dark:bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-500/30 hover:bg-amber-100/80 dark:hover:bg-amber-600/30 hover:border-amber-300/50 dark:hover:border-amber-400/50',
    glowColor: 'shadow-red-200/40 dark:shadow-red-500/25',
  },
  orange: {
    lightBg: 'bg-white/90 dark:bg-gray-900/60',
    lightBorder: 'border-orange-200/50 dark:border-orange-500/20',
    lightIconBg:
      'bg-gradient-to-br from-orange-100/80 to-orange-200/60 dark:from-orange-500/20 dark:to-orange-600/30',
    lightIconColor: 'text-orange-600 dark:text-orange-400',
    lightTextPrimary: 'text-gray-900 dark:text-white',
    lightTextSecondary: 'text-gray-600 dark:text-gray-300',
    lightSectionBadge:
      'bg-orange-50/80 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200/30 dark:border-orange-500/20',
    buttonGradient:
      'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    lightBackButton:
      'bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200/50 dark:border-gray-600/30 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 hover:border-gray-300/50 dark:hover:border-gray-500/50',
    lightReportButton:
      'bg-amber-50/80 dark:bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-500/30 hover:bg-amber-100/80 dark:hover:bg-amber-600/30 hover:border-amber-300/50 dark:hover:border-amber-400/50',
    glowColor: 'shadow-orange-200/40 dark:shadow-orange-500/25',
  },
  yellow: {
    lightBg: 'bg-white/90 dark:bg-gray-900/60',
    lightBorder: 'border-yellow-200/50 dark:border-yellow-500/20',
    lightIconBg:
      'bg-gradient-to-br from-yellow-100/80 to-yellow-200/60 dark:from-yellow-500/20 dark:to-yellow-600/30',
    lightIconColor: 'text-yellow-600 dark:text-yellow-400',
    lightTextPrimary: 'text-gray-900 dark:text-white',
    lightTextSecondary: 'text-gray-600 dark:text-gray-300',
    lightSectionBadge:
      'bg-yellow-50/80 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200/30 dark:border-yellow-500/20',
    buttonGradient:
      'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
    lightBackButton:
      'bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200/50 dark:border-gray-600/30 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 hover:border-gray-300/50 dark:hover:border-gray-500/50',
    lightReportButton:
      'bg-amber-50/80 dark:bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-500/30 hover:bg-amber-100/80 dark:hover:bg-amber-600/30 hover:border-amber-300/50 dark:hover:border-amber-400/50',
    glowColor: 'shadow-yellow-200/40 dark:shadow-yellow-500/25',
  },
  green: {
    lightBg: 'bg-white/90 dark:bg-gray-900/60',
    lightBorder: 'border-green-200/50 dark:border-green-500/20',
    lightIconBg:
      'bg-gradient-to-br from-green-100/80 to-green-200/60 dark:from-green-500/20 dark:to-green-600/30',
    lightIconColor: 'text-green-600 dark:text-green-400',
    lightTextPrimary: 'text-gray-900 dark:text-white',
    lightTextSecondary: 'text-gray-600 dark:text-gray-300',
    lightSectionBadge:
      'bg-green-50/80 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200/30 dark:border-green-500/20',
    buttonGradient:
      'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    lightBackButton:
      'bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200/50 dark:border-gray-600/30 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 hover:border-gray-300/50 dark:hover:border-gray-500/50',
    lightReportButton:
      'bg-amber-50/80 dark:bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-500/30 hover:bg-amber-100/80 dark:hover:bg-amber-600/30 hover:border-amber-300/50 dark:hover:border-amber-400/50',
    glowColor: 'shadow-green-200/40 dark:shadow-green-500/25',
  },
  blue: {
    lightBg: 'bg-white/90 dark:bg-gray-900/60',
    lightBorder: 'border-blue-200/50 dark:border-blue-500/20',
    lightIconBg:
      'bg-gradient-to-br from-blue-100/80 to-blue-200/60 dark:from-blue-500/20 dark:to-blue-600/30',
    lightIconColor: 'text-blue-600 dark:text-blue-400',
    lightTextPrimary: 'text-gray-900 dark:text-white',
    lightTextSecondary: 'text-gray-600 dark:text-gray-300',
    lightSectionBadge:
      'bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200/30 dark:border-blue-500/20',
    buttonGradient:
      'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    lightBackButton:
      'bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200/50 dark:border-gray-600/30 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 hover:border-gray-300/50 dark:hover:border-gray-500/50',
    lightReportButton:
      'bg-amber-50/80 dark:bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-500/30 hover:bg-amber-100/80 dark:hover:bg-amber-600/30 hover:border-amber-300/50 dark:hover:border-amber-400/50',
    glowColor: 'shadow-blue-200/40 dark:shadow-blue-500/25',
  },
  purple: {
    lightBg: 'bg-white/90 dark:bg-gray-900/60',
    lightBorder: 'border-purple-200/50 dark:border-purple-500/20',
    lightIconBg:
      'bg-gradient-to-br from-purple-100/80 to-purple-200/60 dark:from-purple-500/20 dark:to-purple-600/30',
    lightIconColor: 'text-purple-600 dark:text-purple-400',
    lightTextPrimary: 'text-gray-900 dark:text-white',
    lightTextSecondary: 'text-gray-600 dark:text-gray-300',
    lightSectionBadge:
      'bg-purple-50/80 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200/30 dark:border-purple-500/20',
    buttonGradient:
      'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    lightBackButton:
      'bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200/50 dark:border-gray-600/30 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 hover:border-gray-300/50 dark:hover:border-gray-500/50',
    lightReportButton:
      'bg-amber-50/80 dark:bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-500/30 hover:bg-amber-100/80 dark:hover:bg-amber-600/30 hover:border-amber-300/50 dark:hover:border-amber-400/50',
    glowColor: 'shadow-purple-200/40 dark:shadow-purple-500/25',
  },
  indigo: {
    lightBg: 'bg-white/90 dark:bg-gray-900/60',
    lightBorder: 'border-indigo-200/50 dark:border-indigo-500/20',
    lightIconBg:
      'bg-gradient-to-br from-indigo-100/80 to-indigo-200/60 dark:from-indigo-500/20 dark:to-indigo-600/30',
    lightIconColor: 'text-indigo-600 dark:text-indigo-400',
    lightTextPrimary: 'text-gray-900 dark:text-white',
    lightTextSecondary: 'text-gray-600 dark:text-gray-300',
    lightSectionBadge:
      'bg-indigo-50/80 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200/30 dark:border-indigo-500/20',
    buttonGradient:
      'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
    lightBackButton:
      'bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200/50 dark:border-gray-600/30 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 hover:border-gray-300/50 dark:hover:border-gray-500/50',
    lightReportButton:
      'bg-amber-50/80 dark:bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-500/30 hover:bg-amber-100/80 dark:hover:bg-amber-600/30 hover:border-amber-300/50 dark:hover:border-amber-400/50',
    glowColor: 'shadow-indigo-200/40 dark:shadow-indigo-500/25',
  },
  cyan: {
    lightBg: 'bg-white/90 dark:bg-gray-900/60',
    lightBorder: 'border-cyan-200/50 dark:border-cyan-500/20',
    lightIconBg:
      'bg-gradient-to-br from-cyan-100/80 to-cyan-200/60 dark:from-cyan-500/20 dark:to-cyan-600/30',
    lightIconColor: 'text-cyan-600 dark:text-cyan-400',
    lightTextPrimary: 'text-gray-900 dark:text-white',
    lightTextSecondary: 'text-gray-600 dark:text-gray-300',
    lightSectionBadge:
      'bg-cyan-50/80 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200/30 dark:border-cyan-500/20',
    buttonGradient:
      'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700',
    lightBackButton:
      'bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200/50 dark:border-gray-600/30 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 hover:border-gray-300/50 dark:hover:border-gray-500/50',
    lightReportButton:
      'bg-amber-50/80 dark:bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-500/30 hover:bg-amber-100/80 dark:hover:bg-amber-600/30 hover:border-amber-300/50 dark:hover:border-amber-400/50',
    glowColor: 'shadow-cyan-200/40 dark:shadow-cyan-500/25',
  },
  emerald: {
    lightBg: 'bg-white/90 dark:bg-gray-900/60',
    lightBorder: 'border-emerald-200/50 dark:border-emerald-500/20',
    lightIconBg:
      'bg-gradient-to-br from-emerald-100/80 to-emerald-200/60 dark:from-emerald-500/20 dark:to-emerald-600/30',
    lightIconColor: 'text-emerald-600 dark:text-emerald-400',
    lightTextPrimary: 'text-gray-900 dark:text-white',
    lightTextSecondary: 'text-gray-600 dark:text-gray-300',
    lightSectionBadge:
      'bg-emerald-50/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200/30 dark:border-emerald-500/20',
    buttonGradient:
      'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
    lightBackButton:
      'bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200/50 dark:border-gray-600/30 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 hover:border-gray-300/50 dark:hover:border-gray-500/50',
    lightReportButton:
      'bg-amber-50/80 dark:bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-500/30 hover:bg-amber-100/80 dark:hover:bg-amber-600/30 hover:border-amber-300/50 dark:hover:border-amber-400/50',
    glowColor: 'shadow-emerald-200/40 dark:shadow-emerald-500/25',
  },
};

export default function ErrorPage({
  error,
  reset,
  title = 'Something went wrong!',
  description = 'An unexpected error occurred. Please try again.',
  sectionName,
  theme = 'red',
  backLink,
  resetLabel = 'Try again',
}: ErrorPageProps) {
  const themeStyles = themeConfig[theme];

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-gray-50 p-8 dark:bg-gray-900">
      {/* Main content card */}
      <div
        className={`relative w-full max-w-md ${themeStyles.lightBg} border backdrop-blur-xl ${themeStyles.lightBorder} rounded-2xl shadow-2xl ${themeStyles.glowColor} p-8`}
      >
        {/* Sparkle decorations */}
        <div className="absolute top-4 right-4">
          <Sparkles className="h-5 w-5 animate-pulse text-gray-400 dark:text-gray-500" />
        </div>

        <div className="space-y-8 text-center">
          {/* Icon section with enhanced styling */}
          <div className="relative">
            <div
              className={`mx-auto h-20 w-20 ${themeStyles.lightIconBg} flex items-center justify-center rounded-2xl border shadow-lg backdrop-blur-sm ${themeStyles.lightBorder} transform transition-transform duration-300 hover:scale-105`}
            >
              <AlertTriangle
                className={`h-10 w-10 ${themeStyles.lightIconColor} animate-bounce`}
              />
            </div>
            {/* Glow effect */}
            <div
              className={`absolute inset-0 mx-auto h-20 w-20 ${themeStyles.lightIconBg} -z-10 rounded-2xl opacity-30 blur-xl dark:opacity-50`}
            ></div>
          </div>

          {/* Text content with improved typography */}
          <div className="space-y-4">
            <h2
              className={`text-3xl font-bold ${themeStyles.lightTextPrimary} leading-tight`}
            >
              {title}
            </h2>
            <p
              className={`${themeStyles.lightTextSecondary} mx-auto max-w-sm leading-relaxed`}
            >
              {description}
            </p>
            {sectionName && (
              <div
                className={`inline-flex items-center rounded-full px-3 py-1 ${themeStyles.lightSectionBadge} border text-sm font-medium`}
              >
                {sectionName} Section
              </div>
            )}
          </div>

          {/* Enhanced buttons */}
          <div className="space-y-3">
            <button
              onClick={() => reset()}
              className={`group flex w-full items-center justify-center gap-3 px-6 py-4 ${themeStyles.buttonGradient} rounded-xl border border-white/10 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:border-white/10`}
            >
              <RefreshCw className="h-5 w-5 transition-transform duration-500 group-hover:rotate-180" />
              {resetLabel}
            </button>

            {backLink && (
              <Link
                href={backLink.href}
                className={`group flex w-full items-center justify-center gap-3 px-6 py-4 ${themeStyles.lightBackButton} rounded-xl border font-medium backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg`}
              >
                <backLink.icon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                {backLink.label}
              </Link>
            )}

            {/* Report Error Button */}
            <a
              href="/report"
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex w-full items-center justify-center gap-3 px-6 py-4 ${themeStyles.lightReportButton} rounded-xl border font-medium backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg`}
            >
              <FileText className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              Report Error
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
