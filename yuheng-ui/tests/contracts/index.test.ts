import { readFileSync } from 'node:fs'
import { createApp, defineComponent } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'
import {
  YuhengApiError,
  createYuhengRequest,
  installYuhengUi,
  platformRoutes,
  registerPlatformRoutes
} from '../../src/index'
import type {
  ApiResponse,
  MenuNode,
  PlatformRouteRecord,
  YuhengUiOptions
} from '@yuheng-ui/contracts'

describe('yuheng-ui public contract', () => {
  it('exports the documented types and runtime entry points', () => {
    const response: ApiResponse<{ ready: boolean }> = { code: 0, data: { ready: true } }
    const menu: MenuNode = { id: 'root', name: 'Root', children: [] }
    const route: PlatformRouteRecord = {
      name: 'root',
      path: '/',
      component: {} as never
    }
    const options: YuhengUiOptions = {
      apiBaseUrl: '/api',
      platformRoutes: [route],
      onUnauthorized: () => undefined,
      onApiError: () => undefined
    }

    expect(response.data.ready).toBe(true)
    expect(menu.children).toEqual([])
    expect(options.apiBaseUrl).toBe('/api')
    const names = platformRoutes.map((item) => String(item.name))
    expect(names).toEqual(['Login', 'Error', 'Redirect', 'Profile', 'Home'])
    expect(new Set(names).size).toBe(names.length)
    const request = createYuhengRequest({ apiBaseUrl: '/api' })
    expect(request.get).toBeTypeOf('function')
    expect(request.postOriginal).toBeTypeOf('function')
    const app = createApp(defineComponent({}))
    const runtime = installYuhengUi(app, options)
    const router = createRouter({ history: createMemoryHistory(), routes: [] })
    registerPlatformRoutes(router)
    expect(router.hasRoute('Login')).toBe(true)
    runtime.dispose()
  })

  it('constructs an API error with its response context', () => {
    const response: ApiResponse = { code: 401, data: null, msg: 'Unauthorized' }
    const error = new YuhengApiError('Unauthorized', 401, response)

    expect(error).toBeInstanceOf(Error)
    expect(error.code).toBe(401)
    expect(error.response).toBe(response)
    expect(error.message).toBe('Unauthorized')
  })

  it('publishes a declaration condition for the stylesheet export', () => {
    const packageJson = JSON.parse(
      readFileSync(new URL('../../package.json', import.meta.url), 'utf8')
    ) as {
      exports: {
        './styles.css': {
          types?: string
        }
      }
    }

    expect(packageJson.exports['./styles.css'].types).toBe('./dist/styles.css.d.ts')
  })
})
