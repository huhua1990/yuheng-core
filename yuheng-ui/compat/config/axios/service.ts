import { getPlatformContext } from '../../runtime'
export const service = (config: any) => getPlatformContext().request.request(config).then(data => ({ data }))
export const isRelogin = { show: false }
