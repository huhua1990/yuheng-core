import { describe, expect, it } from 'vitest'
import { platformRoutes } from '../../../src/router/platform-routes'
import { systemRoutes } from '../../../src/modules/system/routes'
import { resolveMenuComponent } from '../../../src/router/platform-routes'
import { filterMenuRoutes } from '../../../src/router/guards'

describe('system platform routes', () => {
  it('registers the core system route families', () => {
    const routes = platformRoutes.flatMap((route) => [route, ...(route.children ?? [])])
    expect(systemRoutes.some((route) => route.path === '/system/user')).toBe(true)
    expect(systemRoutes.some((route) => route.path === '/system/role')).toBe(true)
    expect(systemRoutes.length).toBeGreaterThanOrEqual(10)
    expect(typeof resolveMenuComponent('SystemUser')).toBe('object')
    expect(typeof resolveMenuComponent('system/user/index')).toBe('object')
    expect(typeof resolveMenuComponent('infra/config/index')).toBe('object')
    expect(resolveMenuComponent('MallProductSpu')).toBeUndefined()
    const menuRoutes = filterMenuRoutes(
      [{ id: 1, name: '用户管理', path: '/system/user', component: 'system/user/index', permission: 'system:user:list' }],
      ['system:user:list'],
      resolveMenuComponent
    )
    expect((menuRoutes[0]?.component as { name?: string }).name).toBe('SystemUserPage')
    expect(
      routes.every(
        (route) =>
          route.meta?.permission === undefined ||
          typeof route.meta?.permission === 'string' ||
          Array.isArray(route.meta?.permission)
      )
    ).toBe(true)
  })
})
