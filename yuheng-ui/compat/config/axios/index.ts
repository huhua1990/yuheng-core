import { getPlatformContext } from '../../runtime'
function request<T = any>(method: string, option: any = {}): Promise<T> {
  const { headersType, ...config } = option
  return getPlatformContext().request.request<T>({ ...config, method, ...(headersType ? { headers: { ...option.headers, 'Content-Type': headersType } } : {}) })
}
export default {
 get: <T=any>(option:any) => request<T>('GET', option),
 post: <T=any>(option:any) => request<T>('POST', option),
 put: <T=any>(option:any) => request<T>('PUT', option),
 delete: <T=any>(option:any) => request<T>('DELETE', option),
 postOriginal: (option:any) => request<any>('POST', option).then(data => ({ code: 0, data })),
 download: <T=any>(option:any) => request<T>('GET', { ...option, responseType:'blob' }),
 upload: <T=any>(option:any) => request<T>('POST', { ...option, headersType:'multipart/form-data' })
}
