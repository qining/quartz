import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    // Old code for Giscus, now changed to Waline and no show comment on list pages.
    // Component.Comments({
    //   provider: 'giscus',
    //   options: {
    //     // from data-repo
    //     repo: 'qining/quartz',
    //     // from data-repo-id
    //     repoId: 'R_kgDOOxL_Zg',
    //     // from data-category
    //     category: 'Announcements',
    //     // from data-category-id
    //     categoryId: 'DIC_kwDOOxL_Zs4CrAvV',
    //   }
    // }),
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/jackyzha0/quartz",
      "Discord Community": "https://discord.gg/cRFFHYye7t",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer({
      mapFn: (node) => {
        // Capitalize the first letter of the node's display name
        node.displayName = node.displayName.at(0)?.toUpperCase() + node.displayName.slice(1)
        return node
      },
    }),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    // Uncomment this line to put recent posts on the right on desktop.
    // Component.DesktopOnly(Component.RecentNotes({ limit: 5 })),
    Component.Backlinks(),
  ],
  afterBody: [
    Component.Waline(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer({
      mapFn: (node) => {
        // Capitalize the first letter of the node's display name
        node.displayName = node.displayName.at(0)?.toUpperCase() + node.displayName.slice(1)
        return node
      },
    }),
  ],
  right: [
    Component.Graph(),
  ],
}

// components for the index/home page - shows index.md content plus tag list, recent posts and notes
export const indexPageLayout: PageLayout = {
  beforeBody: [
    Component.ArticleTitle(),
    Component.ContentMeta(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer({
      mapFn: (node) => {
        // Capitalize the first letter of the node's display name
        node.displayName = node.displayName.at(0)?.toUpperCase() + node.displayName.slice(1)
        return node
      },
    }),
  ],
  right: [
    Component.Graph({
      localGraph: {
        depth: -1, // Show full graph by default on index page
        enableDrag: true,
        enableZoom: true,
        showTags: true,
      },
      globalGraph: {
        depth: -1,
        enableDrag: true,
        enableZoom: true,
        showTags: true,
      },
    }),
    Component.DesktopOnly(Component.TableOfContents()),
  ],
  afterBody: [
    Component.Waline(),
  ],
}
