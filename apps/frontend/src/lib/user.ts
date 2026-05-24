import type { User } from "@/types"

export function getDisplayName(user: User | null | undefined, fallback = "User"): string {
  if (!user) return fallback
  const first = user.profile?.firstName?.trim()
  const last = user.profile?.lastName?.trim()
  if (first) return `${first} ${last ?? ""}`.trim()
  if (user.email) return user.email.split("@")[0] ?? fallback
  return fallback
}
