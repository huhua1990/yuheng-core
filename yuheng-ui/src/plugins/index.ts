import type { App } from 'vue'
import ElementPlus from 'element-plus'
import { setupYuhengComponents } from '../components'

export function setupYuhengPlugins(app: App): void {
  app.use(ElementPlus)
  app.directive('focus', {
    mounted: (element: HTMLElement) => element.focus()
  })
  setupYuhengComponents(app)
}
