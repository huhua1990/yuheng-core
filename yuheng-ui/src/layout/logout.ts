import type { YuhengUiContext } from '../runtime/options'

interface LogoutUserStore {
  logout: (context: YuhengUiContext) => Promise<void>
  userInfo: unknown
}

interface PermissionStore {
  resetRoutes: () => void
}

interface LogoutRouter {
  currentRoute: { value: { fullPath: string } }
  push: (location: { path: string; query: { redirect: string } }) => unknown
}

export async function logoutAndRedirect({
  context,
  userStore,
  permissionStore,
  router
}: {
  context?: YuhengUiContext
  userStore: LogoutUserStore
  permissionStore: PermissionStore
  router: LogoutRouter
}): Promise<void> {
  if (context) {
    try {
      await userStore.logout(context)
    } catch {
      // The user store clears the local session in its finally block.
    }
    permissionStore.resetRoutes()
  } else {
    userStore.userInfo = null
  }
  await router.push({
    path: '/login',
    query: { redirect: router.currentRoute.value.fullPath }
  })
}
