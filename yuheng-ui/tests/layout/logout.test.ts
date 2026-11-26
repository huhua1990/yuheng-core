import { describe, expect, it, vi } from 'vitest'
import { logoutAndRedirect } from '../../src/layout/logout'

describe('logoutAndRedirect', () => {
  it('redirects to login when the logout request rejects', async () => {
    const router = {
      currentRoute: { value: { fullPath: '/home' } },
      push: vi.fn(async () => undefined)
    }
    const userStore = {
      logout: vi.fn(async () => {
        throw new Error('租户标识缺失')
      }),
      userInfo: { id: 1 }
    }
    const permissionStore = { resetRoutes: vi.fn() }

    await logoutAndRedirect({
      context: {} as never,
      userStore,
      permissionStore,
      router
    })

    expect(userStore.logout).toHaveBeenCalledOnce()
    expect(permissionStore.resetRoutes).toHaveBeenCalledOnce()
    expect(router.push).toHaveBeenCalledWith({
      path: '/login',
      query: { redirect: '/home' }
    })
  })
})
