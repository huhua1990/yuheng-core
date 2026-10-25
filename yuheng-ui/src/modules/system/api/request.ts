import type { AxiosRequestConfig } from 'axios'
import type { YuhengRequest } from '../../../contracts'

export interface SystemRequestConfig extends AxiosRequestConfig {
  url: string
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
  get: ({ url, ...config }) => getRequest().get(url, config),
  post: ({ url, data, ...config }) => getRequest().post(url, data, config),
  put: ({ url, data, ...config }) => getRequest().put(url, data, config),
  delete: ({ url, ...config }) => getRequest().delete(url, config),
  upload: ({ url, data, ...config }) => getRequest().upload(url, data, config),
  download: ({ url, ...config }) => getRequest().download(url, config)
}

declare global {
  interface PageParam {
    pageNo?: number
    pageSize?: number
  }
}
