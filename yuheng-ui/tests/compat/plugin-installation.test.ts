// @vitest-environment happy-dom
import { createApp, defineComponent, computed, h, reactive, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { installYuhengUi } from '../../src/runtime/install'
import { setupI18n, i18n } from '../../compat/plugins/vueI18n'
import { bindPlatformRuntime } from '../../compat/runtime'
vi.mock('element-plus', async () => {
  const { createRequire } = await import('node:module')
  return createRequire(import.meta.url)('element-plus')
})
vi.mock('@form-create/element-ui/auto-import', () => ({ default: () => undefined }))
vi.mock('@form-create/element-ui', () => ({ default: {
  install: (app: ReturnType<typeof createApp>) => {
    app.component('form-create', defineComponent({ render: () => null }))
    app.config.globalProperties.$formCreate = () => undefined
  },
  use: () => undefined
} }))
vi.mock('@form-create/designer', () => ({ default: { install: (app: ReturnType<typeof createApp>) => {
  app.component('FcDesigner', defineComponent({ render: () => null }))
} } }))
Object.assign(globalThis, { computed, defineComponent, h, reactive, ref })

const apps: ReturnType<typeof createApp>[] = []

const createInstalledApp = () => {
  const app = createApp(defineComponent({ render: () => null }))
  const warnings: string[] = []
  app.config.warnHandler = (message) => warnings.push(message)
  const runtime = installYuhengUi(app, { apiBaseUrl: '/admin-api' })
  const router = createRouter({ history: createMemoryHistory(), routes: [] })
  runtime.registerRoutes(router)
  bindPlatformRuntime(runtime.context, router)
  apps.push(app)
  return { app, warnings }
}

afterEach(() => {
  apps.splice(0).forEach((app) => {
    if ((app as typeof app & { _container?: Element })._container) app.unmount()
  })
})

describe('Core and compat plugin installation', () => {
  it('gives compatibility form rules an explicit i18n dependency for package consumers', async () => {
    const { required } = await import('../../compat/utils/formRules')

    expect(required.required).toBe(true)
    expect(required.message).toBe('common.required')
  })

  it('reuses the Core i18n instance while adding compat translations', async () => {
    const { app, warnings } = createInstalledApp()
    const coreI18n = (app as typeof app & { __VUE_I18N__?: { global: { t: (key: string) => string } } }).__VUE_I18N__
    await setupI18n(app)

    expect(i18n.global).toBe(coreI18n?.global)
    expect(coreI18n?.global.t('common.required')).toBe('该项为必填项')
    expect(coreI18n?.global.t('common.profile')).toBe('个人中心')
    expect(warnings).not.toContainEqual(expect.stringContaining('already been applied'))
    expect(warnings).not.toContainEqual(expect.stringContaining('already been registered'))
  })

  it('does not re-register Element Plus components while installing FormCreate', async () => {
    const { app, warnings } = createInstalledApp()

    const { setupFormCreate } = await import('../../compat/plugins/formCreate')
    setupFormCreate(app)

    expect(app.component('ElButton')).toBeDefined()
    expect((app.config.globalProperties as Record<string, unknown>).$formCreate).toBeDefined()
    expect(warnings).not.toContainEqual(expect.stringContaining('already been applied'))
    expect(warnings).not.toContainEqual(expect.stringContaining('already been registered'))
  })
})
