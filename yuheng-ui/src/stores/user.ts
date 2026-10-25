import { defineStore } from 'pinia'
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
  let userInfo: UserInfo | null = null
  let permissions: string[] = []
  let roles: string[] = []
  let loaded = false

  const fetchUserInfo = async (context: YuhengUiContext): Promise<PermissionInfo> => {
    const result = await context.request.get<PermissionInfo>('/system/auth/get-permission-info')
    userInfo = (result.user ?? result) as UserInfo
    permissions = [...(result.permissions ?? [])]
    roles = [...(result.roles ?? [])]
    loaded = true
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
    loaded = false
    return result
  }

  const logout = async (context: YuhengUiContext): Promise<void> => {
    try {
      await context.request.post('/system/auth/logout')
    } finally {
      context.tokenStore.removeToken()
      context.tenantStore.clearTenantContext()
      userInfo = null
      permissions = []
      roles = []
      loaded = false
    }
  }

  const isSetUser = (): boolean => loaded && userInfo !== null

  return {
    get userInfo() {
      return userInfo
    },
    get permissions() {
      return permissions
    },
    get roles() {
      return roles
    },
    get loaded() {
      return loaded
    },
    fetchUserInfo,
    login,
    logout,
    isSetUser
  }
})
