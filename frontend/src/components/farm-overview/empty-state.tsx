import * as React from 'react'

export interface EmptyStateProps {
  message: string
  icon?: React.ReactNode
}

function DefaultIcon() {
  return (
    <svg
      className="w-16 h-16 mx-auto"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  )
}

function GreenhouseIcon() {
  return (
    <svg
      className="w-16 h-16 mx-auto"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  )
}

/**
 * Centered empty state with card and subtle animations.
 * Pass a translated `message` from the parent (e.g. i18n).
 */
export function EmptyState({ message, icon }: EmptyStateProps) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  return (
    <div
      className="h-full w-full flex items-center justify-center p-6"
      role="status"
      aria-label={message}
    >
      <div
        className={`
          text-center max-w-sm rounded-2xl border border-border/60 bg-card/80 dark:bg-card/90
          shadow-lg shadow-black/5 dark:shadow-black/20
          px-10 py-12
          transition-all duration-500 ease-out
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        <div
          className="mb-5 text-muted-foreground/70 dark:text-muted-foreground/60 animate-pulse"
          style={{ animationDuration: '3s' }}
        >
          {icon ?? <DefaultIcon />}
        </div>
        <p className="text-base font-medium text-muted-foreground dark:text-muted-foreground/90 tracking-tight">
          {message}
        </p>
        <div
          className="mx-auto mt-6 h-1 w-16 rounded-full bg-primary/20 dark:bg-primary/30 animate-pulse"
          style={{ animationDuration: '2s' }}
          aria-hidden
        />
      </div>
    </div>
  )
}

EmptyState.GreenhouseIcon = GreenhouseIcon
EmptyState.DefaultIcon = DefaultIcon
