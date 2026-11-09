import { h } from 'vue'
import { RouterView, type Router } from 'vue-router'
import type { MenuNode, PlatformRouteRecord } from '../contracts'
import type { YuhengUiContext } from '../runtime/options'

export const DEFAULT_WHITE_LIST = [
  '/login',
  '/social-login',
  '/auth-redirect',
  '/bind',
  '/register',
  '/oauthLogin/gitee',
  '/pms/kb/document/share'
] as const

export interface NavigationContext {
  token?: string
  initialized: boolean
  initialize?: () => void | Promise<void>
  initialization?: Promise<void>
  whiteList?: readonly string[]
  loginPath?: string
}

function isWhiteListed(path: string, list: readonly string[]): boolean {
  const normalized = path.split('?')[0].replace(/\/+$/, '') || '/'
  return list.some((item) => {
    const candidate = item.replace(/\/+$/, '') || '/'
    return normalized === candidate || normalized.startsWith(`${candidate}/`)
  })
}

export async function resolveNavigation(
  path: string,
  context: NavigationContext
): Promise<string> {
  const whiteList = context.whiteList ?? DEFAULT_WHITE_LIST
  const loginPath = context.loginPath ?? '/login'
  if (isWhiteListed(path, whiteList)) {
    if (path.split('?')[0] === loginPath && context.token) return '/'
    return path
  }
  if (!context.token) return `${loginPath}?redirect=${encodeURIComponent(path)}`
  if (!context.initialized) {
    if (!context.initialization) {
      context.initialization = Promise.resolve(context.initialize?.()).then(() => {
        context.initialized = true
      })
    }
    await context.initialization
    context.initialization = undefined
  }
  return path
}

function hasPermission(permission: string | undefined, permissions: readonly string[]): boolean {
  if (!permission) return true
  return (
    permissions.includes(permission) ||
    permissions.includes('*:*:*') ||
    permissions.includes('*') ||
    permissions.some((grant) => grant.endsWith(':*') && permission.startsWith(grant.slice(0, -1)))
  )
}

export function filterMenuRoutes(
  nodes: readonly MenuNode[],
  permissions: readonly string[],
  resolveComponent?: (componentKey: string) => PlatformRouteRecord['component'] | undefined
): PlatformRouteRecord[] {
  return nodes.flatMap((node) => {
    const children = node.children ? filterMenuRoutes(node.children, permissions, resolveComponent) : []
    if (!hasPermission(node.permission, permissions) && children.length === 0) return []
    const route: PlatformRouteRecord = {
      name: node.componentName || `${node.name}-${node.id}`,
      path: node.path || `menu-${node.id}`,
      component: node.component
        ? (resolveComponent?.(node.component.split('?')[0]) ?? {
            render: () => h('div', { role: 'alert', class: 'yuheng-ui-page' }, `页面组件未注册：${node.component}`)
          })
        : { render: () => h(RouterView) },
      meta: {
        title: node.name,
        icon: node.icon,
        hidden: node.visible === false,
        noCache: node.keepAlive === false,
        dynamic: true,
        ...(node.permission ? { permission: node.permission } : {})
      },
      ...(children.length ? { children } : {})
    }
    if (children.length && !node.component) {
      const first = children.find((child) => !child.meta?.hidden) ?? children[0]
      route.redirect = { name: first.name }
    }
    return [route]
  })
}

export function registerRoutes(
  router: Router,
  routes: readonly PlatformRouteRecord[],
  parentName?: string
): void {
  for (const route of routes) {
    if (route.name !== undefined && router.hasRoute(route.name)) continue
    if (parentName && router.hasRoute(parentName)) router.addRoute(parentName, route)
    else router.addRoute(route)
  }
}

export function resetDynamicRoutes(
  router: { getRoutes: () => Array<{ name?: string | symbol }>; removeRoute: (name: string | symbol) => void }
): void {
  const keep = new Set([
    'Redirect', 'RedirectRoot', 'Login', 'Error', 'Profile', 'NoFound', 'Home', 'HomeDashboard'
  ])
  for (const route of router.getRoutes()) {
    if (route.name !== undefined && !keep.has(String(route.name))) router.removeRoute(route.name)
  }
}

export function createContextNavigation(context: YuhengUiContext): NavigationContext {
  return {
    token: context.tokenStore.getAccessToken(),
    initialized: context.initialized,
    initialize: async () => {
      if (context.initialize) await context.initialize()
      context.initialized = true
    },
    whiteList: context.options.whiteList,
    loginPath: context.options.loginPath
  }
}
