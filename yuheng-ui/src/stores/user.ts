import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { YuhengUiContext } from '../runtime/options'

export interface UserInfo {
  [key: string]: unknown
}

interface PermissionInfo {
  user?: UserInfo
  permissions?: string[]
  roles?: string[]
  menus?: unknown[]
}

export const useUserStore = defineStore('yuheng-user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const permissions = ref<string[]>([])
  const roles = ref<string[]>([])
  const loaded = ref(false)

  const fetchUserInfo = async (context: YuhengUiContext): Promise<PermissionInfo> => {
    const result = await context.request.get<PermissionInfo>('/system/auth/get-permission-info')
    userInfo.value = (result.user ?? result) as UserInfo
    permissions.value = [...(result.permissions ?? [])]
    roles.value = [...(result.roles ?? [])]
    loaded.value = true
    return result
  }

  const login = async <T extends Record<string, unknown>>(
    context: YuhengUiContext,
    credentials: T
  ): Promise<unknown> => {
    const result = await context.request.post<{ accessToken?: string; refreshToken?: string }>(
      '/system/auth/login',
      credentials
    )
    if (result?.accessToken) context.tokenStore.setToken(result)
    loaded.value = false
    return result
  }

  const logout = async (context: YuhengUiContext): Promise<void> => {
    try {
      await context.request.post('/system/auth/logout')
    } finally {
      context.tokenStore.removeToken()
      context.tenantStore.clearTenantContext()
      userInfo.value = null
      permissions.value = []
      roles.value = []
      loaded.value = false
    }
  }

  const isSetUser = (): boolean => loaded.value && userInfo.value !== null

  return {
    userInfo,
    permissions,
    roles,
    loaded,
    fetchUserInfo,
    login,
    logout,
    isSetUser
  }
})
