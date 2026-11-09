import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { platformRoutes } from '../../src/router/platform-routes'

const loginSource = readFileSync(new URL('../../src/pages/Login/Login.vue', import.meta.url), 'utf8')
const homeSource = readFileSync(new URL('../../src/pages/Home/Home.vue', import.meta.url), 'utf8')
const layoutSource = readFileSync(new URL('../../src/layout/Layout.vue', import.meta.url), 'utf8')

describe('migrated platform pages', () => {
  it('uses the dashboard as the root shell page', () => {
    const shell = platformRoutes.find((route) => route.name === 'Home')
    expect(shell?.children?.some((route) => route.name === 'HomeDashboard' && route.path === '')).toBe(true)
  })

  it('supports tenant selection, remembered username, authentication and permission menus', () => {
    expect(loginSource).toContain('/system/tenant/get-id-by-name')
    expect(loginSource).toContain('/system/tenant/get-by-website')
    expect(loginSource).toContain('YUHENG_REMEMBERED_USERNAME')
    expect(loginSource).toContain('fetchUserInfo(context)')
    expect(loginSource).toContain('generateRoutes(context')
    expect(loginSource).toContain('其他登录方式')
  })

  it('provides a workbench with statistics, charts, notices and platform shortcuts', () => {
    for (const label of ['项目数', '项目访问', '待办', '项目', '通知公告', '快捷入口']) {
      expect(homeSource).toContain(label)
    }
    expect(homeSource).toContain('echarts.init')
    expect(homeSource).toContain('/system/user')
    expect(homeSource).toContain('/infra/config')
  })

  it('provides a platform shell with collapsible navigation and user actions', () => {
    expect(layoutSource).toContain('yuheng-ui-shell__sidebar')
    expect(layoutSource).toContain('toggleCollapsed()')
    expect(layoutSource).toContain('个人中心')
    expect(layoutSource).toContain('退出登录')
  })
})
