import { describe, expect, it } from 'vitest'
import { platformRoutes } from '../../src/router/platform-routes'

describe('release platform routes', () => {
  it('has unique route names and includes system and infra contracts', () => {
    const names = platformRoutes.map((route) => String(route.name))
    const paths = platformRoutes.map((route) => route.path)
    expect(new Set(names).size).toBe(names.length)
    expect(new Set(paths).size).toBe(paths.length)
    expect(names).toContain('SystemUser')
    expect(names).toContain('InfraConfig')
    expect(paths.some((path) => path === '/system/user')).toBe(true)
    expect(paths.some((path) => path === '/infra/config')).toBe(true)
  })
})
