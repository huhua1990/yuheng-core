import { describe, expect, it } from 'vitest'
import { platformRoutes } from '../../../src/router/platform-routes'
import { systemRoutes } from '../../../src/modules/system/routes'

describe('system platform routes', () => {
  it('registers the core system route families', () => {
    expect(platformRoutes.some((route) => route.path === '/system/user')).toBe(true)
    expect(platformRoutes.some((route) => route.path === '/system/role')).toBe(true)
    expect(systemRoutes.length).toBeGreaterThanOrEqual(10)
    expect(
      platformRoutes.every(
        (route) =>
          route.meta?.permission === undefined ||
          typeof route.meta?.permission === 'string' ||
          Array.isArray(route.meta?.permission)
      )
    ).toBe(true)
  })
})
