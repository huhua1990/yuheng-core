import type { App } from 'vue'
import type { Router } from 'vue-router'
import type { YuhengUiContext } from 'yuheng-ui'
import { bindPlatformRuntime, registerViewComponents } from './runtime'
import { setupI18n } from './plugins/vueI18n'
import { setupFormCreate } from './plugins/formCreate'
import { setupAuth, setupMountedFocus } from './directives'
import './styles/index.scss'
import 'animate.css'
import 'nprogress/nprogress.css'
import VueDOMPurifyHTML from 'vue-dompurify-html'
import print from 'vue3-print-nb'
export async function setupCompletePlatform(app: App, context: YuhengUiContext, router: Router, components: Record<string, any>) {
 bindPlatformRuntime(context,router);registerViewComponents(components)
 await setupI18n(app)
 setupFormCreate(app);setupAuth(app);setupMountedFocus(app)
 app.use(VueDOMPurifyHTML);app.use(print)
}
