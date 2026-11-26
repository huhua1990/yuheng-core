import type { App } from 'vue'
import type { Router } from 'vue-router'
import type { YuhengUiContext } from 'yuheng-ui'

export declare function setupCompletePlatform(
  app: App,
  context: YuhengUiContext,
  router: Router,
  components: Record<string, unknown>
): Promise<void>
