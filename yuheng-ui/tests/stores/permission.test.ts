import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePermissionStore } from '../../src/stores/permission'
import type { YuhengUiContext } from '../../src/runtime/options'

describe('permission store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('generates permission-matching routes through an injected runtime context', async () => {
    const store = usePermissionStore()
    const context = {
      request: {
        get: async () => ({
          menus: [
            { id: 1, name: 'User', path: '/system/user', permission: 'system:user:query' },
            { id: 2, name: 'Secret', path: '/secret', permission: 'secret:read' }
          ]
        })
      }
    } as unknown as YuhengUiContext

    await expect(store.generateRoutes(context, ['system:user:query'])).resolves.toEqual([
      expect.objectContaining({ path: '/system/user' })
    ])
    expect(store.getAddRoutes()).toHaveLength(1)
  })

  it('keeps store state isolated across pinia instances and resets dynamic routes', async () => {
    const firstPinia = createPinia()
    const secondPinia = createPinia()
    const first = usePermissionStore(firstPinia)
    const second = usePermissionStore(secondPinia)

    await first.generateRoutes(
      { request: { get: async () => ({ menus: [] }) } } as unknown as YuhengUiContext,
      [{ id: 1, name: 'First', path: '/first' }]
    )

    expect(first.getAddRoutes()).toHaveLength(1)
    expect(second.getAddRoutes()).toHaveLength(0)

    const addedNames = first.getAddRoutes().map((route) => String(route.name))
    first.resetRoutes()
    expect(first.getAddRoutes()).toHaveLength(0)
    expect(addedNames).toHaveLength(1)
  })

  it('accepts an empty menu response without refetching permission info', async () => {
    const get = async () => ({ menus: [] })
    const store = usePermissionStore()
    const context = { request: { get } } as unknown as YuhengUiContext

    await expect(store.generateRoutes(context, [], [], 'menus')).resolves.toEqual([])
    expect(store.getAddRoutes()).toEqual([])
  })
})
