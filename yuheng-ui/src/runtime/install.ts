import type { App } from 'vue'
import type { Router } from 'vue-router'
import type { MenuNode, PlatformRouteRecord, YuhengUiOptions, YuhengUiRuntime } from '../contracts'
import '../styles.css'
import { platformRoutes } from '../router/platform-routes'
import { createContextNavigation, registerRoutes, resolveNavigation } from '../router/guards'
import { createYuhengUiContext, YUHENG_UI_CONTEXT, type YuhengUiContext } from './options'
import { useDictStore } from '../stores/dict'
import { usePermissionStore } from '../stores/permission'
import { useUserStore } from '../stores/user'
import { setupYuhengPlugins } from '../plugins'
import { configureSystemRequest } from '../modules/system/api/request'
import { YuhengApiError } from '../request/errors'

export interface InstalledYuhengUiRuntime extends YuhengUiRuntime {
  readonly context: YuhengUiContext
  readonly disposed: boolean
}

export function installYuhengUi(
  app: App,
  options: YuhengUiOptions,
  overrides: Partial<Pick<YuhengUiContext, 'request' | 'tokenStore' | 'tenantStore' | 'pinia'>> = {}
): InstalledYuhengUiRuntime {
  const context = createYuhengUiContext(options, overrides)
  configureSystemRequest(context.request)
  setupYuhengPlugins(app, { locale: options.locale, icons: options.icons })
  const userStore = useUserStore(context.pinia)
  const dictStore = useDictStore(context.pinia)
  const permissionStore = usePermissionStore(context.pinia)
  context.initialize = async () => {
    if (context.initialized) return
    if (!context.initialization) {
      context.initialization = (async () => {
        const permissionInfo = await userStore.fetchUserInfo(context)
        await dictStore.fetchDict(context).catch(() => undefined)
        const menus = Array.isArray(permissionInfo.menus) ? permissionInfo.menus : []
        await permissionStore.generateRoutes(
          context,
          menus as MenuNode[],
          permissionInfo.permissions ?? [],
          'menus'
        )
        context.initialized = true
      })().finally(() => {
        context.initialization = undefined
      })
    }
    await context.initialization
  }
  let disposed = false
  const guardedRouters = new WeakSet<Router>()
  app.use(context.pinia)
  app.provide(YUHENG_UI_CONTEXT, context)
  const runtime: InstalledYuhengUiRuntime = {
    context,
    get disposed() {
      return disposed
    },
    install(target) {
      if (!disposed) {
        target.use(context.pinia)
        target.provide(YUHENG_UI_CONTEXT, context)
      }
    },
    registerRoutes(router: Router, routes?: readonly PlatformRouteRecord[]) {
      if (disposed) return
      registerRoutes(router, options.platformRoutes ?? platformRoutes)
      if (routes) registerRoutes(router, routes)
      if (!guardedRouters.has(router)) {
        router.beforeEach(async (to) => {
          if (disposed) return true
          let result: string
          try {
            result = await resolveNavigation(to.fullPath, createContextNavigation(context))
          } catch (error) {
            if (!(error instanceof YuhengApiError) || error.code !== 401) throw error
            context.tokenStore.removeToken()
            context.tenantStore.clearTenantContext()
            context.initialized = false
            return `${context.options.loginPath ?? '/login'}?redirect=${encodeURIComponent(to.fullPath)}`
          }
          if (context.initialized) {
            registerRoutes(router, permissionStore.getAddRoutes(), 'Home')
            const resolved = router.resolve(to.fullPath)
            if (resolved.name !== to.name || resolved.matched.length !== to.matched.length) {
              return { path: to.path, query: to.query, hash: to.hash, replace: true }
            }
          }
          return result === to.fullPath ? true : result
        })
        guardedRouters.add(router)
      }
    },
    dispose() {
      disposed = true
      context.initialized = false
    }
  }
  return runtime
}
