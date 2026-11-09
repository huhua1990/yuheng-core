import { createRenderer, defineComponent, h, nextTick } from 'vue'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useUserStore } from '../../src/stores/user'
import { usePermissionStore } from '../../src/stores/permission'
import { useDictStore } from '../../src/stores/dict'
import Home from '../../compat/views/Home/Index.vue'

const runtime = vi.hoisted(() => ({ context: {} as any, push: vi.fn(), request: vi.fn() }))
vi.mock('yuheng-ui', async () => ({
  ...await import('../../src/stores/user'),
  ...await import('../../src/stores/permission'),
  ...await import('../../src/stores/dict')
}))
vi.mock('../../compat/runtime', () => ({ getPlatformContext: () => runtime.context }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: runtime.push }) }))
vi.mock('@iconify/vue', () => ({ Icon: defineComponent({ render: () => h('i') }) }))

// A real Vue renderer tests setup, watchers, reactivity and click handlers without a browser.
interface Node { type: string; text: string; props: Record<string, any>; children: Node[]; parent?: Node }
const node = (type: string, text = ''): Node => ({ type, text, props: {}, children: [] })
const renderer = createRenderer<Node, Node>({
  createElement: (type) => node(type), createText: (text) => node('text', text),
  createComment: (text) => node('comment', text), setText: (n, text) => { n.text = text },
  setElementText: (n, text) => { n.text = text; n.children = [] },
  patchProp: (n, key, _prev, value) => { n.props[key] = value },
  insert: (n, parent, anchor) => {
    if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1)
    const index = anchor ? parent.children.indexOf(anchor) : -1
    parent.children.splice(index < 0 ? parent.children.length : index, 0, n); n.parent = parent
  },
  remove: (n) => { if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1) },
  parentNode: (n) => n.parent ?? null,
  nextSibling: (n) => n.parent?.children[n.parent.children.indexOf(n) + 1] ?? null
})
const textOf = (n: Node): string => (n.type === 'comment' ? '' : n.text) + n.children.map(textOf).join(' ')
const all = (n: Node): Node[] => [n, ...n.children.flatMap(all)]
const settle = async () => { for (let i = 0; i < 6; i++) { await Promise.resolve(); await nextTick() } }
let unmount = () => {}
const mount = () => {
  const root = node('root')
  const app = renderer.createApp(Home)
  const wrapper = defineComponent({ setup: (_, { slots }) => () => h('section', [slots.header?.(), slots.default?.()]) })
  for (const name of ['ElRow', 'ElCol', 'ElCard', 'ElAvatar', 'ElTag', 'ElSkeleton', 'ElDivider', 'ElTimeline', 'ElTimelineItem']) app.component(name, wrapper)
  app.component('ElStatistic', defineComponent({ props: ['title', 'value'], setup: (props) => () => h('div', `${props.title}: ${props.value}`) }))
  for (const name of ['ElButton', 'ElLink']) app.component(name, defineComponent({ setup: (_, { slots, attrs }) => () => h('button', attrs, slots.default?.()) }))
  app.component('ElEmpty', defineComponent({ props: ['description'], setup: (props) => () => h('div', props.description) }))
  app.component('ElAlert', defineComponent({ props: ['title', 'description'], setup: (props) => () => h('div', `${props.title} ${props.description ?? ''}`) }))
  app.component('Echart', defineComponent({ props: ['options', 'height'], setup: (props) => () => h('chart', { options: props.options }) }))
  app.use(runtime.context.pinia)
  app.mount(root)
  unmount = () => app.unmount()
  return root
}

beforeEach(() => {
  runtime.push.mockReset(); runtime.request.mockReset()
  runtime.context = { pinia: createPinia(), request: { request: runtime.request } }
  const user = useUserStore(runtime.context.pinia)
  user.userInfo = { id: 7, nickname: '测试管理员', avatar: '/test-avatar.png' }; user.loaded = true
  user.permissions = ['system:notice:query']
  const permission = usePermissionStore(runtime.context.pinia)
  permission.initialized = true
  permission.addRoutes = [{ path: '/platform', name: 'Platform', component: {}, meta: { title: '平台管理' }, children: [
    { path: 'notice', name: 'ActualNotice', component: {}, meta: { title: '通知公告', permission: 'system:notice:query' } }
  ] }]
  useDictStore(runtime.context.pinia).setDictMap({ system_notice_type: [{ value: '1', label: '通知' }] })
  runtime.request.mockResolvedValue({ list: [{ id: 1, title: '平台真实公告', createTime: '2026-11-04T10:00:00' }], total: 1 })
})
afterEach(() => unmount())

describe('complete home view', () => {
  it('shows live session data, permission cards, charts and real notice API results', async () => {
    const root = mount(); await settle()
    expect(textOf(root)).toContain('Yuheng')
    expect(textOf(root)).toContain('测试管理员')
    expect(textOf(root)).toContain('授权模块: 1')
    expect(textOf(root)).toContain('可访问入口: 1')
    expect(textOf(root)).toContain('已加载字典: 1')
    expect(textOf(root)).toContain('平台真实公告')
    expect(textOf(root)).toContain('示例图表')
    expect(runtime.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'GET', url: '/system/notice/page', params: { pageNo: 1, pageSize: 5, status: 0 } }))
    const charts = all(root).filter((n) => n.type === 'chart')
    expect(charts).toHaveLength(2)
    expect(charts[0].props.options.series[0].data).toEqual([{ name: '平台管理', value: 1 }])
    const shortcut = all(root).find((n) => n.type === 'button' && textOf(n).includes('通知公告'))!
    shortcut.props.onClick(); expect(runtime.push).toHaveBeenCalledWith({ name: 'ActualNotice' })
    useUserStore(runtime.context.pinia).userInfo = { nickname: '更新后的用户' }
    useDictStore(runtime.context.pinia).setDictMap({ a: [], b: [] })
    await settle()
    expect(textOf(root)).toContain('更新后的用户')
    expect(textOf(root)).toContain('已加载字典: 2')
  })

  it('never requests notices without query permission, even if a notice menu exists', async () => {
    useUserStore(runtime.context.pinia).permissions = ['system:notice:create']
    const root = mount(); await settle()
    expect(runtime.request).not.toHaveBeenCalled()
    expect(textOf(root)).toContain('暂无通知公告查询权限')
  })

  it('shows a visible failure and supports retry instead of leaving a skeleton', async () => {
    runtime.request.mockRejectedValueOnce(new Error('network failure'))
    const root = mount(); await settle()
    expect(textOf(root)).toContain('通知公告加载失败')
    const retry = all(root).find((n) => n.type === 'button' && textOf(n).includes('重试'))!
    expect(retry).toBeDefined(); retry.props.onClick(); await settle()
    expect(textOf(root)).toContain('平台真实公告')
  })

  it('renders empty response and rejects malformed payloads as failures', async () => {
    runtime.request.mockResolvedValueOnce({ list: [], total: 0 })
    const root = mount(); await settle()
    expect(textOf(root)).toContain('暂无通知公告')
    unmount()
    runtime.request.mockResolvedValueOnce({ unexpected: true })
    const malformed = mount(); await settle()
    expect(textOf(malformed)).toContain('通知公告加载失败')
  })

  it('clears notices and ignores pending responses after permission is revoked', async () => {
    let resolve!: (data: unknown) => void
    runtime.request.mockImplementationOnce(() => new Promise((done) => { resolve = done }))
    const root = mount(); await settle()
    expect(textOf(root)).toContain('正在加载通知公告')
    useUserStore(runtime.context.pinia).permissions = []; await settle()
    resolve({ list: [{ id: 2, title: '过期权限下的公告' }], total: 1 }); await settle()
    expect(textOf(root)).toContain('暂无通知公告查询权限')
    expect(textOf(root)).not.toContain('过期权限下的公告')
  })

  it('shows explicit empty menu and dictionary states without upstream marketing data', async () => {
    usePermissionStore(runtime.context.pinia).addRoutes = []
    useDictStore(runtime.context.pinia).setDictMap({})
    const root = mount(); await settle()
    expect(textOf(root)).toContain('暂无可访问模块')
    expect(textOf(root)).toContain('暂无快捷入口')
    expect(textOf(root)).toContain('已加载字典: 0')
    for (const old of ['ruoyi-vue-pro', '20℃', '10w+', '2340', '商城中心']) expect(textOf(root)).not.toContain(old)
  })
})
