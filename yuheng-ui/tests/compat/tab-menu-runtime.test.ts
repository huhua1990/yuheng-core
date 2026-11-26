import { isReactive } from 'vue'
import { describe, expect, it } from 'vitest'
import { filterMenusPath, initTabMap, tabPathMap } from '../../compat/layout/components/TabMenu/src/helper'
import { hasOneShowingChild } from '../../compat/layout/components/Menu/src/helper'

describe('compat tab menu runtime', () => {
  it('resolves a visible child without injected Vue globals', () => {
    const child = { path: 'app', meta: {} }
    expect(hasOneShowingChild([child] as never, { path: '/pay' } as never).oneShowingChild).toBe(true)
  })
  it('initializes reactive menu paths without injected Vue globals', () => {
    const routes = [{ path: '/pay', children: [{ path: 'app' }] }] as never
    initTabMap(routes)
    const menus = filterMenusPath(routes, routes)

    expect(isReactive(tabPathMap)).toBe(true)
    expect(menus[0].children?.[0].path).toBe('/pay/app')
    expect(tabPathMap['/pay']).toContain('/pay/app')
  })
})
