import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = fileURLToPath(new URL('../..', import.meta.url))

describe('strict compatibility consumer', () => {
  it('checks the real public utilities, stores and chart/dept components without consumer shims', () => {
    const directory = mkdtempSync(join(tmpdir(), 'yuheng-strict-consumer-'))
    try {
      symlinkSync(join(root, 'node_modules'), join(directory, 'node_modules'), 'dir')
      writeFileSync(join(directory, 'consumer.ts'), `
import { formatTime, buildSortingField, erpPriceTableColumnFormatter } from '${root}/compat/utils/index'
import { handleTree, handleTree2, treeToString } from '${root}/compat/utils/tree'
import { getStrDictOptions } from '${root}/compat/utils/dict'
import { setupI18n } from '${root}/compat/plugins/vueI18n'
import { useAppStore } from '${root}/compat/store/modules/app'
import Echart from '${root}/compat/components/Echart/src/Echart.vue'
import DeptTreeSelect from '${root}/compat/views/system/dept/components/DeptTreeSelect.vue'
const label: string | undefined = getStrDictOptions('status')[0]?.value
void [formatTime, buildSortingField, erpPriceTableColumnFormatter, handleTree, handleTree2,
  treeToString, setupI18n, useAppStore, Echart, DeptTreeSelect, label]
`)
      writeFileSync(join(directory, 'auto-imports.d.ts'), `
export {}
declare global {
  const computed: typeof import('vue').computed
  const ref: typeof import('vue').ref
  const unref: typeof import('vue').unref
  const watch: typeof import('vue').watch
  const onMounted: typeof import('vue').onMounted
  const onBeforeUnmount: typeof import('vue').onBeforeUnmount
  const onActivated: typeof import('vue').onActivated
}
`)
      writeFileSync(join(directory, 'tsconfig.json'), JSON.stringify({
        compilerOptions: {
          target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler',
          strict: true, skipLibCheck: true, noEmit: true, esModuleInterop: true,
          allowImportingTsExtensions: true, types: ['vite/client', 'node']
        },
        files: ['consumer.ts', 'auto-imports.d.ts', join(root, 'compat/types/global.d.ts')]
      }))
      const result = spawnSync(process.execPath, [join(root, 'node_modules/vue-tsc/bin/vue-tsc.js'),
        '--noEmit', '-p', join(directory, 'tsconfig.json')], { encoding: 'utf8' })
      expect(result.stdout + result.stderr).toBe('')
      expect(result.status).toBe(0)
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  }, 30_000)
})
