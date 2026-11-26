import { describe, expect, it } from 'vitest'
import type { PlatformRouteRecord } from '../../src/contracts'
import { buildHomeModules, hasHomePermission, formatNoticeDate } from '../../compat/views/Home/types'

const page = (path: string, name?: string, extra: Record<string, unknown> = {}): PlatformRouteRecord =>
  ({ path, name, component: {}, ...extra }) as PlatformRouteRecord

describe('complete home platform data', () => {
  it('preserves exact route names and joins relative paths at every nesting level', () => {
    const routes = [page('/platform', 'Root', { meta: { title: '平台管理' }, children: [
      page('system', 'System', { children: [page('users', 'ActualUserRoute')] }),
      page('/absolute', 'ActualAbsoluteRoute'),
      page('settings')
    ] })]
    const [module] = buildHomeModules(routes, [])
    expect(module.title).toBe('平台管理')
    expect(module.entries.map((entry) => [entry.path, entry.to])).toEqual([
      ['/platform/system/users', { name: 'ActualUserRoute' }],
      ['/absolute', { name: 'ActualAbsoluteRoute' }],
      ['/platform/settings', { path: '/platform/settings' }]
    ])
  })

  it('omits hidden branches, denied leaves, external links, redirects and parameter-only targets', () => {
    const routes = [page('/system', 'System', { children: [
      page('visible', 'Visible'),
      page('hidden', 'Hidden', { meta: { hidden: true }, children: [page('child', 'HiddenChild')] }),
      page('denied', 'Denied', { meta: { permission: 'system:user:query' } }),
      page('https://example.com', 'External'),
      page('//example.com', 'ProtocolRelative'),
      page(':id', 'Detail'),
      page('redirect', 'Redirect', { redirect: 'visible' })
    ] })]
    expect(buildHomeModules(routes, [])[0].entries.map((entry) => entry.title)).toEqual(['Visible'])
  })

  it('keeps accessible descendants under generated menu groups with a default redirect', () => {
    const routes = [page('/system', 'System', {
      redirect: { name: 'UserList' },
      meta: { title: '系统管理', dynamic: true },
      children: [page('user', 'UserGroup', {
        redirect: { name: 'UserList' },
        children: [page('list', 'UserList', { meta: { title: '用户管理' } })]
      })]
    })]

    expect(buildHomeModules(routes, []).flatMap((module) => module.entries.map((entry) => entry.title)))
      .toEqual(['用户管理'])
  })

  it('groups shortcut entries by their own top-level menu', () => {
    const routes = [
      page('/system', 'System', { meta: { title: '系统管理' }, children: [
        page('user', 'UserGroup', { redirect: { name: 'UserList' }, children: [
          page('list', 'UserList', { meta: { title: '用户管理' } })
        ] })
      ] }),
      page('/infra', 'Infra', { meta: { title: '基础设施' }, children: [
        page('codegen', 'Codegen', { meta: { title: '代码生成' } })
      ] }),
      page('/erp', 'Erp', { meta: { title: 'ERP 系统' }, children: [
        page('product', 'Product', { meta: { title: '产品信息' } })
      ] })
    ]

    expect(buildHomeModules(routes, []).map((module) => [
      module.title,
      module.entries.map((entry) => entry.title)
    ])).toEqual([
      ['系统管理', ['用户管理']],
      ['基础设施', ['代码生成']],
      ['ERP 系统', ['产品信息']]
    ])
  })

  it('keeps an authorized child under a directory with a different permission', () => {
    const routes = [page('/system', 'System', { meta: { permission: 'directory:query' }, children: [
      page('user', 'User', { meta: { permission: 'system:user:query' } })
    ] })]
    expect(buildHomeModules(routes, ['system:user:query'])[0].entries[0].path).toBe('/system/user')
  })

  it('deduplicates entries and drops groups with no accessible pages', () => {
    expect(buildHomeModules([page('/a', 'A'), page('/a', 'A'),
      page('/empty', 'Empty', { children: [page('hidden', 'Hidden', { meta: { hidden: true } })] })
    ], []).map((module) => module.entries.length)).toEqual([1])
  })

  it.each(['system:notice:query', 'system:*', '*:*:*', '*'])('recognizes notice query grant %s', (grant) => {
    expect(hasHomePermission([grant], 'system:notice:query')).toBe(true)
  })

  it('does not treat notice create/update grants as query grants', () => {
    expect(hasHomePermission(['system:notice:create', 'system:notice:update'], 'system:notice:query')).toBe(false)
  })

  it('does not invent a date when a notice timestamp is absent or invalid', () => {
    expect(formatNoticeDate(undefined)).toBe('未提供发布时间')
    expect(formatNoticeDate('invalid')).toBe('未提供发布时间')
    expect(formatNoticeDate('2026-11-04T10:20:00')).toBe('2026-11-04')
  })
})
