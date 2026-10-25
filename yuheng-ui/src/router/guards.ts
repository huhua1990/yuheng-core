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
  permissions: readonly string[]
): PlatformRouteRecord[] {
  return nodes.flatMap((node) => {
    const children = node.children ? filterMenuRoutes(node.children, permissions) : []
    if (!hasPermission(node.permission, permissions) && children.length === 0) return []
    const route: PlatformRouteRecord = {
      name: node.name,
      path: node.path ?? `/${String(node.name).replace(/\s+/g, '-').toLowerCase()}`,
      component:
        node.component && typeof node.component !== 'string'
          ? (node.component as never)
          : { render: () => null },
      meta: node.permission ? { permission: node.permission } : undefined,
      ...(children.length ? { children } : {})
    }
    return [route]
  })
}

export function registerRoutes(
  router: { addRoute: (route: PlatformRouteRecord) => unknown; hasRoute: (name: string) => boolean },
  routes: readonly PlatformRouteRecord[]
): void {
  for (const route of routes) {
    if (route.name !== undefined && router.hasRoute(String(route.name))) continue
    router.addRoute(route)
  }
}

export function resetDynamicRoutes(
  router: { getRoutes: () => Array<{ name?: string | symbol }>; removeRoute: (name: string | symbol) => void }
): void {
  const keep = new Set(['Redirect', 'RedirectRoot', 'Login', 'Error', 'NoFound', 'Home'])
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
