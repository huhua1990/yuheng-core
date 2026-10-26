import enUS from './en-US'
import zhCN from './zh-CN'

export const platformLocales = { 'zh-CN': zhCN, 'en-US': enUS } as const
export type PlatformLocale = keyof typeof platformLocales
export { enUS, zhCN }
