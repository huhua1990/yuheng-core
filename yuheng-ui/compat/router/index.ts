import { getPlatformRouter } from '../runtime'
import type { Router } from 'vue-router'
export default new Proxy({} as Router, { get(_target, key) { const router = getPlatformRouter(); const value = Reflect.get(router, key); return typeof value === 'function' ? value.bind(router) : value } })
export function resetRouter() { const router=getPlatformRouter(); router.getRoutes().forEach(route => { if (route.meta?.dynamic && route.name) router.removeRoute(route.name) }) }
