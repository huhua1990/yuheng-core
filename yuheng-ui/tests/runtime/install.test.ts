import { defineComponent, createApp } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { installYuhengUi } from '../../src/runtime/install'
import { usePermissionStore } from '../../src/stores/permission'
import { useUserStore } from '../../src/stores/user'
import { createBrowserTenantStore } from '../../src/auth/tenant'
import { MemoryTokenStore } from '../helpers/memory-token-store'
import { createYuhengRequest } from '../../src/request'
import { YuhengApiError } from '../../src/request/errors'

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

  it('uses backend permissions when constructing dynamic menu routes', async () => {
    const tokens = new MemoryTokenStore()
    tokens.setToken({ accessToken: 'access' })
    const runtime = installYuhengUi(createApp(defineComponent({})), {
      apiBaseUrl: '/api',
      tokenStore: tokens,
      request: {
        get: async (url: string) => url.includes('permission-info')
          ? { user: { id: 1 }, permissions: ['system:user:list'], menus: [
              { id: 1, name: '用户管理', path: '/system/user', component: 'SystemUser', permission: 'system:user:list' }
            ] }
          : []
      } as never
    })
    await runtime.context.initialize?.()
    const permissions = usePermissionStore(runtime.context.pinia)
    expect(permissions.getAddRoutes().map((route) => route.path)).toContain('/system/user')
    runtime.dispose()
  })

  it('finishes initial navigation at login when there is no session', async () => {
    const runtime = installYuhengUi(createApp(defineComponent({})), {
      apiBaseUrl: '/api',
      tokenStore: new MemoryTokenStore()
    })
    const router = createRouter({ history: createMemoryHistory(), routes: [] })
    runtime.registerRoutes(router)
    router.onError(vi.fn())

    await expect(router.push('/')).resolves.toBeUndefined()
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('Login')
    expect(router.currentRoute.value.query.redirect).toBe('/')
    runtime.dispose()
  })

  it('allows direct login navigation with a redirect query', async () => {
    const runtime = installYuhengUi(createApp(defineComponent({})), {
      apiBaseUrl: '/api',
      tokenStore: new MemoryTokenStore()
    })
    const router = createRouter({ history: createMemoryHistory(), routes: [] })
    runtime.registerRoutes(router)
    router.onError(vi.fn())

    await expect(router.push('/login?redirect=%2Fprofile')).resolves.toBeUndefined()

    expect(router.currentRoute.value.name).toBe('Login')
    expect(router.currentRoute.value.query.redirect).toBe('/profile')
    runtime.dispose()
  })

  it('continues authenticated navigation without redirecting to the same path', async () => {
    const tokens = new MemoryTokenStore()
    tokens.setToken({ accessToken: 'access' })
    const get = vi.fn(async (url: string) => url.includes('permission-info')
      ? { user: { id: 1 }, permissions: [], menus: [] }
      : [])
    const runtime = installYuhengUi(createApp(defineComponent({})), {
      apiBaseUrl: '/api',
      tokenStore: tokens,
      request: { get } as never
    })
    const router = createRouter({ history: createMemoryHistory(), routes: [] })
    runtime.registerRoutes(router)
    router.onError(vi.fn())

    await expect(router.push('/profile?tab=security')).resolves.toBeUndefined()
    await router.isReady()
    expect(router.currentRoute.value.fullPath).toBe('/profile?tab=security')
    await expect(router.push('/login')).resolves.toBeUndefined()

    expect(router.currentRoute.value.name).toBe('HomeDashboard')
    expect(get.mock.calls.filter(([url]) => url.includes('permission-info'))).toHaveLength(1)
    runtime.dispose()
  })

  it('recovers initial navigation after stored credentials fail to refresh', async () => {
    const tokens = new MemoryTokenStore()
    tokens.setToken({ accessToken: 'expired', refreshToken: 'expired-refresh' })
    const tenant = createBrowserTenantStore()
    tenant.setTenantContext({ tenantId: 'tenant' })
    const request = createYuhengRequest({
      apiBaseUrl: '/api',
      tokenStore: tokens,
      tenantStore: tenant,
      adapter: async (config) => ({
        data: { code: 401, msg: '账号未登录', data: null },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      })
    })
    const runtime = installYuhengUi(createApp(defineComponent({})), {
      apiBaseUrl: '/api', tokenStore: tokens, tenantStore: tenant, request
    })
    const router = createRouter({ history: createMemoryHistory(), routes: [] })
    runtime.registerRoutes(router)
    router.onError(vi.fn())

    await expect(router.push('/profile?tab=security')).resolves.toBeUndefined()
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('Login')
    expect(router.currentRoute.value.query.redirect).toBe('/profile?tab=security')
    expect(tokens.getAccessToken()).toBeUndefined()
    expect(tokens.getRefreshToken()).toBeUndefined()
    expect(tenant.getTenantContext()).toEqual({})
    expect(runtime.context.initialized).toBe(false)
    runtime.dispose()
  })

  it('clears rejected credentials from an injected request before redirecting', async () => {
    const tokens = new MemoryTokenStore()
    tokens.setToken({ accessToken: 'expired', refreshToken: 'expired-refresh' })
    const runtime = installYuhengUi(createApp(defineComponent({})), {
      apiBaseUrl: '/api',
      tokenStore: tokens,
      request: { get: async () => { throw new YuhengApiError('Unauthorized', 401) } } as never
    })
    const router = createRouter({ history: createMemoryHistory(), routes: [] })
    runtime.registerRoutes(router)
    router.onError(vi.fn())

    await expect(router.push('/')).resolves.toBeUndefined()

    expect(router.currentRoute.value.name).toBe('Login')
    expect(tokens.getAccessToken()).toBeUndefined()
    runtime.dispose()
  })

  it.each([new Error('Network unavailable'), new YuhengApiError('Server unavailable', 500)])(
    'preserves non-authentication initialization errors: %s', async (error) => {
      const tokens = new MemoryTokenStore()
      tokens.setToken({ accessToken: 'access' })
      const runtime = installYuhengUi(createApp(defineComponent({})), {
        apiBaseUrl: '/api',
        tokenStore: tokens,
        request: { get: async () => { throw error } } as never
      })
      const router = createRouter({ history: createMemoryHistory(), routes: [] })
      runtime.registerRoutes(router)
      const onError = vi.fn()
      router.onError(onError)

      await expect(router.push('/')).rejects.toBe(error)

      expect(onError).toHaveBeenCalledWith(error, expect.anything(), expect.anything())
      expect(tokens.getAccessToken()).toBe('access')
      runtime.dispose()
    }
  )

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
