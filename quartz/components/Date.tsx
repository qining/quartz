import { GlobalConfiguration } from "../cfg"
import { ValidLocale } from "../i18n"
import { QuartzPluginData } from "../plugins/vfile"

interface Props {
  date: Date
  locale?: ValidLocale
}

export type ValidDateType = keyof Required<QuartzPluginData>["dates"]

export function getDate(cfg: GlobalConfiguration, data: QuartzPluginData): Date | undefined {
  if (!cfg.defaultDateType) {
    throw new Error(
      `Field 'defaultDateType' was not set in the configuration object of quartz.config.ts. See https://quartz.jzhao.xyz/configuration#general-configuration for more details.`,
    )
  }
  return data.dates?.[cfg.defaultDateType]
}

// From https://quartz.eilleeenz.com/Quartz-customization-log#putting-date-created--modified-on-content-pages-but-not-index
export function _getDateCustom(cfg: GlobalConfiguration, data: QuartzPluginData, dateType: 'modified' | 'created'): Date | undefined {
  // Check if the dateType provided is valid
  if (dateType !== 'modified' && dateType !== 'created') {
    throw new Error(`Invalid date type '${dateType}'. Valid options are 'modified' or 'created'.`)
  }
  
  // Return the respective date based on the given dateType
  return data.dates?.[dateType]
}

export function formatDate(d: Date, locale: ValidLocale = "en-US"): string {
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  })
}

export function Date({ date, locale }: Props) {
  return <time datetime={date.toISOString()}>{formatDate(date, locale)}</time>
}
