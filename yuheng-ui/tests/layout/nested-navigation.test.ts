// @vitest-environment happy-dom
import { createApp, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, describe, expect, it } from 'vitest'
import NavigationBranch from '../../src/layout/NavigationBranch.vue'

describe('nested platform navigation', () => {
  let cleanup = () => {}
  afterEach(() => cleanup())

  it('expands menu branches and navigates to a nested authorized page', async () => {
    const routes = [{ path: '/system', name: 'system', component: { template: '<router-view />' }, meta: { title: '系统管理' }, children: [
      { path: 'user', name: 'user', component: { template: '<div>用户页面</div>' }, meta: { title: '用户管理' } },
      { path: 'tenant', name: 'tenant', component: { template: '<router-view />' }, meta: { title: '租户管理' }, children: [
        { path: 'list', name: 'tenant-list', component: { template: '<div>租户页面</div>' }, meta: { title: '租户列表' } }
      ] },
      { path: 'hidden', name: 'hidden', component: {}, meta: { title: '隐藏页面', hidden: true } }
    ] }]
    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/system/tenant/list')
    await router.isReady()
    const host = document.createElement('div')
    document.body.appendChild(host)
    const app = createApp(NavigationBranch, { routes, collapsed: false })
    app.use(router).mount(host)
    cleanup = () => { app.unmount(); host.remove() }
    await nextTick()
    expect(host.textContent).toContain('用户管理')
    expect(host.textContent).toContain('租户列表')
    expect(host.textContent).not.toContain('隐藏页面')
    const link = [...host.querySelectorAll('a')].find((item) => item.textContent?.includes('用户管理'))
    expect(link?.getAttribute('href')).toBe('/system/user')
    link?.click()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(router.currentRoute.value.path).toBe('/system/user')
  })

  it('hides nested entries and branch toggles when the sidebar is collapsed', async () => {
    const routes = [{ path: '/system', name: 'system', component: {}, meta: { title: '系统管理' }, children: [
      { path: 'user', name: 'user', component: {}, meta: { title: '用户管理' } }
    ] }]
    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/system/user')
    await router.isReady()
    const host = document.createElement('div')
    const app = createApp(NavigationBranch, { routes, collapsed: true })
    app.use(router).mount(host)
    cleanup = () => app.unmount()
    expect(host.querySelectorAll('a')).toHaveLength(1)
    expect(host.querySelectorAll('button')).toHaveLength(0)
  })
})
