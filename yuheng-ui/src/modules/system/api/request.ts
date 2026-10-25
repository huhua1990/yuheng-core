import type { YuhengRequest } from '../../../contracts'

export interface SystemRequestConfig {
  url: string
  data?: unknown
  params?: unknown
  [key: string]: unknown
}

export interface SystemRequest {
  get<T = unknown>(config: SystemRequestConfig): Promise<T>
  post<T = unknown>(config: SystemRequestConfig): Promise<T>
  put<T = unknown>(config: SystemRequestConfig): Promise<T>
  delete<T = unknown>(config: SystemRequestConfig): Promise<T>
  upload<T = unknown>(config: SystemRequestConfig): Promise<T>
  download<T = Blob | ArrayBuffer>(config: SystemRequestConfig): Promise<T>
}

let configuredRequest: YuhengRequest | undefined

export function configureSystemRequest(request: YuhengRequest): void {
  configuredRequest = request
}

function getRequest(): YuhengRequest {
  if (!configuredRequest) throw new Error('Yuheng UI request is not configured')
  return configuredRequest
}

export const systemRequest: SystemRequest = {
  get: ({ url, ...config }) => getRequest().get(url, config as never),
  post: ({ url, data, ...config }) => getRequest().post(url, data, config as never),
  put: ({ url, data, ...config }) => getRequest().put(url, data, config as never),
  delete: ({ url, ...config }) => getRequest().delete(url, config as never),
  upload: ({ url, data, ...config }) => getRequest().upload(url, data, config as never),
  download: ({ url, ...config }) => getRequest().download(url, config as never)
}

declare global {
  interface PageParam {
    pageNo?: number
    pageSize?: number
  }
}
