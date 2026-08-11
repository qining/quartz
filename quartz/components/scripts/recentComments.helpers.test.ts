import test, { describe } from "node:test"
import assert from "node:assert"
import { truncate, urlToSlug, resolveTitle, formatRelativeTime } from "./recentComments.helpers"

describe("truncate", () => {
  test("returns text unchanged when within limit", () => {
    assert.strictEqual(truncate("hello", 10), "hello")
  })
  test("truncates and appends an ellipsis when over limit", () => {
    assert.strictEqual(truncate("hello world", 5), "hello…")
  })
  test("trims trailing whitespace before the ellipsis", () => {
    assert.strictEqual(truncate("hello     world", 6), "hello…")
  })
  test("handles the empty string", () => {
    assert.strictEqual(truncate("", 5), "")
  })
  test("does not split surrogate pairs (emoji)", () => {
    assert.strictEqual(truncate("abcd😀efgh", 5), "abcd😀…")
  })
})

describe("urlToSlug", () => {
  test("strips a leading slash", () => {
    assert.strictEqual(urlToSlug("/notes/foo"), "notes/foo")
  })
  test("strips a trailing slash", () => {
    assert.strictEqual(urlToSlug("/notes/foo/"), "notes/foo")
  })
  test("maps root to index", () => {
    assert.strictEqual(urlToSlug("/"), "index")
  })
  test("handles deeply nested paths", () => {
    assert.strictEqual(
      urlToSlug("/notes/2025/2025-08/script-to-get-ip"),
      "notes/2025/2025-08/script-to-get-ip",
    )
  })
})

describe("resolveTitle", () => {
  const index = {
    "notes/foo": { title: "Foo Note" },
    index: { title: "Home" },
  } as any
  test("resolves a known slug to its title", () => {
    assert.strictEqual(resolveTitle("/notes/foo", index), "Foo Note")
  })
  test("resolves root to the index title", () => {
    assert.strictEqual(resolveTitle("/", index), "Home")
  })
  test("falls back to the raw url when the slug is unknown", () => {
    assert.strictEqual(resolveTitle("/unknown/path", index), "/unknown/path")
  })
})

describe("formatRelativeTime", () => {
  const now = 1_700_000_000_000
  test("formats seconds ago", () => {
    assert.strictEqual(formatRelativeTime(now - 5_000, now, "en-US"), "5 seconds ago")
  })
  test("formats minutes ago", () => {
    assert.strictEqual(formatRelativeTime(now - 5 * 60_000, now, "en-US"), "5 minutes ago")
  })
  test("formats hours ago", () => {
    assert.strictEqual(formatRelativeTime(now - 2 * 3_600_000, now, "en-US"), "2 hours ago")
  })
  test("formats days ago", () => {
    assert.strictEqual(formatRelativeTime(now - 3 * 86_400_000, now, "en-US"), "3 days ago")
  })
  test("uses seconds just under a minute", () => {
    assert.strictEqual(formatRelativeTime(now - 59_000, now, "en-US"), "59 seconds ago")
  })
  test("formats weeks ago", () => {
    assert.strictEqual(formatRelativeTime(now - 2 * 604_800_000, now, "en-US"), "2 weeks ago")
  })
  test("formats months ago", () => {
    assert.strictEqual(formatRelativeTime(now - 3 * 2_629_800_000, now, "en-US"), "3 months ago")
  })
  test("formats years ago", () => {
    assert.strictEqual(formatRelativeTime(now - 2 * 31_557_600_000, now, "en-US"), "2 years ago")
  })
})
