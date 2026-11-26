import type { Router } from 'vue-router'
import type { YuhengUiContext } from 'yuheng-ui'
let context: YuhengUiContext | undefined
let router: Router | undefined
export function bindPlatformRuntime(next: YuhengUiContext, nextRouter: Router) { context = next; router = nextRouter }
export function getPlatformContext(): YuhengUiContext { if (!context) throw new Error('Platform runtime is not installed'); return context }
export function getPlatformRouter(): Router { if (!router) throw new Error('Platform router is not installed'); return router }
export const componentRegistry: Record<string, any> = {}
export function registerViewComponents(components: Record<string, any>) { Object.assign(componentRegistry, components) }
