import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { filterMenuRoutes, resolveNavigation } from '../../src/router/guards'
import { createYuhengRouter } from '../../src/router'
import { platformRoutes } from '../../src/router/platform-routes'

describe('platform route guards', () => {
  it('redirects an unauthenticated protected path to login with an encoded redirect', async () => {
    await expect(
      resolveNavigation('/system/user?tab=roles', {
        token: undefined,
        initialized: true
      })
    ).resolves.toBe('/login?redirect=%2Fsystem%2Fuser%3Ftab%3Droles')
  })

  it('allows every public route without a token', async () => {
    for (const path of [
      '/login',
      '/social-login',
      '/auth-redirect',
      '/bind',
      '/register',
      '/oauthLogin/gitee',
      '/pms/kb/document/share'
    ]) {
      await expect(resolveNavigation(path, { initialized: true })).resolves.toBe(path)
    }
  })

  it('redirects an authenticated login request to home', async () => {
    await expect(
      resolveNavigation('/login', { token: 'access-token', initialized: true })
    ).resolves.toBe('/')
  })

  it('initializes a protected session once before continuing', async () => {
    const initialize = vi.fn(async () => undefined)
    const context = { token: 'access-token', initialized: false, initialize }

    await expect(resolveNavigation('/system/user', context)).resolves.toBe('/system/user')
    await expect(resolveNavigation('/system/role', context)).resolves.toBe('/system/role')
    expect(initialize).toHaveBeenCalledTimes(1)
    expect(context.initialized).toBe(true)
  })

  it('filters permissioned menu routes while preserving accessible containers', () => {
    const routes = filterMenuRoutes(
      [
        {
          id: 1,
          name: 'System',
          path: '/system',
          children: [
            { id: 2, name: 'User', path: '/system/user', permission: 'system:user:query' },
            { id: 3, name: 'Secret', path: '/system/secret', permission: 'secret:read' }
          ]
        },
        { id: 4, name: 'Hidden', path: '/hidden', permission: 'secret:read' }
      ],
      ['system:user:query']
    )

    expect(routes.map((route) => route.path)).toEqual(['/system'])
    expect(routes[0]?.children?.map((route) => route.path)).toEqual(['/system/user'])
  })

  it('registers dynamic routes only once and resets only dynamic names', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [...platformRoutes]
    })
    const dynamic = {
      name: 'DynamicUser',
      path: '/system/user',
      component: { render: () => null }
    }

    const first = createYuhengRouter({ router })
    first.registerRoutes(router, [dynamic])
    first.registerRoutes(router, [dynamic])

    expect(router.getRoutes().filter((route) => route.name === 'DynamicUser')).toHaveLength(1)
    first.resetRoutes(router)

    expect(router.hasRoute('DynamicUser')).toBe(false)
    expect(router.hasRoute('Login')).toBe(true)
    expect(router.hasRoute('Home')).toBe(true)
  })
})
