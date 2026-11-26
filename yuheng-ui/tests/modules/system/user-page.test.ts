import { describe, expect, it } from 'vitest'
import { systemRoutes } from '../../../src/modules/system/routes'

describe('system user page', () => {
  it('uses a dedicated user management view instead of the generic placeholder', () => {
    const route = systemRoutes.find((item) => item.name === 'SystemUser')

    expect((route?.component as { name?: string })?.name).toBe('SystemUserPage')
  })

  it('provides dedicated platform pages for core user and role administration routes', () => {
    const user = systemRoutes.find((item) => item.name === 'SystemUser')
    const role = systemRoutes.find((item) => item.name === 'SystemRole')

    expect((user?.component as { name?: string })?.name).toBe('SystemUserPage')
    expect((role?.component as { name?: string })?.name).toBe('SystemRolePage')
  })

  it('maps every list-backed system menu to a real data page', () => {
    const listRoutes = systemRoutes.filter((route) => !['SystemDept', 'SystemArea'].includes(String(route.name)))
    expect(listRoutes.every((route) => (route.component as { name?: string }).name !== 'Page')).toBe(true)
  })
})
