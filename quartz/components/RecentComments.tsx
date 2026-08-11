import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import script from "./scripts/recentComments.inline"
import style from "./styles/recentComments.scss"
import { classNames } from "../util/lang"

interface Options {
  title: string
  limit: number
  serverUrl: string
}

const defaultOptions: Options = {
  title: "Recent Comments",
  limit: 5,
  serverUrl: "/waline",
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const RecentComments: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    return (
      <div class={classNames(displayClass, "recent-comments")}>
        <h3>{opts.title}</h3>
        <ul
          class="recent-comments-list"
          data-limit={opts.limit}
          data-server-url={opts.serverUrl}
          data-locale={cfg.locale}
        ></ul>
      </div>
    )
  }

  RecentComments.css = style
  RecentComments.afterDOMLoaded = script
  return RecentComments
}) satisfies QuartzComponentConstructor
