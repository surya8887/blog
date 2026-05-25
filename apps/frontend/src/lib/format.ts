import { WORDS_PER_MINUTE } from "@/constants/app"

type DateInput = string | number | Date | null | undefined

export function formatDate(
  date: DateInput,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
): string {
  if (!date) return ""
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", options)
}

export function formatLongDate(date: DateInput): string {
  return formatDate(date, { month: "long", day: "numeric", year: "numeric" })
}

export function getReadTime(content: string | undefined | null): number {
  const plainText = (content ?? "").replace(/<[^>]+>/g, "")
  const words = plainText.trim().split(/\s+/).filter(Boolean).length
  if (words === 0) return 1
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

export function getInitial(value: string | undefined | null, fallback = "?"): string {
  return value?.trim()?.[0]?.toUpperCase() ?? fallback
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
