import type { PostStatus } from "@/types"

export const POST_STATUS_COLORS: Record<PostStatus, string> = {
  published:
    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  draft:
    "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  archived: "bg-muted text-muted-foreground border-border/50",
}

export const POST_STATUSES = ["draft", "published", "archived"] as const

export const DEFAULT_POST_STATUS: PostStatus = "draft"
