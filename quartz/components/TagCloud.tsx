import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import style from "./styles/tagList.scss"

interface Options {
  title?: string
  limit?: number
  showCount?: boolean
}

const defaultOptions: Options = {
  title: "Tags",
  limit: 30,
  showCount: true,
}

export default ((userOpts?: Partial<Options>) => {
  const TagCloud: QuartzComponent = ({ fileData, allFiles, displayClass }: QuartzComponentProps) => {
    const opts = { ...defaultOptions, ...userOpts }

    // Count tag frequencies
    const tagCounts = new Map<string, number>()
    for (const file of allFiles) {
      const tags = file.frontmatter?.tags ?? []
      for (const tag of tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      }
    }

    // Sort by frequency (descending) and then alphabetically
    const sortedTags = Array.from(tagCounts.entries())
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1] // by count descending
        return a[0].localeCompare(b[0]) // then alphabetically
      })
      .slice(0, opts.limit)

    if (sortedTags.length === 0) {
      return null
    }

    return (
      <div class={`tag-cloud ${displayClass ?? ""}`}>
        <h2>{opts.title}</h2>
        <div class="tag-list-container">
          {sortedTags.map(([tag, count]) => {
            return (
              <a
                class="tag-list-item"
                href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
              >
                <span class="tag-name">{tag}</span>
                {opts.showCount && <span class="tag-count">({count})</span>}
              </a>
            )
          })}
        </div>
      </div>
    )
  }

  TagCloud.css = style
  return TagCloud
}) satisfies QuartzComponentConstructor
