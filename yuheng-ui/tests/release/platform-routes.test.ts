import { describe, expect, it } from 'vitest'
import { platformRoutes } from '../../src/router/platform-routes'
import { systemRoutes } from '../../src/modules/system/routes'
import { infraRoutes } from '../../src/modules/infra/routes'

describe('release platform routes', () => {
  it('has unique route names and includes system and infra contracts', () => {
    const flatten = (routes: typeof platformRoutes): typeof platformRoutes[number][] =>
      routes.flatMap((route) => [route, ...flatten(route.children ?? [])])
    const routes = flatten(platformRoutes)
    const names = routes.map((route) => String(route.name))
    const paths = routes.map((route) => route.path)
    const platformNames = new Set(names)
    expect(new Set(names).size).toBe(names.length)
    expect(new Set(paths).size).toBe(paths.length)
    expect(platformNames).toContain('Profile')
    expect(systemRoutes.some((route) => route.name === 'SystemUser' && route.path === '/system/user')).toBe(true)
    expect(infraRoutes.some((route) => route.name === 'InfraConfig' && route.path === '/infra/config')).toBe(true)
  })
})
