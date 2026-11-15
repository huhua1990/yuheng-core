import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { describe, expect, it, vi } from 'vitest'
import { createYuhengUiContext } from '../../src/runtime/options'
import { createBrowserTenantStore } from '../../src/auth/tenant'
import { MemoryTokenStore } from '../helpers/memory-token-store'

describe('default runtime session refresh', () => {
  it('refreshes an expired access token through the platform endpoint and replays the query', async () => {
    const tokens = new MemoryTokenStore()
    tokens.setToken({ accessToken: 'expired-access', refreshToken: 'refresh+/token' })
    const tenant = createBrowserTenantStore()
    tenant.setTenantContext({ tenantId: '1' })
    const calls: { path: string; refreshToken: string | null; authorization?: string; tenant?: string; method?: string }[] = []
    const server = createServer((req, res) => {
      const url = new URL(req.url!, 'http://localhost')
      calls.push({ path: url.pathname, refreshToken: url.searchParams.get('refreshToken'), authorization: req.headers.authorization, tenant: req.headers['tenant-id'] as string, method: req.method })
      res.setHeader('Content-Type', 'application/json')
      if (url.pathname === '/admin-api/system/auth/refresh-token') {
        res.end(JSON.stringify({ code: 0, data: { accessToken: 'renewed-access', refreshToken: 'renewed-refresh' } }))
      } else if (req.headers.authorization === 'Bearer renewed-access') {
        res.end(JSON.stringify({ code: 0, data: { total: 0, list: [] } }))
      } else {
        res.end(JSON.stringify({ code: 401, data: null, msg: '账号未登录' }))
      }
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    try {
      const context = createYuhengUiContext({
        apiBaseUrl: `http://127.0.0.1:${(server.address() as AddressInfo).port}/admin-api`,
        tenantEnabled: true, tokenStore: tokens, tenantStore: tenant
      })
      await expect(context.request.get('/system/login-log/page', { params: { pageNo: 1, pageSize: 10 } })).resolves.toEqual({ total: 0, list: [] })
      expect(calls.map((call) => call.path)).toEqual([
        '/admin-api/system/login-log/page', '/admin-api/system/auth/refresh-token', '/admin-api/system/login-log/page'
      ])
      expect(calls[1]).toMatchObject({ method: 'POST', tenant: '1', authorization: undefined, refreshToken: 'refresh+/token' })
      expect(calls[2].authorization).toBe('Bearer renewed-access')
      expect(tokens.getRefreshToken()).toBe('renewed-refresh')
      expect(tenant.getTenantContext()).toEqual({ tenantId: '1' })
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    }
  })

  it('shares one refresh for concurrent queries using the default runtime', async () => {
    const tokens = new MemoryTokenStore()
    tokens.setToken({ accessToken: 'expired', refreshToken: 'refresh' })
    let refreshCount = 0
    const server = createServer((req, res) => {
      res.setHeader('Content-Type', 'application/json')
      if (req.url?.startsWith('/api/system/auth/refresh-token')) {
        refreshCount++
        setTimeout(() => res.end(JSON.stringify({ code: 0, data: { accessToken: 'renewed', refreshToken: 'next' } })), 20)
      } else {
        res.end(JSON.stringify(req.headers.authorization === 'Bearer renewed'
          ? { code: 0, data: req.url } : { code: 401, data: null }))
      }
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    try {
      const context = createYuhengUiContext({
        apiBaseUrl: `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`, tokenStore: tokens
      })
      await expect(Promise.all([context.request.get('/one'), context.request.get('/two')])).resolves.toEqual(['/api/one', '/api/two'])
      expect(refreshCount).toBe(1)
      expect(tokens.getAccessToken()).toBe('renewed')
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    }
  })

  it('clears an invalid refresh session once without recursively refreshing the refresh request', async () => {
    const tokens = new MemoryTokenStore()
    tokens.setToken({ accessToken: 'expired', refreshToken: 'invalid' })
    const tenant = createBrowserTenantStore()
    tenant.setTenantContext({ tenantId: '1' })
    const onUnauthorized = vi.fn()
    let requests = 0
    const server = createServer((_req, res) => {
      requests++
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ code: 401, data: null, msg: '无效的刷新令牌' }))
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    try {
      const context = createYuhengUiContext({
        apiBaseUrl: `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`,
        tokenStore: tokens, tenantStore: tenant, onUnauthorized
      })
      await expect(context.request.get('/system/login-log/page')).rejects.toMatchObject({ code: 401 })
      expect(requests).toBe(2)
      expect(onUnauthorized).toHaveBeenCalledExactlyOnceWith('session-expired')
      expect(tokens.getAccessToken()).toBeUndefined()
      expect(tokens.getRefreshToken()).toBeUndefined()
      expect(tenant.getTenantContext()).toEqual({})
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    }
  })
})
