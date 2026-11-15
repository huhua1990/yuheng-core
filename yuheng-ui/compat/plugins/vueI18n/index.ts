import type { App } from 'vue'
import { createI18n } from 'vue-i18n'
import { useLocaleStoreWithOut } from '../../store/modules/locale.ts'
import type { I18n, I18nOptions } from 'vue-i18n'
import { setHtmlPageLang } from './helper.ts'
import zhCN from '../../locales/zh-CN.ts'
import en from '../../locales/en.ts'

export let i18n: ReturnType<typeof createI18n>

const createI18nOptions = async (): Promise<I18nOptions> => {
  const localeStore = useLocaleStoreWithOut()
  const locale = localeStore.getCurrentLocale
  const localeMap = localeStore.getLocaleMap
  const messages = { 'zh-CN': zhCN, en }

  setHtmlPageLang(locale.lang)

  localeStore.setCurrentLocale({
    lang: locale.lang
    // elLocale: elLocal
  })

  return {
    legacy: false,
    locale: locale.lang,
    fallbackLocale: locale.lang === 'en' ? 'en' : 'zh-CN',
    messages,
    availableLocales: localeMap.map((v) => v.lang),
    sync: true,
    silentTranslationWarn: true,
    missingWarn: false,
    silentFallbackWarn: true
  }
}

export const setupI18n = async (app: App<Element>) => {
  const options = await createI18nOptions()
  const existing = (app as App<Element> & { __VUE_I18N__?: I18n }).__VUE_I18N__
  if (existing) {
    i18n = existing as ReturnType<typeof createI18n>
    for (const [locale, messages] of Object.entries(options.messages ?? {})) {
      i18n.global.mergeLocaleMessage(locale, messages)
    }
    i18n.global.locale.value = String(options.locale)
    i18n.global.fallbackLocale.value = String(options.fallbackLocale)
    return
  }
  i18n = createI18n(options) as I18n
  app.use(i18n, { globalInstall: false })
}
