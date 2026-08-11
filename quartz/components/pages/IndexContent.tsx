import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { htmlToJsx } from "../../util/jsx"
import { PageList, byDateAndAlphabetical } from "../PageList"
import TagCloudConstructor from "../TagCloud"
import { concatenateResources } from "../../util/resources"
import listPageStyle from "../styles/listPage.scss"
import tagListStyle from "../styles/tagList.scss"

// This component shows the index.md content plus tag list, recent posts and notes sections
const IndexContent: QuartzComponent = (props: QuartzComponentProps) => {
  const { fileData, tree, allFiles, cfg } = props
  const content = htmlToJsx(fileData.filePath!, tree)

  // Tag list showing frequently used tags
  const TagCloudComponent = TagCloudConstructor({
    title: "Popular Tags",
    limit: 30,
    showCount: true,
  })

  // Get recent posts (from posts/ folder)
  const recentPosts = allFiles.filter((f) => f.slug?.startsWith("posts/") ?? false)

  // Get recent notes (from notes/ folder)
  const recentNotes = allFiles.filter((f) => f.slug?.startsWith("notes/") ?? false)

  return (
    <article class="popover-hint index-page">
      {content}
      <TagCloudComponent {...props} />

      {/* Recent Posts Section */}
      <div class="page-listing">
        <h2>Recent Posts</h2>
        <PageList {...props} allFiles={recentPosts} limit={10} sort={byDateAndAlphabetical(cfg)} />
      </div>

      {/* Recent Notes Section */}
      <div class="page-listing">
        <h2>Recent Notes</h2>
        <PageList {...props} allFiles={recentNotes} limit={10} sort={byDateAndAlphabetical(cfg)} />
      </div>
    </article>
  )
}

IndexContent.css = concatenateResources(
  listPageStyle,
  PageList.css,
  tagListStyle,
  `
  .index-page {
    .tag-cloud {
      margin: 3rem 0;
    }

    .page-listing {
      margin: 3rem 0;
    }
  }
`,
)

export default (() => IndexContent) satisfies QuartzComponentConstructor
