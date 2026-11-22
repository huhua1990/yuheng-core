import { describe, expect, it, vi } from 'vitest'

vi.mock('../../compat/hooks/web/useCache.ts', () => ({ CACHE_KEY: { USER: 'user' }, useCache: () => ({ wsCache: { get: () => ({ roles: [] }) } }) }))
vi.mock('../../compat/store/modules/user.ts', () => ({ useUserStore: () => ({ permissions: new Set() }) }))

describe('permission directives', () => {
  it('loads and registers without an injected useI18n global', async () => {
    const { hasRole } = await import('../../compat/directives/permission/hasRole.ts')
    const { hasPermi } = await import('../../compat/directives/permission/hasPermi.ts')
    const directive = vi.fn()
    hasRole({ directive } as never)
    hasPermi({ directive } as never)
    expect(directive.mock.calls.map(([name]) => name)).toEqual(['hasRole', 'hasPermi'])
  })
})
