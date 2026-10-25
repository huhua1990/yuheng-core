import type { PlatformRouteRecord } from '../contracts'

const placeholder = { render: () => null }

export const platformRoutes: readonly PlatformRouteRecord[] = [
  { path: '/login', name: 'Login', component: placeholder, meta: { public: true } },
  { path: '/redirect/:path(.*)', name: 'Redirect', component: placeholder },
  { path: '/profile', name: 'Profile', component: placeholder },
  { path: '/error', name: 'Error', component: placeholder },
  { path: '/', name: 'Home', component: placeholder }
]

export const fallbackRoutes: readonly PlatformRouteRecord[] = [
  { path: '/redirect', name: 'RedirectRoot', component: placeholder },
  { path: '/:pathMatch(.*)*', name: 'NoFound', component: placeholder }
]
