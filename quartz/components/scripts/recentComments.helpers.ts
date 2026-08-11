import type { ContentDetails } from "../../plugins/emitters/contentIndex"

// Shape of a single comment returned by Waline's `?type=recent` endpoint.
// Verified against the live API response.
export interface WalineComment {
  nick: string
  avatar: string
  url: string
  comment: string // rendered HTML
  orig: string // raw markdown/plaintext
  time: number // Unix epoch milliseconds
  objectId: number
  status: string
}

// Truncate to at most `max` characters, appending an ellipsis when cut.
export function truncate(text: string, max: number): string {
  const chars = Array.from(text)
  if (chars.length <= max) return text
  return chars.slice(0, max).join("").trimEnd() + "…"
}

// Normalize a stored comment pathname into a contentIndex slug key.
export function urlToSlug(url: string): string {
  const trimmed = url.replace(/^\/+/, "").replace(/\/+$/, "")
  return trimmed === "" ? "index" : trimmed
}

// Resolve a comment's page pathname to a human title, falling back to the path.
export function resolveTitle(url: string, contentIndex: Record<string, ContentDetails>): string {
  const slug = urlToSlug(url)
  return contentIndex[slug]?.title ?? url
}

// Format a past timestamp as localized relative time, e.g. "3 days ago".
export function formatRelativeTime(fromMs: number, nowMs: number, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
  const diffSec = (fromMs - nowMs) / 1000
  const absSec = Math.abs(diffSec)
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_557_600],
    ["month", 2_629_800],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
    ["second", 1],
  ]
  for (const [unit, secondsInUnit] of units) {
    if (absSec >= secondsInUnit || unit === "second") {
      return rtf.format(Math.round(diffSec / secondsInUnit), unit)
    }
  }
  return rtf.format(0, "second")
}
