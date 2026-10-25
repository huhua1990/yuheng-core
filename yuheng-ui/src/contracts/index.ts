import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { App } from 'vue'
import type { RouteRecordRaw, Router } from 'vue-router'
import type { TenantStore } from '../auth/tenant'
import type { TokenPair, TokenStore } from '../auth/token'
import { YuhengApiError } from '../request/errors'

export type { TenantContext, TenantStore } from '../auth/tenant'
export type { TokenPair, TokenSnapshot, TokenStore } from '../auth/token'
export { YuhengApiError } from '../request/errors'

export interface YuhengUiOptions {
  apiBaseUrl: string
  appTitle?: string
  basePath?: string
  tenantEnabled?: boolean
  loginPath?: string
  whiteList?: string[]
  requestTimeout?: number
  platformRoutes?: PlatformRouteRecord[]
  onUnauthorized?: (reason: UnauthorizedReason) => void
  onApiError?: (error: YuhengApiError) => void
}

export type PlatformRouteRecord = RouteRecordRaw & {
  meta?: RouteRecordRaw['meta'] & {
    permission?: string | string[]
  }
}

export interface MenuNode {
  id: string | number
  parentId?: string | number | null
  name: string
  path?: string
  component?: string
  permission?: string
  children?: MenuNode[]
}

export interface ApiResponse<T = unknown> {
  code: number
  data: T
  msg?: string
}

export type UnauthorizedReason = 'missing-token' | 'refresh-failed' | 'session-expired'

export interface YuhengRequestOptions
  extends Pick<YuhengUiOptions, 'apiBaseUrl' | 'requestTimeout' | 'onUnauthorized' | 'onApiError'> {
  tenantEnabled?: boolean
  tokenStore?: TokenStore
  tenantStore?: TenantStore
  adapter?: AxiosAdapter
  refreshToken?: () => Promise<ApiResponse<TokenPair>>
}

export interface YuhengRequest {
  request<T = unknown>(config: AxiosRequestConfig): Promise<T>
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  upload<T = unknown>(url: string, data: unknown, config?: AxiosRequestConfig): Promise<T>
  download<T = Blob | ArrayBuffer>(url: string, config?: AxiosRequestConfig): Promise<T>
  postOriginal<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>>
}

export interface RegisterPlatformRoutesOptions {
  routes?: readonly PlatformRouteRecord[]
}

export interface YuhengUiRuntime {
  install(app: App): void
  registerRoutes(router: Router): void
  dispose(): void
}
