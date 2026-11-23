import type { YuhengRequest } from 'yuheng-ui'
import { getPlatformContext } from '../../runtime'

export type CompatRequestOptions = Parameters<YuhengRequest['request']>[0] & { url: string; headersType?: string }

function request<T = any>(method: string, option: CompatRequestOptions): Promise<T> {
  const { headersType, ...config } = option
  return getPlatformContext().request.request<T>({ ...config, method, ...(headersType ? { headers: { ...option.headers, 'Content-Type': headersType } } : {}) })
}
export default {
 get: <T=any>(option:CompatRequestOptions) => request<T>('GET', option),
 post: <T=any>(option:CompatRequestOptions) => request<T>('POST', option),
 put: <T=any>(option:CompatRequestOptions) => request<T>('PUT', option),
 delete: <T=any>(option:CompatRequestOptions) => request<T>('DELETE', option),
 postOriginal: <T=any>(option:CompatRequestOptions) => request<T>('POST', option).then(data => ({ code: 0, data })),
 download: <T=Blob>(option:CompatRequestOptions) => request<T>('GET', { ...option, responseType:'blob' }),
 upload: <T=any>(option:CompatRequestOptions) => request<T>('POST', { ...option, headersType:'multipart/form-data' })
}
