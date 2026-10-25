import { defineStore } from 'pinia'
import type { PlatformRouteRecord, MenuNode } from '../contracts'
import type { YuhengUiContext } from '../runtime/options'
import { filterMenuRoutes } from '../router/guards'

export const usePermissionStore = defineStore('yuheng-permission', () => {
  let addRoutes: PlatformRouteRecord[] = []
  let initialized = false

  const generateRoutes = async (
    context: YuhengUiContext,
    permissionsOrMenus: string[] | MenuNode[] = [],
    menuPermissions: string[] = []
  ): Promise<PlatformRouteRecord[]> => {
    const directMenus =
      permissionsOrMenus.length > 0 &&
      typeof permissionsOrMenus[0] === 'object'
        ? (permissionsOrMenus as MenuNode[])
        : undefined
    const permissions = directMenus ? menuPermissions : (permissionsOrMenus as string[])
    if (directMenus) {
      addRoutes = filterMenuRoutes(directMenus, permissions)
    } else {
      const response = await context.request.get<{ menus?: MenuNode[] } | MenuNode[]>(
        '/system/auth/get-permission-info'
      )
      const fetchedMenus = Array.isArray(response) ? response : response.menus ?? []
      addRoutes = filterMenuRoutes(fetchedMenus, permissions)
    }
    initialized = true
    return addRoutes
  }

  const getAddRoutes = (): PlatformRouteRecord[] => [...addRoutes]
  const resetRoutes = (): void => {
    addRoutes = []
    initialized = false
  }

  return {
    get addRoutes() {
      return addRoutes
    },
    get initialized() {
      return initialized
    },
    generateRoutes,
    getAddRoutes,
    resetRoutes
  }
})
