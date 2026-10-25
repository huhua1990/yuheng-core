import axios, {
  type AxiosAdapter,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'
import qs from 'qs'
import type { ApiResponse, UnauthorizedReason, YuhengRequest, YuhengRequestOptions } from '../contracts'
import { createDefaultTenantStore, type TenantContext, type TenantStore } from '../auth/tenant'
import { createDefaultTokenStore, type TokenPair, type TokenSnapshot, type TokenStore } from '../auth/token'
import { YuhengApiError } from './errors'

type RetryConfig = InternalAxiosRequestConfig & { __yuhengRetried?: boolean; __yuhengOriginal?: boolean }
class RefreshFailure extends Error {
  constructor(
    readonly reason: UnauthorizedReason,
    readonly response?: ApiResponse
  ) {
    super('Refresh failed')
    this.name = 'RefreshFailure'
  }
}

function isEnvelope(value: unknown): value is ApiResponse {
  return Boolean(value && typeof value === 'object' && 'code' in value && 'data' in value)
}

function headerValue(config: AxiosRequestConfig, name: string): string | undefined {
  const headers = config.headers
  if (!headers) return undefined
  const value = headers[name] ?? headers[name.toLowerCase()]
  return typeof value === 'string' ? value : undefined
}

function isRefreshTokenMessage(message?: string): boolean {
  return message === '无效的刷新令牌' || message === '刷新令牌已过期'
}

function isAuthFreeEndpoint(url: string): boolean {
  const path = url.split('?')[0].replace(/\/+$/, '')
  const endpoint = path.split('/').pop()
  return endpoint === 'login' || endpoint === 'refresh-token'
}

async function decodeJsonBody(response: AxiosResponse): Promise<unknown> {
  if (isEnvelope(response.data)) return response.data
  const headers = response.headers as {
    get?: (name: string) => unknown
    [key: string]: unknown
  }
  const contentType = String(
    (typeof headers?.get === 'function' ? headers.get('content-type') : undefined) ??
      headers?.['content-type'] ??
      headers?.['Content-Type'] ??
      ''
  ).toLowerCase()
  if (!contentType.includes('json')) return response.data
  let text: string | undefined
  if (typeof response.data === 'string') text = response.data
  else if (response.data instanceof ArrayBuffer) text = new TextDecoder().decode(response.data)
  else if (response.data instanceof Uint8Array) text = new TextDecoder().decode(response.data)
  else if (typeof Blob !== 'undefined' && response.data instanceof Blob) text = await response.data.text()
  if (!text) return response.data
  try {
    return JSON.parse(text)
  } catch {
    return response.data
  }
}

function asApiError(response: ApiResponse, fallbackCode = response.code): YuhengApiError {
  return new YuhengApiError(response.msg || `Yuheng API error (${fallbackCode})`, response.code, response)
}

export function createYuhengRequest(options: YuhengRequestOptions): YuhengRequest {
  const tokenStore: TokenStore = options.tokenStore ?? createDefaultTokenStore()
  const tenantStore: TenantStore = options.tenantStore ?? createDefaultTenantStore()
  const instance: AxiosInstance = axios.create({
    baseURL: options.apiBaseUrl,
    timeout: options.requestTimeout ?? 30000,
    withCredentials: false,
    paramsSerializer: { serialize: (params) => qs.stringify(params, { allowDots: true }) },
    adapter: options.adapter
  })

  let refreshPromise: Promise<TokenPair> | undefined

  const getTenantContext = (): TenantContext => {
    const context = tenantStore.getTenantContext()
    if (context.tenantId || context.visitTenantId) return context
    const snapshot = (tokenStore as TokenStore & { getSnapshot?: () => TokenSnapshot }).getSnapshot?.()
    return { tenantId: snapshot?.tenantId, visitTenantId: snapshot?.visitTenantId }
  }

  const clearSession = (reason: UnauthorizedReason): void => {
    tokenStore.removeToken()
    tenantStore.clearTenantContext()
    options.onUnauthorized?.(reason)
  }

  const refreshAccessToken = (): Promise<TokenPair> => {
    if (refreshPromise) return refreshPromise
    const refreshToken = tokenStore.getRefreshToken()
    if (!refreshToken) {
      refreshPromise = Promise.reject<TokenPair>(new YuhengApiError('Missing refresh token', 401))
        .catch((error: unknown) => {
          clearSession('missing-token')
          throw error
        })
        .finally(() => {
          refreshPromise = undefined
        })
      return refreshPromise
    }
    if (!options.refreshToken) {
      refreshPromise = Promise.reject<TokenPair>(new YuhengApiError('Refresh failed', 401))
        .catch((error: unknown) => {
          clearSession('refresh-failed')
          throw error
        })
        .finally(() => {
          refreshPromise = undefined
        })
      return refreshPromise
    }

    refreshPromise = Promise.resolve()
      .then(() => options.refreshToken?.())
      .then((result) => {
        if (!result || (result.code !== 0 && result.code !== 200) || !result.data?.accessToken) {
          const reason = isRefreshTokenMessage(result?.msg) ? 'session-expired' : 'refresh-failed'
          throw new RefreshFailure(reason, result)
        }
        tokenStore.setToken(result.data)
        return result.data
      })
      .catch((error: unknown) => {
        if (error instanceof RefreshFailure) {
          clearSession(error.reason)
          throw asApiError(error.response ?? { code: 401, data: null, msg: 'Refresh failed' })
        }
        const reason =
          error instanceof YuhengApiError && isRefreshTokenMessage(error.response?.msg)
            ? 'session-expired'
            : 'refresh-failed'
        clearSession(reason)
        if (error instanceof YuhengApiError) throw error
        throw new YuhengApiError('Refresh failed', 401)
      })
      .finally(() => {
        refreshPromise = undefined
      })
    return refreshPromise
  }

  const reportApiError = (error: YuhengApiError): never => {
    if (!isRefreshTokenMessage(error.response?.msg)) options.onApiError?.(error)
    throw error
  }

  const processResponse = async (response: AxiosResponse, originalError?: unknown): Promise<AxiosResponse> => {
    response.data = await decodeJsonBody(response)
    const body = response.data
    const config = response.config as RetryConfig
    const code = response.status === 401 ? 401 : isEnvelope(body) ? body.code : response.status
    if (code === 401 && isAuthFreeEndpoint(config.url ?? '')) {
      if (isEnvelope(body)) {
        throw new YuhengApiError(body.msg || 'Unauthorized', 401, body)
      }
      throw new YuhengApiError(response.statusText || 'Unauthorized', 401)
    }
    if (code === 401 && !config.__yuhengRetried) {
      try {
        await refreshAccessToken()
      } catch (error) {
        throw error
      }
      config.__yuhengRetried = true
      return instance.request(config)
    }
    if (isEnvelope(body) && body.code !== 0 && body.code !== 200) return reportApiError(asApiError(body))
    if (response.status >= 400) {
      const apiError = isEnvelope(body)
        ? new YuhengApiError(body.msg || response.statusText || `HTTP ${response.status}`, response.status, body)
        : new YuhengApiError(response.statusText || `HTTP ${response.status}`, response.status)
      return reportApiError(apiError)
    }
    void originalError
    return response
  }

  instance.interceptors.request.use((config) => {
    const url = config.url ?? ''
    const headers = config.headers
    if (!isAuthFreeEndpoint(url)) {
      const accessToken = tokenStore.getAccessToken()
      if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
    }
    if (options.tenantEnabled) {
      const context = getTenantContext()
      if (context.tenantId) headers.set('tenant-id', context.tenantId)
      if (context.visitTenantId && tokenStore.getAccessToken()) {
        headers.set('visit-tenant-id', context.visitTenantId)
      }
    }
    if (config.method?.toLowerCase() === 'get') {
      headers.set('Cache-Control', 'no-cache')
      headers.set('Pragma', 'no-cache')
    }
    const contentType = headerValue(config, 'Content-Type') ?? headerValue(config, 'content-type')
    if (
      config.method?.toLowerCase() === 'post' &&
      contentType?.toLowerCase().includes('application/x-www-form-urlencoded')
    ) {
      config.data = qs.stringify(config.data ?? {})
    }
    return config
  })

  instance.interceptors.response.use(
    (response) => processResponse(response),
    async (error: unknown) => {
      const response = axios.isAxiosError(error) ? error.response : undefined
      if (response) return processResponse(response, error)
      throw error
    }
  )

  const send = async <T>(config: AxiosRequestConfig): Promise<T> => {
    const response = await instance.request<ApiResponse<T> | T>(config)
    return isEnvelope(response.data) ? (response.data.data as T) : (response.data as T)
  }

  const request: YuhengRequest = {
    request: <T = unknown>(config: AxiosRequestConfig) => send<T>(config),
    get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
      send<T>({ ...config, method: 'get', url }),
    post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
      send<T>({ ...config, method: 'post', url, data }),
    put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
      send<T>({ ...config, method: 'put', url, data }),
    delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
      send<T>({ ...config, method: 'delete', url }),
    upload: <T = unknown>(url: string, data: unknown, config?: AxiosRequestConfig) =>
      send<T>({
        ...config,
        method: 'post',
        url,
        data,
        headers: { ...config?.headers, 'Content-Type': 'multipart/form-data' }
      }),
    download: async <T = Blob | ArrayBuffer>(url: string, config?: AxiosRequestConfig) => {
      const response = await instance.request<ApiResponse<T> | T>({
        ...config,
        method: 'get',
        url,
        responseType: config?.responseType ?? 'arraybuffer'
      })
      if (isEnvelope(response.data)) return response.data.data as T
      return response.data as T
    },
    postOriginal: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
      instance.request<ApiResponse<T>>({ ...config, method: 'post', url, data })
  }
  return request
}
