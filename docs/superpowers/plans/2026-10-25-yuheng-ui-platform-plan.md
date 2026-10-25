# Yuheng UI Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从只读的 `yudao-ui-admin-vue3` 基线提取可发布的 `yuheng-ui` 平台包，并让 `yuheng-demo-ui` 通过公开根入口消费平台运行时、system/infra 页面和通用组件。

**Architecture:** 在 `yuheng-core/yuheng-ui` 建立独立的 Vue 3 + TypeScript + Element Plus NPM 包。包内部负责认证、请求、租户头、权限路由、平台 Store、布局、样式、通用组件和 system/infra 模块；消费端只负责业务模块和业务路由，通过 `installYuhengUi`、`registerPlatformRoutes`、`createYuhengRequest` 及公开类型接入。原始 `yudao-ui-admin-vue3` 只读，所有迁移通过复制并重构到新目录完成。

**Tech Stack:** Vue 3.5、TypeScript 6、Vite 8、Vue Router 5、Pinia 3、Element Plus 2、axios 1、Vitest、pnpm。

---

## 1. 文件地图和边界

实现前固定以下目录。`yudao-ui-admin-vue3` 只作为读取源，不出现在任何运行时依赖中。

| 单元 | 文件或目录 | 责任 |
| --- | --- | --- |
| 包元数据 | `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/package.json`、`tsconfig.json`、`vite.config.ts` | NPM 包名、版本、构建、类型和 exports |
| 对外契约 | `yuheng-ui/src/contracts/index.ts`、`src/index.ts` | `YuhengUiOptions`、`PlatformRouteRecord`、`MenuNode`、`ApiResponse` 和公开函数 |
| 认证 | `yuheng-ui/src/auth/**` | token、租户上下文、登录白名单和登出回调 |
| 请求 | `yuheng-ui/src/request/**` | axios、响应解析、刷新队列、上传下载和错误类型 |
| 运行时 | `yuheng-ui/src/runtime/**` | Vue 插件安装、默认插件注册和运行时句柄 |
| 路由 | `yuheng-ui/src/router/**` | 平台路由、动态菜单、守卫、路由重置和失败恢复 |
| Store | `yuheng-ui/src/stores/**` | 用户、权限、字典、应用、标签页和锁屏状态 |
| 应用壳层 | `yuheng-ui/src/layout/**`、`src/components/**` | 布局、导航、标签页、页面容器和通用组件 |
| 样式与语言 | `yuheng-ui/src/styles/**`、`src/locales/**` | 主题变量、全局样式、Element Plus 适配和平台语言包 |
| system | `yuheng-ui/src/modules/system/{api,routes,views}/**` | system API、平台路由和生产页面 |
| infra | `yuheng-ui/src/modules/infra/{api,routes,views}/**` | infra API、平台路由和生产页面 |
| 消费端 | `/Users/huhua/study/ai/yuheng/yuheng-demo/yuheng-demo-ui/**` | 业务 API、业务页面、业务路由和产品入口 |
| 只读基线 | `/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/**` | 仅用于比对和迁移来源 |
| 发布元数据 | `yuheng-core/release/yuheng-manifest.yaml` | `yuheng-ui@0.1.0-SNAPSHOT` 与 core 版本线对齐 |

每个任务都必须保持 `yuheng-demo-ui` 到 `yuheng-ui` 的单向依赖；平台包不得导入业务目录，消费端不得导入 `yuheng-ui/src/**`。

### Task 1: 创建包骨架和公开契约

**Files:**

- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/package.json`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/tsconfig.json`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/vite.config.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/contracts/index.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/index.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/tests/contracts/index.test.ts`
- Modify: `/Users/huhua/study/ai/yuheng/yuheng-core/.gitignore`

- [ ] **Step 1: Write the failing contract test**

Create `tests/contracts/index.test.ts` with the expected root exports:

```ts
import { describe, expect, it } from 'vitest'
import {
  createYuhengRequest,
  installYuhengUi,
  registerPlatformRoutes,
  platformRoutes
} from '../../src'

describe('yuheng-ui public contract', () => {
  it('exports the four platform entry points', () => {
    expect(typeof createYuhengRequest).toBe('function')
    expect(typeof installYuhengUi).toBe('function')
    expect(typeof registerPlatformRoutes).toBe('function')
    expect(Array.isArray(platformRoutes)).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
cd /Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui
pnpm exec vitest run tests/contracts/index.test.ts
```

Expected: FAIL because the package directory and the four exports do not exist.

- [ ] **Step 3: Add package metadata and contract types**

Use `0.1.0-SNAPSHOT`, matching `release/yuheng-manifest.yaml`:

```json
{
  "name": "yuheng-ui",
  "version": "0.1.0-SNAPSHOT",
  "type": "module",
  "private": false,
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./styles.css": "./dist/styles.css"
  },
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "test": "vitest run",
    "typecheck": "vue-tsc --noEmit",
    "build": "vite build",
    "lint:boundary": "node scripts/check-boundary.mjs"
  },
  "peerDependencies": {
    "element-plus": "2.13.7",
    "pinia": "3.0.4",
    "vue": "3.5.34",
    "vue-router": "5.0.6"
  },
  "dependencies": {
    "axios": "1.16.0",
    "qs": "6.15.1",
    "vue-i18n": "11.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "6.0.6",
    "element-plus": "2.13.7",
    "pinia": "3.0.4",
    "typescript": "6.0.3",
    "vite": "8.1.4",
    "vitest": "3.2.4",
    "vue": "3.5.34",
    "vue-router": "5.0.6",
    "vue-tsc": "3.2.8"
  }
}
```

Create `src/contracts/index.ts`:

```ts
import type { App } from 'vue'
import type { Router, RouteRecordRaw } from 'vue-router'

export interface YuhengUiOptions {
  apiBaseUrl: string
  appTitle?: string
  basePath?: string
  tenantEnabled?: boolean
  loginPath?: string
  whiteList?: string[]
  requestTimeout?: number
  onUnauthorized?: (reason: UnauthorizedReason) => void
  onApiError?: (error: YuhengApiError) => void
}

export interface PlatformRouteRecord extends RouteRecordRaw {
  meta?: RouteRecordRaw['meta'] & {
    permission?: string | string[]
  }
}

export interface MenuNode {
  id: string | number
  parentId?: string | number | null
  name: string
  path?: string
  component?: string
  permission?: string
  children?: MenuNode[]
}

export interface ApiResponse<T = unknown> {
  code: number
  data: T
  msg?: string
}

export type UnauthorizedReason = 'missing-token' | 'refresh-failed' | 'session-expired'

export class YuhengApiError extends Error {
  readonly code: number
  readonly response?: ApiResponse
  constructor(message: string, code: number, response?: ApiResponse)
}

export interface YuhengUiRuntime {
  install(app: App): void
  registerRoutes(router: Router): void
  dispose(): void
}
```

Create `src/index.ts` with type-only exports and temporary implementations that throw clear errors until later tasks replace them:

```ts
import type { App } from 'vue'
import type { Router } from 'vue-router'
import type {
  PlatformRouteRecord,
  YuhengUiOptions,
  YuhengUiRuntime
} from './contracts'

export * from './contracts'

export const platformRoutes: readonly PlatformRouteRecord[] = []

export function createYuhengRequest(): never {
  throw new Error('createYuhengRequest is not implemented')
}

export function installYuhengUi(_app: App, _options: YuhengUiOptions): YuhengUiRuntime {
  throw new Error('installYuhengUi is not implemented')
}

export function registerPlatformRoutes(_router: Router): void {
  throw new Error('registerPlatformRoutes is not implemented')
}
```

- [ ] **Step 4: Add Vite and TypeScript configuration**

`vite.config.ts` must build `src/index.ts` as a library, emit CSS, and keep Vue, Pinia, Vue Router and Element Plus external:

```ts
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: ['vue', 'vue-router', 'pinia', 'element-plus', 'vue-i18n'],
      output: { assetFileNames: 'styles.css' }
    }
  }
})
```

`tsconfig.json` must enable strict Vue type checking and the `@yuheng-ui/*` alias only inside the package.

- [ ] **Step 5: Run the contract test and build**

Run:

```bash
pnpm install
pnpm exec vitest run tests/contracts/index.test.ts
pnpm run typecheck
pnpm run build
```

Expected: the contract test passes, TypeScript reports only the temporary implementation declarations if they are not yet replaced, and the library emits `dist/index.js`, `dist/index.d.ts`, and `dist/styles.css`. Replace the temporary `never` declarations with typed stubs before committing so `typecheck` is clean.

- [ ] **Step 6: Commit**

```bash
git add yuheng-ui .gitignore
git commit -m "feat(ui): create yuheng-ui package contract"
```

### Task 2: Implement authentication, tenant context, and request behavior

**Files:**

- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/auth/token.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/auth/tenant.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/request/errors.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/request/client.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/request/index.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/tests/request/client.test.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/tests/auth/token.test.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/tests/helpers/memory-token-store.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/tests/helpers/recording-adapter.ts`
- Modify: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/contracts/index.ts`
- Modify: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/index.ts`
- Modify: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/package.json`

- [ ] **Step 1: Add failing tests for headers, response parsing, and refresh queue**

Test these exact behaviors:

```ts
it('adds bearer and tenant headers', async () => {
  const adapter = createRecordingAdapter({
    code: 0,
    data: { id: 1 }
  })
  const client = createYuhengRequest({
    apiBaseUrl: 'http://localhost/admin-api',
    tenantEnabled: true,
    adapter,
    tokenStore: memoryTokenStore({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      tenantId: 'tenant-7',
      visitTenantId: 'tenant-9'
    })
  })
  await client.get('/system/user/profile')
  expect(adapter.lastConfig.headers.Authorization).toBe('Bearer access-1')
  expect(adapter.lastConfig.headers['tenant-id']).toBe('tenant-7')
  expect(adapter.lastConfig.headers['visit-tenant-id']).toBe('tenant-9')
})

it('refreshes once and replays concurrent 401 requests', async () => {
  const refresh = vi.fn().mockResolvedValue({
    code: 0,
    data: { accessToken: 'access-2', refreshToken: 'refresh-2' }
  })
  const client = createYuhengRequest({
    apiBaseUrl: 'http://localhost/admin-api',
    refreshToken: refresh
  })
  const [first, second] = await Promise.all([
    client.get('/system/user/profile'),
    client.get('/system/dict')
  ])
  expect(refresh).toHaveBeenCalledTimes(1)
  expect(first).toEqual({ id: 1 })
  expect(second).toEqual({ items: [] })
})
```

Use a deterministic axios adapter in the test; do not call a live server.

Add `tests/helpers/memory-token-store.ts` and import it from the request test:

```ts
export function memoryTokenStore(initial: TokenSnapshot = {}): TokenStore {
  let snapshot = { ...initial }
  return {
    getAccessToken: () => snapshot.accessToken,
    getRefreshToken: () => snapshot.refreshToken,
    setToken: (next) => { snapshot = { ...snapshot, ...next } },
    removeToken: () => { snapshot = {} }
  }
}
```

- [ ] **Step 2: Run the request tests and verify they fail**

Run:

```bash
pnpm exec vitest run tests/auth/token.test.ts tests/request/client.test.ts
```

Expected: FAIL because the token store, request client, and refresh queue are not implemented.

- [ ] **Step 3: Implement token and tenant stores**

Define these types in `src/auth/token.ts` and re-export them from `src/contracts/index.ts`:

```ts
export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface TokenSnapshot extends Partial<TokenPair> {
  tenantId?: string
  visitTenantId?: string
}
```

`src/auth/token.ts` must expose `getAccessToken`, `getRefreshToken`, `setToken`, `removeToken`, and an injectable `TokenStore` interface. The default store uses `localStorage` keys `ACCESS_TOKEN`, `REFRESH_TOKEN`, `TENANT_ID`, and `VISIT_TENANT_ID`; tests use an in-memory implementation.

`src/auth/tenant.ts` must expose:

```ts
export interface TenantContext {
  tenantId?: string
  visitTenantId?: string
}

export function getTenantContext(): TenantContext
export function setTenantContext(context: TenantContext): void
export function clearTenantContext(): void
```

- [ ] **Step 4: Implement the request client**

`createYuhengRequest(options)` must:

1. create an axios instance with `baseURL`, `timeout`, `withCredentials: false`, and `qs.stringify({ allowDots: true })`;
2. omit bearer headers for `/login` and `/refresh-token`;
3. add `Authorization`, `tenant-id`, and `visit-tenant-id` according to options;
4. add `Cache-Control: no-cache` and `Pragma: no-cache` to GET requests;
5. serialize `application/x-www-form-urlencoded` POST bodies;
6. parse `{ code, data, msg }` responses and return `data` for normal calls;
7. convert non-success responses to `YuhengApiError`;
8. allow exactly one refresh request at a time and replay queued requests;
9. call `onUnauthorized` after refresh failure and clear tokens;
10. expose `get`, `post`, `put`, `delete`, `upload`, `download`, and `postOriginal`.

The public option type must include a `tokenStore?: TokenStore`, `tenantStore?: TenantStore`, `adapter?: AxiosAdapter`, and `refreshToken?: () => Promise<ApiResponse<TokenPair>>` so tests can inject state, transport, and the refresh response.

- [ ] **Step 5: Replace root stubs and run tests**

Export request functions from `src/index.ts`, then run:

```bash
pnpm exec vitest run tests/auth/token.test.ts tests/request/client.test.ts
pnpm run typecheck
```

Expected: all request and token tests pass, including one-refresh concurrency and refresh failure logout.

- [ ] **Step 6: Commit**

```bash
git add yuheng-ui/src/auth yuheng-ui/src/request yuheng-ui/src/contracts yuheng-ui/src/index.ts yuheng-ui/tests yuheng-ui/package.json
git commit -m "feat(ui): add auth tenant and request runtime"
```

### Task 3: Implement runtime installation, platform stores, and route guards

**Files:**

- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/runtime/install.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/runtime/options.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/stores/user.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/stores/permission.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/stores/dict.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/stores/app.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/stores/tags-view.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/router/platform-routes.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/router/guards.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/router/index.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/tests/router/guards.test.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/tests/stores/permission.test.ts`
- Modify: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/contracts/index.ts`
- Modify: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/index.ts`

- [ ] **Step 1: Write failing guard and permission tests**

Cover:

```ts
it('redirects an unauthenticated route to login with encoded redirect', async () => {
  const result = await resolveNavigation('/system/user')
  expect(result).toBe('/login?redirect=%2Fsystem%2Fuser')
})

it('allows white-listed routes without a token', async () => {
  expect(await resolveNavigation('/login')).toBe('/login')
})

it('adds only permission-matching dynamic routes', async () => {
  const routes = filterMenuRoutes([
    { id: 1, name: 'User', path: '/system/user', permission: 'system:user:query' },
    { id: 2, name: 'Secret', path: '/secret', permission: 'secret:read' }
  ], ['system:user:query'])
  expect(routes.map((route) => route.path)).toEqual(['/system/user'])
})
```

- [ ] **Step 2: Run tests and verify failure**

```bash
pnpm exec vitest run tests/router/guards.test.ts tests/stores/permission.test.ts
```

Expected: FAIL because guard and permission modules are absent.

- [ ] **Step 3: Implement stores**

Keep platform state in Pinia setup stores. `user.ts` must expose `fetchUserInfo`, `login`, `logout`, `isSetUser`; `permission.ts` must expose `generateRoutes`, `getAddRoutes`, `resetRoutes`; `dict.ts` must expose `setDictMap`, `getDict`; `app.ts` and `tags-view.ts` must expose only platform state and actions.

The stores must receive the request client through a runtime context instead of importing a singleton axios instance. This permits two test apps and prevents cross-consumer state leakage.

- [ ] **Step 4: Implement route guards and runtime install**

Export the pure helpers `resolveNavigation(path, context)` and `filterMenuRoutes(nodes, permissions)` from `src/router/guards.ts`; the router hook delegates to these helpers so the tests do not need a browser.

`src/router/guards.ts` must implement:

- white list matching for `/login`, `/social-login`, `/auth-redirect`, `/bind`, `/register`, `/oauthLogin/gitee`, and `/pms/kb/document/share`;
- token check before protected routes;
- user, dictionary, and dynamic menu initialization exactly once;
- route registration through `router.addRoute`;
- redirect preservation through `encodeURIComponent(to.fullPath)`;
- `afterEach` title and loading callbacks;
- route reset that keeps `Redirect`, `RedirectRoot`, `Login`, `NoFound`, and `Home`.

`installYuhengUi(app, options)` must install the platform context, global styles, platform directives, and runtime plugin without creating a Vue app or mounting to `#app`.

- [ ] **Step 5: Run tests and type checking**

```bash
pnpm exec vitest run tests/router/guards.test.ts tests/stores/permission.test.ts
pnpm run typecheck
```

Expected: tests pass and no type errors remain.

- [ ] **Step 6: Commit**

```bash
git add yuheng-ui/src/runtime yuheng-ui/src/stores yuheng-ui/src/router yuheng-ui/src/contracts yuheng-ui/src/index.ts yuheng-ui/tests
git commit -m "feat(ui): add platform runtime stores and guards"
```

### Task 4: Migrate application shell, styles, common components, and public pages

**Files:**

- Create or copy from read-only baseline:
  - `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/layout/**`
  - `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/layout/index.ts`
  - `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/components/**`
  - `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/styles/**`
  - `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/locales/**`
  - `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/pages/Login/**`
  - `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/pages/Error/**`
  - `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/pages/Redirect/**`
  - `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/pages/Profile/**`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/plugins/index.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/tests/runtime/install.test.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/scripts/check-boundary.mjs`
- Modify: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/runtime/install.ts`
- Modify: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/index.ts`

- [ ] **Step 1: Build an import inventory before copying**

Run against the read-only baseline:

```bash
rg -n "from ['\"]@/(api|store|router|views|components|utils|config|hooks)" \
  /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/layout \
  /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/components \
  /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/styles \
  /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/Login \
  /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/Error \
  /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/Redirect \
  /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/Profile
```

Classify each result as platform-owned, system/infra-owned, or business-owned before copying. Business imports must remain outside this task.

- [ ] **Step 2: Copy platform files without changing the baseline**

Use a file list generated from the inventory:

```bash
rsync -a --delete \
  /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/layout/ \
  /Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/layout/
```

Repeat for `components`, `styles`, `locales`, and the four public page directories. Rewrite copied imports to `@yuheng-ui/*` or package-relative imports, and remove imports from business directories.

- [ ] **Step 3: Add the runtime installation test**

The test must mount a minimal Vue app with a memory router and assert that installing the plugin registers the platform directive and does not call `document.querySelector('#app')` or mount the app.

Export `YuhengShell` from `src/layout/index.ts` and from the package root in `src/index.ts`. It must render the existing platform layout, expose a default slot for `RouterView`, and keep layout state in the platform Store.

- [ ] **Step 4: Add the boundary scanner**

`/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/scripts/check-boundary.mjs` must exit with code 1 when any file under `yuheng-ui/src` contains:

```text
yudao-ui-admin-vue3
yuheng-demo-ui
from '@/api/bpm
from '@/views/crm
from 'yuheng-ui/src/
```

It must print the matching file and line, and exit 0 for a clean package.

- [ ] **Step 5: Run package checks**

```bash
cd /Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui
pnpm exec vitest run tests/runtime/install.test.ts
pnpm run typecheck
pnpm run build
node /Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/scripts/check-boundary.mjs
git -C /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3 status --short
```

Expected: runtime test, type check, build, and boundary scan pass; the baseline status output is empty.

- [ ] **Step 6: Commit**

```bash
git add yuheng-ui
git commit -m "feat(ui): add platform shell styles and shared components"
```

### Task 5: Migrate system API, routes, and pages

**Files:**

- Create from read-only baseline:
  - `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/modules/system/api/**`
  - `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/modules/system/routes/index.ts`
  - `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/modules/system/views/**`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/tests/modules/system/system-api-contract.test.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/tests/modules/system/system-routes.test.ts`
- Modify: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/router/platform-routes.ts`
- Modify: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/index.ts`

- [ ] **Step 1: Freeze the source file list**

Copy only these source families:

```text
/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/api/system/**
/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/system/**
```

Exclude business imports and retain the existing endpoint strings, request methods, permission codes, pagination fields, and response types.

- [ ] **Step 2: Write failing API and route tests**

The API contract test must assert that user, role, department, menu, tenant, dictionary, notification, OAuth2, social, post, login-log, SMS and mail clients use the same `/admin-api/system/**` endpoint paths as the baseline.

The route test must assert:

```ts
expect(platformRoutes.some((route) => route.path === '/system/user')).toBe(true)
expect(platformRoutes.some((route) => route.path === '/system/role')).toBe(true)
expect(platformRoutes.every((route) => route.meta?.permission === undefined ||
  typeof route.meta?.permission === 'string' ||
  Array.isArray(route.meta?.permission))).toBe(true)
```

- [ ] **Step 3: Run tests and verify failure**

```bash
pnpm exec vitest run tests/modules/system/system-api-contract.test.ts tests/modules/system/system-routes.test.ts
```

Expected: FAIL because system modules are not present.

- [ ] **Step 4: Migrate API and view files**

Copy the source files into `modules/system`, rewrite `@/config/axios` imports to `@yuheng-ui/request`, rewrite `@/utils/auth` imports to `@yuheng-ui/auth`, and rewrite shared component imports to package-local paths. Keep endpoint constants and permission codes unchanged.

- [ ] **Step 5: Register system routes and run checks**

`src/modules/system/routes/index.ts` must export `systemRoutes` as `PlatformRouteRecord[]`; `src/router/platform-routes.ts` must combine public, system, and infra routes without importing business paths.

Run:

```bash
pnpm exec vitest run tests/modules/system/system-api-contract.test.ts tests/modules/system/system-routes.test.ts
pnpm run typecheck
pnpm run build
node /Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/scripts/check-boundary.mjs
```

Expected: system contract tests, type check, build, and boundary scan pass.

- [ ] **Step 6: Commit**

```bash
git add yuheng-ui/src/modules/system yuheng-ui/src/router/platform-routes.ts yuheng-ui/src/index.ts yuheng-ui/tests/modules/system
git commit -m "feat(ui): move system platform module"
```

### Task 6: Migrate infra API, routes, and pages

**Files:**

- Create from read-only baseline:
  - `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/modules/infra/api/**`
  - `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/modules/infra/routes/index.ts`
  - `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/modules/infra/views/**`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/tests/modules/infra/infra-api-contract.test.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/tests/modules/infra/infra-routes.test.ts`
- Modify: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/router/platform-routes.ts`
- Modify: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/index.ts`

- [ ] **Step 1: Freeze the production infra source list**

Copy:

```text
/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/api/infra/**
/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/infra/apiAccessLog/**
/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/infra/apiErrorLog/**
/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/infra/codegen/**
/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/infra/config/**
/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/infra/dataSourceConfig/**
/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/infra/file/**
/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/infra/fileConfig/**
/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/infra/job/**
/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/infra/redis/**
/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/infra/server/**
/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/infra/swagger/**
/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/infra/skywalking/**
/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/infra/webSocket/**
```

Do not register `src/views/infra/demo/**` in the default platform route list; retain it as an optional sample only if a later consumer explicitly needs it.

- [ ] **Step 2: Write failing API and route tests**

Assert that config, file, codegen, job, job-log, access-log, error-log, Redis, data-source and platform diagnostics keep their baseline paths and that `/infra/**` routes are present with permission metadata.

- [ ] **Step 3: Run tests and verify failure**

```bash
pnpm exec vitest run tests/modules/infra/infra-api-contract.test.ts tests/modules/infra/infra-routes.test.ts
```

Expected: FAIL because infra modules are not present.

- [ ] **Step 4: Migrate and rewrite imports**

Rewrite only platform aliases:

```text
@/config/axios -> @yuheng-ui/request
@/utils/auth -> @yuheng-ui/auth
@/components/* -> @yuheng-ui/components/*
@/hooks/* -> @yuheng-ui/internal/hooks/*
```

Keep backend endpoint strings and request methods byte-for-byte equal to the baseline unless the API contract inventory records a compatibility change.

- [ ] **Step 5: Register infra routes and verify**

Run:

```bash
pnpm exec vitest run tests/modules/infra/infra-api-contract.test.ts tests/modules/infra/infra-routes.test.ts
pnpm run typecheck
pnpm run build
node /Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/scripts/check-boundary.mjs
```

Expected: tests and build pass, and no `infra/demo` route is in `platformRoutes`.

- [ ] **Step 6: Commit**

```bash
git add yuheng-ui/src/modules/infra yuheng-ui/src/router/platform-routes.ts yuheng-ui/src/index.ts yuheng-ui/tests/modules/infra
git commit -m "feat(ui): move infra platform module"
```

### Task 7: Create the `yuheng-demo-ui` consumer and prove root-only consumption

**Files:**

- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/yuheng-demo-ui/package.json`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/yuheng-demo-ui/tsconfig.json`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/yuheng-demo-ui/vite.config.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/yuheng-demo-ui/index.html`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/yuheng-demo-ui/src/main.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/yuheng-demo-ui/src/App.vue`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/yuheng-demo-ui/src/router/business.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/yuheng-demo-ui/src/views/Home/index.vue`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/yuheng-demo-ui/tests/consumer-entry.test.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/yuheng-demo-ui/scripts/check-platform-imports.mjs`
- Modify: `/Users/huhua/study/ai/yuheng/yuheng-demo/yuheng-manifest.yaml`

- [ ] **Step 1: Add a consumer entry test before implementation**

The test must import only from `yuheng-ui` and assert that the consumer entry exposes platform installation and business route registration:

```ts
import { describe, expect, it } from 'vitest'
import { installYuhengUi, registerPlatformRoutes } from 'yuheng-ui'

describe('yuheng-demo-ui entry', () => {
  it('uses the public yuheng-ui entry', () => {
    expect(installYuhengUi).toBeTypeOf('function')
    expect(registerPlatformRoutes).toBeTypeOf('function')
  })
})
```

- [ ] **Step 2: Create consumer metadata**

Set `package.json` dependencies to the published version line:

```json
{
  "name": "yuheng-demo-ui",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "typecheck": "vue-tsc --noEmit",
    "build": "vite build",
    "test": "vitest run",
    "lint:platform-imports": "node scripts/check-platform-imports.mjs"
  },
  "dependencies": {
    "element-plus": "2.13.7",
    "pinia": "3.0.4",
    "vue": "3.5.34",
    "vue-router": "5.0.6",
    "yuheng-ui": "0.1.0-SNAPSHOT"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "6.0.6",
    "typescript": "6.0.3",
    "vite": "8.1.4",
    "vitest": "3.2.4",
    "vue-tsc": "3.2.8"
  }
}
```

During local verification, pack `yuheng-ui` with `pnpm pack --pack-destination /tmp/yuheng-ui-pack` and configure the test registry or local package cache to resolve `0.1.0-SNAPSHOT`; do not commit a `file:` source dependency.

- [ ] **Step 3: Implement the consumer entry**

`src/main.ts` must create the app, Pinia and router, then install the platform:

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { installYuhengUi, registerPlatformRoutes } from 'yuheng-ui'
import App from './App.vue'
import { businessRoutes } from './router/business'

const app = createApp(App)
const pinia = createPinia()
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: []
})

app.use(pinia)
installYuhengUi(app, {
  apiBaseUrl: import.meta.env.VITE_API_URL,
  appTitle: import.meta.env.VITE_APP_TITLE,
  basePath: import.meta.env.BASE_URL
})
registerPlatformRoutes(router)
businessRoutes.forEach((route) => router.addRoute(route))
app.use(router)
app.mount('#app')
```

`App.vue` renders the platform shell exported by `yuheng-ui` and a router view. The initial business route is `/home`; no system/infra page is copied into the consumer.

```vue
<script setup lang="ts">
import { YuhengShell } from 'yuheng-ui'
</script>

<template>
  <YuhengShell>
    <RouterView />
  </YuhengShell>
</template>
```

- [ ] **Step 4: Add the consumer boundary scanner**

`check-platform-imports.mjs` must scan `src` and fail on:

```text
yuheng-ui/src/
@/config/axios
@/router
@/store
@/views/system
@/views/infra
```

The scan must pass for business imports from `yuheng-ui` root and fail for a fixture containing `import { request } from 'yuheng-ui/src/request'`.

- [ ] **Step 5: Run consumer checks**

```bash
cd /Users/huhua/study/ai/yuheng/yuheng-demo/yuheng-demo-ui
pnpm install
pnpm test
pnpm run typecheck
pnpm run build
pnpm run lint:platform-imports
```

Expected: the consumer builds against the packed `yuheng-ui` artifact, the root-only import test passes, and the scanner reports no forbidden paths.

- [ ] **Step 6: Update the consumer manifest and commit**

Set the consumer manifest fields to:

```yaml
artifacts:
  ui: yuheng-ui@0.1.0-SNAPSHOT
compatibility:
  code: '>=0.1.0 <1.0.0'
```

Then commit:

```bash
git -C /Users/huhua/study/ai/yuheng/yuheng-demo add yuheng-demo-ui yuheng-manifest.yaml
git -C /Users/huhua/study/ai/yuheng/yuheng-demo commit -m "feat(ui): add yuheng demo consumer"
```

### Task 8: Add package exports, release metadata, and compatibility verification

**Files:**

- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/README.md`
- Modify: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/scripts/check-boundary.mjs`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/tests/release/package-exports.test.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/tests/release/platform-routes.test.ts`
- Modify: `/Users/huhua/study/ai/yuheng/yuheng-core/release/yuheng-manifest.yaml`
- Modify: `/Users/huhua/study/ai/yuheng/yuheng-core/release/compatibility-matrix.yaml`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/docs/verification/yuheng-ui-platform.md`

- [ ] **Step 1: Write release tests**

The package export test must assert that `package.json.exports` contains only `.`, `./styles.css`, and no `./src` or wildcard export. The route test must assert that every platform route has a unique name and path, and that system/infra routes are present.

- [ ] **Step 2: Extend the boundary scanner**

`check-boundary.mjs` must:

1. recursively scan `src`;
2. reject imports containing `/src/` from the package name;
3. reject imports from the business domain list;
4. reject absolute paths beginning with `/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3`;
5. print one error per violation and exit 1;
6. print `yuheng-ui boundary: PASS` and exit 0 when clean.

- [ ] **Step 3: Update release metadata**

Keep `release/yuheng-manifest.yaml` aligned with:

```yaml
codeVersion: 0.1.0-SNAPSHOT
artifacts:
  ui: yuheng-ui@0.1.0-SNAPSHOT
knowledgeTracks:
  - server
  - ui
  - data
```

Add a compatibility entry for `yuheng-ui` that records Vue 3.5, Vue Router 5, Pinia 3 and Element Plus 2 as the supported peer range.

Use this concrete YAML under `contracts.frontend`:

```yaml
    framework: vue3
    frameworkVersion: 3.5.x
    router: vue-router
    routerVersion: 5.x
    state: pinia
    stateVersion: 3.x
    componentLibrary: element-plus
    componentLibraryVersion: 2.x
    artifact: yuheng-ui@0.1.0-SNAPSHOT
```

- [ ] **Step 4: Write the verification report**

`docs/verification/yuheng-ui-platform.md` must record:

- source baseline commit and clean status;
- package commit and version;
- consumer commit and version;
- commands and outputs for package test, typecheck, build, boundary scan, consumer test, typecheck and build;
- platform route count and system/infra route names;
- confirmation that no consumer file imports `yuheng-ui/src/**`;
- known limitations: no `infra/demo` default routes and no live browser regression until a backend instance is available.

- [ ] **Step 5: Run the complete validation**

Run in order:

```bash
git -C /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3 status --short
git -C /Users/huhua/study/ai/yuheng/yuheng-core status --short
git -C /Users/huhua/study/ai/yuheng/yuheng-demo status --short

cd /Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui
pnpm test
pnpm run typecheck
pnpm run build
pnpm run lint:boundary

cd /Users/huhua/study/ai/yuheng/yuheng-demo/yuheng-demo-ui
pnpm test
pnpm run typecheck
pnpm run build
pnpm run lint:platform-imports

cd /Users/huhua/study/ai/yuheng/yuheng-core
python3 tools/governance/verify_manifest.py release/yuheng-manifest.yaml
```

Expected: all commands exit 0; the read-only baseline status is empty; the two Yuheng repositories contain only the intended changes.

- [ ] **Step 6: Commit release verification**

```bash
git -C /Users/huhua/study/ai/yuheng/yuheng-core add yuheng-ui release/yuheng-manifest.yaml release/compatibility-matrix.yaml docs/verification/yuheng-ui-platform.md
git -C /Users/huhua/study/ai/yuheng/yuheng-core commit -m "chore(ui): verify yuheng-ui release boundary"
```

## 2. Plan self-review

### Spec coverage

- Package location, version line, public root entry, and no deep imports: Tasks 1, 7, and 8.
- Authentication, token refresh, tenant headers, uploads, downloads, and error conversion: Task 2.
- Runtime installation, stores, route guards, dynamic menus, and reset behavior: Task 3.
- Layout, styles, global plugins, common components, and public pages: Task 4.
- system API, routes, pages, permissions, and endpoint compatibility: Task 5.
- infra API, routes, pages, production-only default route set, and endpoint compatibility: Task 6.
- Consumer business boundary and root-only package consumption: Task 7.
- Build, type, release exports, manifest compatibility, clean baseline, and verification evidence: Task 8.

### Placeholder and consistency review

- No task uses an unresolved placeholder or an unspecified future action.
- `YuhengUiOptions`, `PlatformRouteRecord`, `MenuNode`, `ApiResponse`, `YuhengApiError`, and `YuhengUiRuntime` are defined in Task 1 before later tasks consume them.
- `installYuhengUi`, `registerPlatformRoutes`, and `createYuhengRequest` are defined in Task 1 and implemented in Tasks 2 and 3.
- The package version is `0.1.0-SNAPSHOT` in package metadata, release manifest, and consumer dependency.
- The baseline is never a modified file target; every migration task creates files under `yuheng-core/yuheng-ui`.
- `infra/demo` is consistently excluded from default platform routes.

## 3. Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-25-yuheng-ui-platform-plan.md`. Two execution options:

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task and review between tasks.
2. **Inline Execution** — execute tasks in this session using executing-plans with checkpoints.
