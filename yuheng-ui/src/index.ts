import type { App } from 'vue'
import type { Router } from 'vue-router'
import './styles.css'
import type {
  PlatformRouteRecord,
  RegisterPlatformRoutesOptions,
  YuhengRequest,
  YuhengRequestOptions,
  YuhengUiOptions,
  YuhengUiRuntime
} from './contracts'

export * from './contracts'
export * from './auth/token'
export * from './auth/tenant'
export * from './request'

export const platformRoutes: readonly PlatformRouteRecord[] = []

export function installYuhengUi(_app: App, _options: YuhengUiOptions): YuhengUiRuntime {
  throw new Error('installYuhengUi is not implemented')
}

export function registerPlatformRoutes(
  _router: Router,
  _options?: RegisterPlatformRoutesOptions
): void {
  throw new Error('registerPlatformRoutes is not implemented')
}
