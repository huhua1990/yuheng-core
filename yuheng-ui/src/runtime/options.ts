import type { Pinia } from 'pinia'
import type { YuhengUiOptions, YuhengRequest } from '../contracts'
import { createDefaultTenantStore, type TenantStore } from '../auth/tenant'
import { createDefaultTokenStore, type TokenStore } from '../auth/token'
import { createYuhengRequest } from '../request'
import { createPinia } from 'pinia'

export interface YuhengUiContext {
  options: YuhengUiOptions
  request: YuhengRequest
  tokenStore: TokenStore
  tenantStore: TenantStore
  pinia: Pinia
  initialized: boolean
  initialize?: () => void | Promise<void>
  initialization?: Promise<void>
}

export function createYuhengUiContext(
  options: YuhengUiOptions,
  overrides: Partial<Pick<YuhengUiContext, 'request' | 'tokenStore' | 'tenantStore' | 'pinia'>> = {}
): YuhengUiContext {
  const tokenStore = overrides.tokenStore ?? options.tokenStore ?? createDefaultTokenStore()
  const tenantStore = overrides.tenantStore ?? options.tenantStore ?? createDefaultTenantStore()
  return {
    options,
    request:
      overrides.request ??
      options.request ??
      createYuhengRequest({
        apiBaseUrl: options.apiBaseUrl ?? '',
        requestTimeout: options.requestTimeout,
        tenantEnabled: options.tenantEnabled,
        onUnauthorized: options.onUnauthorized,
        onApiError: options.onApiError,
        tokenStore,
        tenantStore
      }),
    tokenStore,
    tenantStore,
    pinia: overrides.pinia ?? options.pinia ?? createPinia(),
    initialized: false
  }
}

export const YUHENG_UI_CONTEXT = Symbol('yuheng-ui-context')
