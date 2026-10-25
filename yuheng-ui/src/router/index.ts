import type { Router, RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import type { PlatformRouteRecord } from '../contracts'
import { platformRoutes } from './platform-routes'
import { registerRoutes, resetDynamicRoutes } from './guards'

export interface YuhengRouterOptions {
  basePath?: string
  routes?: readonly RouteRecordRaw[]
  router?: Router
}

export interface YuhengRouterRuntime {
  router: Router
  registerRoutes(router: Router, routes?: readonly PlatformRouteRecord[]): void
  resetRoutes(router?: Router): void
  dispose(): void
}

export function createYuhengRouter(options: YuhengRouterOptions = {}): YuhengRouterRuntime {
  const router =
    options.router ??
    createRouter({
      history: createWebHistory(options.basePath ?? '/'),
      strict: true,
      scrollBehavior: () => ({ top: 0 }),
      routes: [...platformRoutes, ...(options.routes ?? [])]
    })
  let recoveringImport = false
  router.onError((error, to) => {
    if (
      !recoveringImport &&
      /failed to fetch dynamically imported module|importing a module script failed|chunk load/i.test(
        String(error)
      )
    ) {
      recoveringImport = true
      void router.replace(to.fullPath).finally(() => {
        recoveringImport = false
      })
    }
  })
  const register = (target: Router, routes: readonly PlatformRouteRecord[] = platformRoutes) => {
    registerRoutes(target, routes)
  }
  const dispose = (): void => {
    router.removeRoute
  }
  return {
    router,
    registerRoutes: (target, routes = platformRoutes) => register(target, routes),
    resetRoutes: (target = router) => resetDynamicRoutes(target),
    dispose
  }
}

export { platformRoutes }
export { filterMenuRoutes, resolveNavigation, resetDynamicRoutes } from './guards'
