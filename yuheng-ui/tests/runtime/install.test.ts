import { defineComponent, createApp } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { installYuhengUi } from '../../src/runtime/install'
import { usePermissionStore } from '../../src/stores/permission'
import { useUserStore } from '../../src/stores/user'
import { createBrowserTenantStore } from '../../src/auth/tenant'
import { MemoryTokenStore } from '../helpers/memory-token-store'

describe('installYuhengUi', () => {
  it('installs into an existing app without creating or mounting another app', () => {
    const originalDocument = globalThis.document
    const querySelector = vi.fn()
    Object.defineProperty(globalThis, 'document', { configurable: true, value: { querySelector } })
    try {
      const app = createApp(defineComponent({ template: '<div />' }))
      const mount = vi.spyOn(app, 'mount')
      const runtime = installYuhengUi(app, { apiBaseUrl: '/api' })

      expect(runtime.context.request).toBeDefined()
      expect(runtime.context.tokenStore).toBeDefined()
      expect(runtime.context.tenantStore).toBeDefined()
      expect(runtime.context.pinia).toBeDefined()
      const appContext = (app as unknown as { _context: { directives: Record<string, unknown>; components: Record<string, unknown> } })._context
      expect(appContext.directives.focus).toBeDefined()
      expect(appContext.components.ConfigGlobal).toBeDefined()
      expect(appContext.components.Dialog).toBeDefined()
      expect(querySelector).not.toHaveBeenCalledWith('#app')
      expect(mount).not.toHaveBeenCalled()

      const router = createRouter({ history: createMemoryHistory(), routes: [] })
      runtime.registerRoutes(router)
      expect(router.hasRoute('Login')).toBe(true)

      runtime.dispose()
      expect(runtime.disposed).toBe(true)
    } finally {
      Object.defineProperty(globalThis, 'document', { configurable: true, value: originalDocument })
    }
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

  it('clears token, tenant, user and permissions on logout', async () => {
    const tokens = new MemoryTokenStore()
    tokens.setToken({ accessToken: 'access', refreshToken: 'refresh' })
    const tenant = createBrowserTenantStore()
    tenant.setTenantContext({ tenantId: 'tenant' })
    const context = installYuhengUi(createApp(defineComponent({})), {
      apiBaseUrl: '/api',
      request: { post: async () => undefined } as never,
      tokenStore: tokens,
      tenantStore: tenant
    }).context
    const user = useUserStore(context.pinia)
    const permissions = usePermissionStore(context.pinia)
    user.userInfo = { id: 1 }
    user.permissions = ['system:user:query']
    user.loaded = true
    permissions.addRoutes = [{ name: 'Dynamic', path: '/dynamic', component: { render: () => null } }]

    await user.logout(context)
    permissions.resetRoutes()

    expect(tokens.getAccessToken()).toBeUndefined()
    expect(tenant.getTenantContext()).toEqual({})
    expect(user.userInfo).toBeNull()
    expect(user.permissions).toEqual([])
    expect(permissions.getAddRoutes()).toEqual([])
  })
})
