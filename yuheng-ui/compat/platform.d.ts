import type { RouteRecordRaw } from 'vue-router'

/** Platform routes and lazy view modules resolved by Vite at runtime. */
export declare const completePlatformRoutes: RouteRecordRaw[]
export declare const platformViewComponents: Record<string, () => Promise<unknown>>
