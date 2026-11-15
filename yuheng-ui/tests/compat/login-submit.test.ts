import { describe, expect, it, vi } from 'vitest'
import { submitLogin } from '../../compat/views/Login/components/loginSubmit'

describe('login submission', () => {
  it('does not query tenant or login when validation fails', async () => {
    const tenant = vi.fn()
    const login = vi.fn()
    const report = vi.fn()
    await submitLogin({ validate: async () => { throw { username: ['required'] } }, tenant, login, report })
    expect(tenant).not.toHaveBeenCalled()
    expect(login).not.toHaveBeenCalled()
    expect(report).not.toHaveBeenCalled()
  })

  it('reports a tenant or login failure to the user', async () => {
    const report = vi.fn()
    await submitLogin({ validate: async () => true, tenant: async () => { throw new Error('租户不存在') }, login: vi.fn(), report })
    expect(report).toHaveBeenCalledWith('租户不存在')
  })

  it('stops when a tenant lookup returns no tenant', async () => {
    const report = vi.fn()
    const login = vi.fn()
    await submitLogin({ validate: async () => true, tenant: async () => null, login, report, tenantRequired: true })
    expect(login).not.toHaveBeenCalled()
    expect(report).toHaveBeenCalledWith('租户不存在')
  })
})
