import type { ContentDetails } from "../../plugins/emitters/contentIndex"
import type { WalineComment } from "./recentComments.helpers"
import { truncate, formatRelativeTime, resolveTitle } from "./recentComments.helpers"

// Module scope survives SPA navigations because afterDOMLoaded scripts run once.
let cache: WalineComment[] | null = null
let indexCache: Record<string, ContentDetails> | null = null
let lastFetch = 0
const THROTTLE_MS = 30_000
const EXCERPT_MAX = 80

// Decode HTML entities and strip tags, then collapse whitespace. Parse inertly
// via DOMParser so a comment's embedded <img>/resources are NOT fetched (which
// would be a site-wide third-party load on every visitor) and no handlers run.
function htmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html")
  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim()
}

// Comment URLs are third-party data (a commenter can set any `url` via the API),
// so only allow same-origin paths as link targets. This rejects javascript:,
// data:, and cross-origin URLs that could otherwise turn the site-wide panel
// into a stored-XSS or open-redirect vector.
function safeHref(url: string): string {
  try {
    const u = new URL(url, window.location.origin)
    return u.origin === window.location.origin ? u.pathname + u.hash : "#"
  } catch {
    return "#"
  }
}

// Avatars are third-party URLs; only allow http(s) images.
function safeImgSrc(url: string): string {
  try {
    const u = new URL(url, window.location.origin)
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : ""
  } catch {
    return ""
  }
}

function renderInto(
  list: HTMLElement,
  comments: WalineComment[],
  locale: string,
  index: Record<string, ContentDetails>,
) {
  const now = Date.now()
  list.replaceChildren()

  if (comments.length === 0) {
    const empty = document.createElement("li")
    empty.className = "recent-comments-empty"
    empty.textContent = "No comments yet"
    list.appendChild(empty)
    return
  }

  for (const c of comments) {
    // Skip a malformed record rather than letting one bad entry throw and wedge
    // the whole panel for the rest of the SPA session.
    try {
      const li = document.createElement("li")
      li.className = "recent-comments-item"

      const a = document.createElement("a")
      a.className = "internal"
      a.href = safeHref(c.url)

      const header = document.createElement("div")
      header.className = "recent-comments-header"

      const avatar = document.createElement("img")
      avatar.className = "recent-comments-avatar"
      const avatarSrc = safeImgSrc(c.avatar)
      if (avatarSrc) avatar.src = avatarSrc
      avatar.alt = ""
      avatar.loading = "lazy"

      const nick = document.createElement("span")
      nick.className = "recent-comments-nick"
      nick.textContent = c.nick

      const time = document.createElement("span")
      time.className = "recent-comments-time"
      time.textContent = formatRelativeTime(c.time, now, locale)

      header.append(avatar, nick, time)

      const excerpt = document.createElement("span")
      excerpt.className = "recent-comments-excerpt"
      excerpt.textContent = truncate(htmlToText(c.comment), EXCERPT_MAX)

      const post = document.createElement("span")
      post.className = "recent-comments-post"
      post.textContent = resolveTitle(c.url, index)

      a.append(header, excerpt, post)
      li.appendChild(a)
      list.appendChild(li)
    } catch {
      // ignore this entry
    }
  }
}

async function refresh(list: HTMLElement, limit: number, serverUrl: string, locale: string) {
  if (cache && Date.now() - lastFetch < THROTTLE_MS) return

  const controller = new AbortController()
  window.addCleanup(() => controller.abort())

  try {
    if (!indexCache) {
      indexCache = Object.fromEntries(Object.entries<ContentDetails>(await fetchData))
    }
    const res = await fetch(`${serverUrl}/api/comment?type=recent&count=${limit}`, {
      signal: controller.signal,
    })
    if (!res.ok) {
      // Treat an HTTP error like a network failure: show the empty state if we
      // have nothing cached yet, otherwise keep the last good render.
      if (!cache) renderInto(list, [], locale, indexCache ?? {})
      return
    }
    const json = await res.json()
    cache = (Array.isArray(json?.data) ? json.data : []) as WalineComment[]
    lastFetch = Date.now()
    renderInto(list, cache, locale, indexCache)
  } catch {
    // Offline or proxy unavailable (e.g. local dev): show empty state only if
    // nothing has ever loaded; otherwise keep the last good render.
    if (!cache) renderInto(list, [], locale, indexCache ?? {})
  }
}

document.addEventListener("nav", () => {
  const list = document.querySelector<HTMLElement>(".recent-comments-list")
  if (!list) return

  const limit = parseInt(list.dataset.limit ?? "5", 10)
  const serverUrl = list.dataset.serverUrl ?? "/waline"
  const locale = list.dataset.locale ?? "en-US"

  // Instant, flash-free repaint from cache (micromorph reset the list to empty).
  if (cache && indexCache) renderInto(list, cache, locale, indexCache)
  // Background refresh (throttled).
  refresh(list, limit, serverUrl, locale)
})
