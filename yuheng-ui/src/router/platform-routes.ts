import type { PlatformRouteRecord } from '../contracts'
import { Error404 } from '../pages/Error'
import { HomePage } from '../pages/Home'
import { LoginPage } from '../pages/Login'
import { ProfilePage } from '../pages/Profile'
import { RedirectPage } from '../pages/Redirect'
import { YuhengShell } from '../layout'
import { infraRoutes } from '../modules/infra/routes'
import { systemRoutes } from '../modules/system/routes'

export const platformRoutes: readonly PlatformRouteRecord[] = [
  { path: '/login', name: 'Login', component: LoginPage, meta: { public: true, title: '登录' } },
  { path: '/error', name: 'Error', component: Error404, meta: { title: '错误' } },
  { path: '/redirect/:path(.*)', name: 'Redirect', component: RedirectPage, meta: { public: true, title: '跳转中' } },
  {
    path: '/',
    name: 'Home',
    component: YuhengShell,
    meta: { title: '首页' },
    children: [
      { path: '', name: 'HomeDashboard', component: HomePage, meta: { title: '首页' } },
      { path: '/profile', name: 'Profile', component: ProfilePage, meta: { title: '个人中心' } }
    ]
  }
]

function flattenRoutes(routes: readonly PlatformRouteRecord[]): PlatformRouteRecord[] {
  return routes.flatMap((route) => [route, ...flattenRoutes(route.children ?? [])])
}

export function resolveMenuComponent(componentKey: string): PlatformRouteRecord['component'] | undefined {
  const normalized = componentKey.replace(/^\/+|\/+$/g, '').replace(/\.vue$/i, '').toLowerCase()
  return flattenRoutes([...platformRoutes, ...systemRoutes, ...infraRoutes]).find((route) => {
    const name = String(route.name ?? '').toLowerCase()
    const path = String(route.path ?? '').replace(/^\/+|\/+$/g, '').toLowerCase()
    return name === normalized || path === normalized || `${path}/index` === normalized
  })?.component
}

export const fallbackRoutes: readonly PlatformRouteRecord[] = [
  { path: '/redirect', name: 'RedirectRoot', component: RedirectPage, meta: { public: true } },
  { path: '/:pathMatch(.*)*', name: 'NoFound', component: Error404 }
]
