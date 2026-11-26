import request from '../../../config/axios/index.ts'

/**
 * 获取redis 监控信息
 */
export const getCache = () => {
  return request.get({ url: '/infra/redis/get-monitor-info' })
}
