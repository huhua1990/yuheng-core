export interface TenantContext {
  tenantId?: string
  visitTenantId?: string
}

export interface TenantStore {
  getTenantContext(): TenantContext
  setTenantContext(context: TenantContext): void
  clearTenantContext(): void
}

export type TenantStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const TENANT_ID = 'TENANT_ID'
const VISIT_TENANT_ID = 'VISIT_TENANT_ID'

function createMemoryTenantStore(): TenantStore {
  let context: TenantContext = {}
  return {
    getTenantContext: () => ({ ...context }),
    setTenantContext: (next) => {
      context = { ...context, ...next }
    },
    clearTenantContext: () => {
      context = {}
    }
  }
}

export function createBrowserTenantStore(storage?: TenantStorage): TenantStore {
  if (!storage) return createMemoryTenantStore()
  return {
    getTenantContext: () => ({
      tenantId: storage.getItem(TENANT_ID) ?? undefined,
      visitTenantId: storage.getItem(VISIT_TENANT_ID) ?? undefined
    }),
    setTenantContext: (context) => {
      if (context.tenantId !== undefined) storage.setItem(TENANT_ID, context.tenantId)
      if (context.visitTenantId !== undefined) storage.setItem(VISIT_TENANT_ID, context.visitTenantId)
    },
    clearTenantContext: () => {
      storage.removeItem(TENANT_ID)
      storage.removeItem(VISIT_TENANT_ID)
    }
  }
}

export function createDefaultTenantStore(): TenantStore {
  try {
    const storage = typeof window !== 'undefined' ? window.localStorage : undefined
    return storage ? createBrowserTenantStore(storage) : createMemoryTenantStore()
  } catch {
    return createMemoryTenantStore()
  }
}
