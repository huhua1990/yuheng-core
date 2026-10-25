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

export const platformRoutes: readonly PlatformRouteRecord[] = []

export function createYuhengRequest(_options: YuhengRequestOptions): YuhengRequest {
  throw new Error('createYuhengRequest is not implemented')
}

export function installYuhengUi(_app: App, _options: YuhengUiOptions): YuhengUiRuntime {
  throw new Error('installYuhengUi is not implemented')
}

export function registerPlatformRoutes(
  _router: Router,
  _options?: RegisterPlatformRoutesOptions
): void {
  throw new Error('registerPlatformRoutes is not implemented')
}
