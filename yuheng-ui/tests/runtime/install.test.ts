import { defineComponent, createApp } from 'vue'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { installYuhengUi } from '../../src/runtime/install'

describe('installYuhengUi', () => {
  it('installs into an existing app without creating or mounting another app', () => {
    const app = createApp(defineComponent({ template: '<div />' }))
    const runtime = installYuhengUi(app, { apiBaseUrl: '/api' })

    expect(runtime.context.request).toBeDefined()
    expect(runtime.context.tokenStore).toBeDefined()
    expect(runtime.context.tenantStore).toBeDefined()
    expect(runtime.context.pinia).toBeDefined()
    expect((app as unknown as { _context: { directives: Record<string, unknown> } })._context.directives.focus).toBeDefined()

    const router = createRouter({ history: createMemoryHistory(), routes: [] })
    runtime.registerRoutes(router)
    expect(router.hasRoute('Login')).toBe(true)

    runtime.dispose()
    expect(runtime.disposed).toBe(true)
  })

  it('does not share stores between two runtime instances', () => {
    const first = installYuhengUi(createApp(defineComponent({})), { apiBaseUrl: '/first' })
    const second = installYuhengUi(createApp(defineComponent({})), { apiBaseUrl: '/second' })

    expect(first.context.pinia).not.toBe(second.context.pinia)
    expect(first.context).not.toBe(second.context)
    first.dispose()
    second.dispose()
  })

  it('makes existing router guards inert after disposal', async () => {
    const app = createApp(defineComponent({}))
    const runtime = installYuhengUi(app, { apiBaseUrl: '/api' })
    const router = createRouter({ history: createMemoryHistory(), routes: [] })
    runtime.registerRoutes(router)
    router.addRoute({ name: 'Protected', path: '/protected', component: { render: () => null } })

    runtime.dispose()
    await router.push('/protected')

    expect(router.currentRoute.value.fullPath).toBe('/protected')
    expect(runtime.context.initialized).toBe(false)
  })
})
