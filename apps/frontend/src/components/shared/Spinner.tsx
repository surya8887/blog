import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string
  fullScreen?: boolean
}

export function Spinner({ className, fullScreen = false }: SpinnerProps) {
  const spinner = (
    <div
      className={cn(
        "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent",
        className
      )}
      role="status"
      aria-label="Loading"
    />
  )

  if (fullScreen) {
    return <div className="flex h-screen w-full items-center justify-center">{spinner}</div>
  }
  return spinner
}
