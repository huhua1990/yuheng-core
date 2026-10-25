# yuheng-ui

`yuheng-ui` is the Yuheng platform UI package for Vue 3 applications. It provides the platform runtime, authentication and tenant request context, permission routing, public pages, system and infra route contracts, and the shared platform components used by `yuheng-demo-ui`.

Consume the package through its public root entry:

```ts
import { installYuhengUi, registerPlatformRoutes } from 'yuheng-ui'
```

The package is published on the `0.1.x` version line. `yudao-ui-admin-vue3` remains a read-only migration baseline. The first release establishes the platform contract and route/API boundaries; visual parity for deferred baseline screens is migrated incrementally.
