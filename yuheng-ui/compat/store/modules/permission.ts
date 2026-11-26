import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'
import type { NavigationRoute } from '../../types/router'
import { getPlatformContext } from '../../runtime'
import { usePermissionStore as usePlatformPermissionStore } from 'yuheng-ui'

interface NavigationPresentationState {
  menuTabRouters: NavigationRoute[]
  menuRootPath: string
}

function toNavigationRoute(route: RouteRecordRaw, parentPath = ''): NavigationRoute {
  const { name, meta, children, ...record } = route
  const fullPath = route.path.startsWith('/')
    ? route.path
    : `${parentPath.replace(/\/$/, '')}/${route.path}`
  return {
    ...record,
    name: name === undefined ? `navigation:${fullPath}` : String(name),
    meta: { ...meta },
    ...(children ? { children: children.map((child) => toNavigationRoute(child, fullPath)) } : {})
  }
}

export const usePermissionStore = defineStore('yuheng-navigation-presentation', {
  state: (): NavigationPresentationState => ({
    menuTabRouters: [],
    menuRootPath: ''
  }),
  getters: {
    getRouters: (): NavigationRoute[] => [
      {
        path: '/',
        name: 'Home',
        redirect: '/index',
        meta: { title: '首页' },
        children: [
          {
            path: '/index',
            name: 'HomeDashboard',
            meta: { title: '首页', icon: 'ep:home-filled', affix: true }
          }
        ]
      },
      ...usePlatformPermissionStore(getPlatformContext().pinia).getAddRoutes()
        .map((route) => toNavigationRoute(route))
    ],
    getAddRouters: (): NavigationRoute[] =>
      usePlatformPermissionStore(getPlatformContext().pinia).getAddRoutes()
        .map((route) => toNavigationRoute(route)),
    getMenuTabRouters: (state) => state.menuTabRouters,
    getMenuRootPath: (state) => state.menuRootPath
  },
  actions: {
    async generateRoutes() {
      await getPlatformContext().initialize?.()
    },
    setMenuTabRouters(routes: NavigationRoute[]) {
      this.menuTabRouters = routes
    },
    setMenuRootPath(path: string) {
      this.menuRootPath = path
    }
  }
})

export const usePermissionStoreWithOut = () => usePermissionStore(getPlatformContext().pinia)
