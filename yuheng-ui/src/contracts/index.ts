import type { AxiosInstance } from 'axios'
import type { App } from 'vue'
import type { RouteRecordRaw, Router } from 'vue-router'

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

export class YuhengApiError extends Error {
  readonly code: number
  readonly response?: ApiResponse

  constructor(message: string, code: number, response?: ApiResponse) {
    super(message)
    this.name = 'YuhengApiError'
    this.code = code
    this.response = response
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export interface YuhengRequestOptions
  extends Pick<YuhengUiOptions, 'apiBaseUrl' | 'requestTimeout' | 'onUnauthorized' | 'onApiError'> {}

export type YuhengRequest = AxiosInstance

export interface RegisterPlatformRoutesOptions {
  routes?: readonly PlatformRouteRecord[]
}

export interface YuhengUiRuntime {
  install(app: App): void
  registerRoutes(router: Router): void
  dispose(): void
}
