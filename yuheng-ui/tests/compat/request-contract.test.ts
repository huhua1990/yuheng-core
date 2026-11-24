import { describe, expect, it, vi } from 'vitest'
import request from '../../compat/config/axios'

const send = vi.hoisted(() => vi.fn())
vi.mock('../../compat/runtime', () => ({
  getPlatformContext: () => ({ request: { request: send } })
}))

// These calls are checked by vue-tsc but must not execute during the test.
function typeContract() {
  const user = request.get<{ id: number }>({ url: '/users', params: { page: 1 } })
  user.then(value => value.id.toFixed())
  request.post({ url: '/users', data: { name: 'demo' }, timeout: 1000 })
  request.get({ url: '/users', timeout: 300000 })
  const download = request.download({ url: '/users/export' })
  download.then(file => file.size.toFixed())
  // @ts-expect-error A URL is required for every request.
  request.get({ params: { page: 1 } })
  // @ts-expect-error URLs must be strings.
  request.post({ url: 42 })
  // @ts-expect-error Axios timeout is measured in milliseconds.
  request.get({ url: '/users', timeout: 'slow' })
}
void typeContract

describe('compat request adapter', () => {
  it('forwards configuration and applies upload content type', async () => {
    send.mockResolvedValueOnce({ id: 1 })
    await expect(request.upload<{ id: number }>({
      url: '/files', data: new FormData(), headers: { 'X-Test': 'yes' }
    })).resolves.toEqual({ id: 1 })
    expect(send).toHaveBeenCalledWith(expect.objectContaining({
      url: '/files', method: 'POST',
      headers: { 'X-Test': 'yes', 'Content-Type': 'multipart/form-data' }
    }))
  })
})
