export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface TokenSnapshot extends Partial<TokenPair> {
  tenantId?: string
  visitTenantId?: string
}

export interface TokenStore {
  getAccessToken(): string | undefined
  getRefreshToken(): string | undefined
  setToken(snapshot: TokenSnapshot): void
  removeToken(): void
}

export type TokenStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const ACCESS_TOKEN = 'ACCESS_TOKEN'
const REFRESH_TOKEN = 'REFRESH_TOKEN'
const TENANT_ID = 'TENANT_ID'
const VISIT_TENANT_ID = 'VISIT_TENANT_ID'

function createMemoryStore(): TokenStore {
  let snapshot: TokenSnapshot = {}
  return {
    getAccessToken: () => snapshot.accessToken,
    getRefreshToken: () => snapshot.refreshToken,
    setToken: (next) => {
      snapshot = { ...snapshot, ...next }
    },
    removeToken: () => {
      snapshot = {}
    }
  }
}

export function createBrowserTokenStore(storage?: TokenStorage): TokenStore & {
  getSnapshot(): TokenSnapshot
} {
  let memorySnapshot: TokenSnapshot = {}
  const values: TokenStore = storage
    ? {
        getAccessToken: () => storage.getItem(ACCESS_TOKEN) ?? undefined,
        getRefreshToken: () => storage.getItem(REFRESH_TOKEN) ?? undefined,
        setToken: (snapshot) => {
          if (snapshot.accessToken !== undefined) storage.setItem(ACCESS_TOKEN, snapshot.accessToken)
          if (snapshot.refreshToken !== undefined) storage.setItem(REFRESH_TOKEN, snapshot.refreshToken)
          if (snapshot.tenantId !== undefined) storage.setItem(TENANT_ID, snapshot.tenantId)
          if (snapshot.visitTenantId !== undefined) {
            storage.setItem(VISIT_TENANT_ID, snapshot.visitTenantId)
          }
        },
        removeToken: () => {
          storage.removeItem(ACCESS_TOKEN)
          storage.removeItem(REFRESH_TOKEN)
          storage.removeItem(TENANT_ID)
          storage.removeItem(VISIT_TENANT_ID)
        }
      }
    : {
        getAccessToken: () => memorySnapshot.accessToken,
        getRefreshToken: () => memorySnapshot.refreshToken,
        setToken: (snapshot) => {
          memorySnapshot = { ...memorySnapshot, ...snapshot }
        },
        removeToken: () => {
          memorySnapshot = {}
        }
      }

  return {
    ...values,
    getSnapshot: () => ({
      accessToken: values.getAccessToken(),
      refreshToken: values.getRefreshToken(),
      tenantId: storage ? storage.getItem(TENANT_ID) ?? undefined : memorySnapshot.tenantId,
      visitTenantId: storage
        ? storage.getItem(VISIT_TENANT_ID) ?? undefined
        : memorySnapshot.visitTenantId
    })
  }
}

export function createDefaultTokenStore(): TokenStore {
  try {
    const storage = typeof window !== 'undefined' ? window.localStorage : undefined
    return storage ? createBrowserTokenStore(storage) : createMemoryStore()
  } catch {
    return createMemoryStore()
  }
}

export const tokenStorageKeys = {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  TENANT_ID,
  VISIT_TENANT_ID
} as const
