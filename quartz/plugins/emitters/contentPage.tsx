import path from "path"
import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import HeaderConstructor from "../../components/Header"
import BodyConstructor from "../../components/Body"
import { pageResources, renderPage } from "../../components/renderPage"
import { FullPageLayout } from "../../cfg"
import { pathToRoot } from "../../util/path"
import { defaultContentPageLayout, indexPageLayout, sharedPageComponents } from "../../../quartz.layout"
import { Content } from "../../components"
import IndexContent from "../../components/pages/IndexContent"
import { styleText } from "util"
import { write } from "./helpers"
import { BuildCtx } from "../../util/ctx"
import { Node } from "unist"
import { StaticResources } from "../../util/resources"
import { QuartzPluginData } from "../vfile"

async function processContent(
  ctx: BuildCtx,
  tree: Node,
  fileData: QuartzPluginData,
  allFiles: QuartzPluginData[],
  opts: FullPageLayout,
  resources: StaticResources,
) {
  const slug = fileData.slug!
  const cfg = ctx.cfg.configuration
  const externalResources = pageResources(pathToRoot(slug), resources)
  const componentData: QuartzComponentProps = {
    ctx,
    fileData,
    externalResources,
    cfg,
    children: [],
    tree,
    allFiles,
  }

  const content = renderPage(cfg, slug, componentData, opts, externalResources)
  return write({
    ctx,
    content,
    slug,
    ext: ".html",
  })
}

export const ContentPage: QuartzEmitterPlugin<Partial<FullPageLayout>> = (userOpts) => {
  const opts: FullPageLayout = {
    ...sharedPageComponents,
    ...defaultContentPageLayout,
    pageBody: Content(),
    ...userOpts,
  }

  // Create a separate layout for the index page with custom content
  const indexOpts: FullPageLayout = {
    ...sharedPageComponents,
    ...indexPageLayout,
    pageBody: IndexContent(),
    ...userOpts,
  }

  const { head: Head, header, beforeBody, pageBody, afterBody, left, right, footer: Footer } = opts
  const Header = HeaderConstructor()
  const Body = BodyConstructor()

  return {
    name: "ContentPage",
    getQuartzComponents() {
      // Return all components from both regular and index layouts
      return [
        Head,
        Header,
        Body,
        ...header,
        ...beforeBody,
        pageBody,
        indexOpts.pageBody, // Include IndexContent (which includes Graph and TagCloud)
        ...afterBody,
        ...left,
        ...right,
        Footer,
        // Include components unique to index layout
        ...indexOpts.beforeBody,
        ...indexOpts.left,
        ...indexOpts.right,
      ]
    },
    async *emit(ctx, content, resources) {
      const allFiles = content.map((c) => c[1].data)
      let containsIndex = false

      for (const [tree, file] of content) {
        const slug = file.data.slug!
        if (slug === "index") {
          containsIndex = true
        }

        // only process home page, non-tag pages, and non-index pages
        if (slug.endsWith("/index") || slug.startsWith("tags/")) continue

        // Use indexOpts for the index page, opts for everything else
        const layoutOpts = slug === "index" ? indexOpts : opts
        yield processContent(ctx, tree, file.data, allFiles, layoutOpts, resources)
      }

      if (!containsIndex) {
        console.log(
          styleText(
            "yellow",
            `\nWarning: you seem to be missing an \`index.md\` home page file at the root of your \`${ctx.argv.directory}\` folder (\`${path.join(ctx.argv.directory, "index.md")} does not exist\`). This may cause errors when deploying.`,
          ),
        )
      }
    },
    async *partialEmit(ctx, content, resources, changeEvents) {
      const allFiles = content.map((c) => c[1].data)

      // find all slugs that changed or were added
      const changedSlugs = new Set<string>()
      for (const changeEvent of changeEvents) {
        if (!changeEvent.file) continue
        if (changeEvent.type === "add" || changeEvent.type === "change") {
          changedSlugs.add(changeEvent.file.data.slug!)
        }
      }

      for (const [tree, file] of content) {
        const slug = file.data.slug!
        if (!changedSlugs.has(slug)) continue
        if (slug.endsWith("/index") || slug.startsWith("tags/")) continue

        // Use indexOpts for the index page, opts for everything else
        const layoutOpts = slug === "index" ? indexOpts : opts
        yield processContent(ctx, tree, file.data, allFiles, layoutOpts, resources)
      }
    },
  }
}
