import type { App } from 'vue'
import ElementPlus from 'element-plus'
import { createI18n } from 'vue-i18n'
import { platformLocales, type PlatformLocale } from '../locales'
import { setupYuhengComponents } from '../components'

export interface YuhengPluginOptions {
  locale?: PlatformLocale
  icons?: Record<string, unknown>
}

export const YUHENG_ICON_REGISTRY = Symbol('yuheng-ui-icons')

export function setupYuhengPlugins(app: App, options: YuhengPluginOptions = {}): void {
  const locale = options.locale ?? 'zh-CN'
  app.use(ElementPlus)
  app.use(
    createI18n({
      legacy: false,
      locale,
      fallbackLocale: 'en-US',
      messages: platformLocales
    })
  )
  app.provide(YUHENG_ICON_REGISTRY, options.icons ?? {})
  app.directive('focus', {
    mounted: (element: HTMLElement) => element.focus()
  })
  setupYuhengComponents(app)
}
