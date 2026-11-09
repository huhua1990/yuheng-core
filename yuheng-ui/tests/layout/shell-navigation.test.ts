import { describe, expect, it } from 'vitest'
import { platformRoutes } from '../../src/router/platform-routes'
import { filterMenuRoutes } from '../../src/router/guards'
import { systemRoutes } from '../../src/modules/system/routes'
import { infraRoutes } from '../../src/modules/infra/routes'

describe('platform shell navigation', () => {
  it('renders platform pages as children of the shell route', () => {
    const home = platformRoutes.find((route) => route.name === 'Home')
    const children = home?.children ?? []
    const names = children.map((route) => String(route.name))

    expect(names).toContain('Profile')
    expect(systemRoutes.find((route) => route.name === 'SystemUser')?.path).toBe('/system/user')
    expect(infraRoutes.find((route) => route.name === 'InfraConfig')?.path).toBe('/infra/config')
  })

  it('shows only routes granted by the current permission menu', () => {
    const routes = filterMenuRoutes(
      [
        { id: 1, name: '用户管理', path: '/system/user', component: 'SystemUser', permission: 'system:user:list' },
        { id: 2, name: '密钥管理', path: '/system/secret', component: 'SystemSecret', permission: 'system:secret:list' }
      ],
      ['system:user:list']
    )

    expect(routes.map((route) => route.path)).toEqual(['/system/user'])
    expect(routes[0]?.meta?.title).toBe('用户管理')
  })
})
