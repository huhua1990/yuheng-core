import { describe, expect, it } from 'vitest'
import { infraRoutes } from '../../../src/modules/infra/routes'
import { platformRoutes } from '../../../src/router/platform-routes'

describe('infra platform routes', () => {
  it('registers production infra routes and excludes demo routes', () => {
    expect(infraRoutes.some((route) => route.path === '/infra/config')).toBe(true)
    expect(infraRoutes.some((route) => route.path === '/infra/codegen')).toBe(true)
    expect(infraRoutes.some((route) => route.path.includes('/demo'))).toBe(false)
    expect(infraRoutes.every((route) => String(route.name).startsWith('Infra'))).toBe(true)
    expect((infraRoutes.find((route) => route.name === 'InfraConfig')?.component as { name?: string }).name)
      .toBe('InfraConfigPage')
    const listRoutes = infraRoutes.filter((route) =>
      ['InfraApiAccessLog', 'InfraApiErrorLog', 'InfraFile', 'InfraFileConfig', 'InfraJob', 'InfraJobLog', 'InfraCodegen'].includes(String(route.name))
    )
    expect(listRoutes).toHaveLength(7)
    expect(listRoutes.every((route) => (route.component as { name?: string }).name?.endsWith('Page'))).toBe(true)
    expect(
      infraRoutes.every(
        (route) =>
          typeof route.meta?.permission === 'string' || Array.isArray(route.meta?.permission)
      )
    ).toBe(true)
  })
})
