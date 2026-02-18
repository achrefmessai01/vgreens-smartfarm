import * as React from "react";

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
}

function DefaultIcon() {
  return (
    <svg
      className="w-16 h-16 mx-auto"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  );
}

function GreenhouseIcon() {
  return (
    <svg
      className="w-16 h-16 mx-auto"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  );
}

export function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div className="h-full min-h-[300px] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mb-3 text-muted-foreground/60 dark:text-muted-foreground/50">
          {icon || <DefaultIcon />}
        </div>
        <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground/80">
          {message}
        </p>
      </div>
    </div>
  );
}

EmptyState.GreenhouseIcon = GreenhouseIcon;
EmptyState.DefaultIcon = DefaultIcon;
