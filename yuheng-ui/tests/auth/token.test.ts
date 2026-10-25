import { describe, expect, it } from 'vitest'
import {
  createBrowserTokenStore,
  createDefaultTokenStore,
  type TokenSnapshot
} from '../../src/auth/token'
import { MemoryTokenStore } from '../helpers/memory-token-store'

describe('token stores', () => {
  it('persists access, refresh, and tenant fields in an injectable memory store', () => {
    const store = new MemoryTokenStore()
    const snapshot: TokenSnapshot = {
      accessToken: 'access',
      refreshToken: 'refresh',
      tenantId: 'tenant',
      visitTenantId: 'visit'
    }

    store.setToken(snapshot)

    expect(store.getAccessToken()).toBe('access')
    expect(store.getRefreshToken()).toBe('refresh')
    expect(store.getSnapshot()).toEqual(snapshot)

    store.removeToken()

    expect(store.getSnapshot()).toEqual({})
  })

  it('uses localStorage when available and remains safe without browser globals', () => {
    expect(createDefaultTokenStore()).toBeDefined()

    const values = new Map<string, string>()
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key)
    }
    const store = createBrowserTokenStore(storage)

    store.setToken({
      accessToken: 'access',
      refreshToken: 'refresh',
      tenantId: 'tenant',
      visitTenantId: 'visit'
    })
    expect(store.getAccessToken()).toBe('access')
    expect(store.getRefreshToken()).toBe('refresh')
    expect(store.getSnapshot()).toMatchObject({
      tenantId: 'tenant',
      visitTenantId: 'visit'
    })

    store.removeToken()
    expect(store.getAccessToken()).toBeUndefined()
    expect(store.getRefreshToken()).toBeUndefined()
  })

  it('retains tenant fields in the no-storage fallback snapshot', () => {
    const store = createBrowserTokenStore()

    store.setToken({
      accessToken: 'access',
      refreshToken: 'refresh',
      tenantId: 'tenant',
      visitTenantId: 'visit'
    })

    expect(store.getSnapshot()).toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
      tenantId: 'tenant',
      visitTenantId: 'visit'
    })
  })
})
