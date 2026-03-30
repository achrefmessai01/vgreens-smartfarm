interface LoadingStateProps {
  message: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className="flex h-full min-h-[300px] items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="border-primary/30 border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
        <span className="text-muted-foreground dark:text-muted-foreground/80 text-sm font-medium">
          {message}
        </span>
      </div>
    </div>
  );
}
