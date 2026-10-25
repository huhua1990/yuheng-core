import type { PlatformRouteRecord } from '../contracts'
import { Error404 } from '../pages/Error'
import { LoginPage } from '../pages/Login'
import { ProfilePage } from '../pages/Profile'
import { RedirectPage } from '../pages/Redirect'
import { YuhengShell } from '../layout'
import { systemRoutes } from '../modules/system/routes'

export const platformRoutes: readonly PlatformRouteRecord[] = [
  { path: '/login', name: 'Login', component: LoginPage, meta: { public: true, title: '登录' } },
  { path: '/error', name: 'Error', component: Error404, meta: { title: '错误' } },
  { path: '/redirect/:path(.*)', name: 'Redirect', component: RedirectPage, meta: { public: true, title: '跳转中' } },
  { path: '/profile', name: 'Profile', component: ProfilePage, meta: { title: '个人中心' } },
  { path: '/', name: 'Home', component: YuhengShell, meta: { title: '首页' } },
  ...systemRoutes
]

export const fallbackRoutes: readonly PlatformRouteRecord[] = [
  { path: '/redirect', name: 'RedirectRoot', component: RedirectPage, meta: { public: true } },
  { path: '/:pathMatch(.*)*', name: 'NoFound', component: Error404 }
]
