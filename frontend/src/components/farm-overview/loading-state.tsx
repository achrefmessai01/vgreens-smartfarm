interface LoadingStateProps {
  message: string
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className="h-full min-h-[300px] flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground/80">
          {message}
        </span>
      </div>
    </div>
  )
}
