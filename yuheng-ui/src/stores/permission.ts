import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import type { PlatformRouteRecord, MenuNode } from '../contracts'
import type { YuhengUiContext } from '../runtime/options'
import { filterMenuRoutes } from '../router/guards'

export interface PermissionStoreSetup {
  addRoutes: Ref<PlatformRouteRecord[]>
  initialized: Ref<boolean>
  generateRoutes(
    context: YuhengUiContext,
    permissionsOrMenus?: string[] | MenuNode[],
    menuPermissions?: string[]
  ): Promise<PlatformRouteRecord[]>
  getAddRoutes(): PlatformRouteRecord[]
  resetRoutes(): void
}

export const usePermissionStore = defineStore(
  'yuheng-permission',
  (): PermissionStoreSetup => {
    const addRoutes = ref<PlatformRouteRecord[]>([])
    const initialized = ref(false)

    const generateRoutes = async (
      context: YuhengUiContext,
      permissionsOrMenus: string[] | MenuNode[] = [],
      menuPermissions: string[] = []
    ): Promise<PlatformRouteRecord[]> => {
      const directMenus =
        permissionsOrMenus.length > 0 && typeof permissionsOrMenus[0] === 'object'
          ? (permissionsOrMenus as MenuNode[])
          : undefined
      const permissions = directMenus ? menuPermissions : (permissionsOrMenus as string[])
      if (directMenus) {
        addRoutes.value = filterMenuRoutes(directMenus, permissions)
      } else {
        const response = await context.request.get<{ menus?: MenuNode[] } | MenuNode[]>(
          '/system/auth/get-permission-info'
        )
        const fetchedMenus = Array.isArray(response) ? response : response.menus ?? []
        addRoutes.value = filterMenuRoutes(fetchedMenus, permissions)
      }
      initialized.value = true
      return addRoutes.value
    }

    const getAddRoutes = (): PlatformRouteRecord[] => [...addRoutes.value]
    const resetRoutes = (): void => {
      addRoutes.value = []
      initialized.value = false
    }

    return {
      addRoutes,
      initialized,
      generateRoutes,
      getAddRoutes,
      resetRoutes
    }
  }
)
