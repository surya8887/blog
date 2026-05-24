import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonCard({ variant = "default" }: { variant?: "default" | "featured" | "compact" }) {
  if (variant === "featured") {
    return (
      <div className="rounded-3xl border border-border/40 overflow-hidden bg-card">
        <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[380px]">
          <Skeleton className="lg:col-span-3 h-56 lg:h-full rounded-none" />
          <div className="lg:col-span-2 p-8 lg:p-10 flex flex-col justify-center gap-4">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <div className="mt-4 pt-4 border-t border-border/40 flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div className="flex gap-4 p-4 rounded-2xl">
        <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-20 mt-1" />
        </div>
      </div>
    )
  }

  // Default grid card skeleton
  return (
    <div className="flex flex-col rounded-2xl border border-border/40 overflow-hidden bg-card">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="pt-3 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-7 h-7 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonArticle() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="h-[60vh] min-h-[500px] bg-muted relative overflow-hidden">
        <div className="skeleton-shimmer absolute inset-0" />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container max-w-4xl mx-auto px-4 pb-16 space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24 rounded-full bg-white/20" />
              <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
            </div>
            <Skeleton className="h-10 w-3/4 bg-white/20" />
            <Skeleton className="h-10 w-1/2 bg-white/20" />
            <Skeleton className="h-5 w-2/3 bg-white/15 mt-2" />
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/10">
              <Skeleton className="w-14 h-14 rounded-full bg-white/20" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-white/20" />
                <Skeleton className="h-3 w-24 bg-white/15" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Content skeleton */}
      <div className="container max-w-3xl mx-auto px-4 mt-16 space-y-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className={`h-4 ${i % 3 === 2 ? "w-4/5" : "w-full"}`} />
        ))}
        <div className="mt-8 space-y-4">
          <Skeleton className="h-6 w-1/2" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className={`h-4 ${i % 3 === 2 ? "w-3/4" : "w-full"}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
