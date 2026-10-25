import type { AxiosResponse } from 'axios'
import { describe, expect, it, vi } from 'vitest'
import { createYuhengRequest } from '../../src/request/client'
import { YuhengApiError } from '../../src/request/errors'
import { MemoryTokenStore } from '../helpers/memory-token-store'
import { RecordingAdapter } from '../helpers/recording-adapter'

function response<T>(config: AxiosResponse['config'], data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config
  }
}

describe('createYuhengRequest', () => {
  it('injects auth and tenant headers while whitelisting login URLs', async () => {
    const tokens = new MemoryTokenStore()
    tokens.setToken({ accessToken: 'access', tenantId: 'tenant', visitTenantId: 'visit' })
    const adapter = new RecordingAdapter(async (config) =>
      response(config, { code: 0, data: { ok: true } })
    )
    const request = createYuhengRequest({
      apiBaseUrl: '/api',
      tenantEnabled: true,
      tokenStore: tokens,
      adapter: adapter.adapter
    })

    await request.get('/users')
    await request.post('/login', { username: 'demo' })

    expect(adapter.requests[0].config.headers.Authorization).toBe('Bearer access')
    expect(adapter.requests[0].config.headers['tenant-id']).toBe('tenant')
    expect(adapter.requests[0].config.headers['visit-tenant-id']).toBe('visit')
    expect(adapter.requests[1].config.headers.Authorization).toBeUndefined()
  })

  it('adds cache headers and serializes urlencoded forms', async () => {
    const adapter = new RecordingAdapter(async (config) =>
      response(config, { code: 0, data: { ok: true } })
    )
    const request = createYuhengRequest({ apiBaseUrl: '/api', adapter: adapter.adapter })

    await request.get('/users')
    await request.post(
      '/search',
      { filter: { name: 'demo' }, page: 1 },
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )

    expect(adapter.requests[0].config.headers['Cache-Control']).toBe('no-cache')
    expect(adapter.requests[0].config.headers.Pragma).toBe('no-cache')
    expect(adapter.requests[1].config.data).toBe('filter%5Bname%5D=demo&page=1')
  })

  it('returns envelope data and supports original, upload, and download methods', async () => {
    const adapter = new RecordingAdapter(async (config) => {
      if (config.url?.includes('/download')) {
        return response(config, new Uint8Array([1, 2, 3]), 200)
      }
      return response(config, { code: 0, data: { id: 1 }, msg: 'ok' })
    })
    const request = createYuhengRequest({ apiBaseUrl: '/api', adapter: adapter.adapter })

    await expect(request.get<{ id: number }>('/users/1')).resolves.toEqual({ id: 1 })
    await expect(request.postOriginal('/users', { name: 'demo' })).resolves.toMatchObject({
      data: { code: 0, data: { id: 1 } }
    })
    await request.upload('/files', new FormData())
    await expect(request.download('/download')).resolves.toEqual(new Uint8Array([1, 2, 3]))
    expect(adapter.requests[2].config.headers['Content-Type']).toContain('multipart/form-data')
  })

  it('refreshes once for concurrent 401 responses and replays both requests', async () => {
    const tokens = new MemoryTokenStore()
    tokens.setToken({ accessToken: 'old', refreshToken: 'refresh' })
    let unauthorizedResponses = 0
    const adapter = new RecordingAdapter(async (config) => {
      if (unauthorizedResponses < 2) {
        unauthorizedResponses += 1
        return response(config, { code: 401, data: null, msg: 'expired' })
      }
      return response(config, { code: 0, data: { path: config.url } })
    })
    const refreshToken = vi.fn(async () => ({ code: 0, data: { accessToken: 'new', refreshToken: 'refresh-2' } }))
    const request = createYuhengRequest({
      apiBaseUrl: '/api',
      tokenStore: tokens,
      adapter: adapter.adapter,
      refreshToken
    })

    const [firstResult, secondResult] = await Promise.all([
      request.get('/one'),
      request.get('/two')
    ])

    expect(refreshToken).toHaveBeenCalledTimes(1)
    expect(tokens.getAccessToken()).toBe('new')
    expect(firstResult).toEqual({ path: '/one' })
    expect(secondResult).toEqual({ path: '/two' })
  })

  it('converts API errors and calls the callback once', async () => {
    const onApiError = vi.fn()
    const adapter = new RecordingAdapter(async (config) =>
      response(config, { code: 403, data: null, msg: 'forbidden' })
    )
    const request = createYuhengRequest({
      apiBaseUrl: '/api',
      adapter: adapter.adapter,
      onApiError
    })

    await expect(request.get('/private')).rejects.toBeInstanceOf(YuhengApiError)
    await expect(request.get('/private')).rejects.toMatchObject({
      code: 403,
      message: 'forbidden'
    })
    expect(onApiError).toHaveBeenCalledTimes(2)
  })

  it('clears auth and reports refresh failure without calling the API callback twice', async () => {
    const tokens = new MemoryTokenStore()
    tokens.setToken({ accessToken: 'old', refreshToken: 'refresh' })
    const onUnauthorized = vi.fn()
    const adapter = new RecordingAdapter(async (config) =>
      response(config, { code: 401, data: null, msg: 'expired' })
    )
    const request = createYuhengRequest({
      apiBaseUrl: '/api',
      tokenStore: tokens,
      adapter: adapter.adapter,
      refreshToken: async () => ({ code: 401, data: { accessToken: '', refreshToken: '' }, msg: 'bad' }),
      onUnauthorized
    })

    await expect(request.get('/private')).rejects.toBeInstanceOf(YuhengApiError)
    expect(tokens.getAccessToken()).toBeUndefined()
    expect(onUnauthorized).toHaveBeenCalledWith('refresh-failed')
  })
})
