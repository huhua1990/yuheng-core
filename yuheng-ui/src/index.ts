import type { Router } from 'vue-router'
import './styles.css'
import type { RegisterPlatformRoutesOptions } from './contracts'
import { platformRoutes } from './router/platform-routes'
import { registerRoutes } from './router/guards'

export * from './contracts'
export * from './auth/token'
export * from './auth/tenant'
export * from './request'
export * from './runtime/options'
export { installYuhengUi } from './runtime/install'
export * from './router'
export * from './stores/user'
export * from './stores/permission'
export * from './stores/dict'
export * from './stores/app'
export * from './stores/tags-view'
export * from './components'
export * from './layout'
export * from './locales'
export * from './plugins'
export { LoginPage } from './pages/Login'
export { Error403, Error404, Error500 } from './pages/Error'
export { RedirectPage } from './pages/Redirect'
export { ProfilePage } from './pages/Profile'

export { platformRoutes }

export function registerPlatformRoutes(router: Router, options?: RegisterPlatformRoutesOptions): void {
  registerRoutes(router, options?.routes ?? platformRoutes)
}
