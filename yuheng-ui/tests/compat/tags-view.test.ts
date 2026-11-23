import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import { useTagsViewStore } from '../../compat/store/modules/tagsView'

const loadRouteGenerator = vi.hoisted(() => vi.fn())
vi.mock('../../compat/utils/routerHelper.ts', () => {
  loadRouteGenerator()
  return { getRawRoute: (view: unknown) => view }
})

describe('compat tags view store', () => {
  it('does not load the layout route generator', () => {
    expect(loadRouteGenerator).not.toHaveBeenCalled()
  })
  it('keeps visited tags and cached names consistent when closing a view', async () => {
    setActivePinia(createPinia())
    const router = createRouter({ history: createMemoryHistory(), routes: [
      { path: '/cached', name: 'Cached', component: {}, meta: { title: 'Cached' } },
      { path: '/uncached', name: 'Uncached', component: {}, meta: { noCache: true } }
    ] })
    const store = useTagsViewStore()
    await router.push('/cached')
    const cached = router.currentRoute.value
    store.addView(cached)
    store.addView(cached)
    await router.push('/uncached')
    store.addView(router.currentRoute.value)
    expect(store.getVisitedViews).toHaveLength(2)
    expect(store.getCachedViews).toEqual(['Cached'])
    store.delView(cached)
    expect(store.getVisitedViews.map(view => view.name)).toEqual(['Uncached'])
    expect(store.getCachedViews).toEqual([])
  })
})
