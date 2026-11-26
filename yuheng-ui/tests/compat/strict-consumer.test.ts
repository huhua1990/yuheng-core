import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = fileURLToPath(new URL('../..', import.meta.url))

describe('strict compatibility consumer', () => {
  it('typechecks public utility and department component exports as a package consumer', () => {
    const directory = mkdtempSync(join(tmpdir(), 'yuheng-public-compat-consumer-'))
    try {
      mkdirSync(join(directory, 'node_modules'), { recursive: true })
      symlinkSync(root, join(directory, 'node_modules/yuheng-ui'), 'dir')
      for (const dependency of ['lodash-es', '@types/lodash-es', 'vue', 'element-plus']) {
        const target = join(root, 'node_modules', dependency)
        const link = join(directory, 'node_modules', dependency)
        if (existsSync(target)) {
          mkdirSync(dirname(link), { recursive: true })
          symlinkSync(target, link, 'dir')
        }
      }
      writeFileSync(join(directory, 'consumer.ts'), `
import { formatTime, erpCountTableColumnFormatter, erpPriceTableColumnFormatter, escapeHtml } from 'yuheng-ui/compat/utils'
import { handleTree, handleTree2, treeToString } from 'yuheng-ui/compat/utils/tree'
import { findNode, treeToList } from 'yuheng-ui/compat/utils/tree'
import { getBoolDictOptions } from 'yuheng-ui/compat/utils/dict'
import { getMonthRange } from 'yuheng-ui/compat/utils/formatTime'
type IsAny<T> = 0 extends (1 & T) ? true : false
const date: string = formatTime(new Date(), 'yyyy-MM-dd')
const tree = handleTree([{ id: 1, parentId: 0 }])
const treeIsNotAny: false = null as unknown as IsAny<typeof tree>
const rooted = handleTree2([{ id: 1, parentId: 0 }])
const label: string = treeToString(tree, 1)
void [date, rooted, label, treeIsNotAny, erpCountTableColumnFormatter, erpPriceTableColumnFormatter,
  escapeHtml, findNode, treeToList, getBoolDictOptions, getMonthRange]
`)
      writeFileSync(join(directory, 'consumer-globals.d.ts'), `
export {}
declare global {
  const ref: typeof import('vue').ref
  const watch: typeof import('vue').watch
}
`)
      writeFileSync(join(directory, 'tsconfig.json'), JSON.stringify({
        compilerOptions: {
          target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler',
          strict: true, skipLibCheck: true, noEmit: true, allowImportingTsExtensions: true,
          ignoreDeprecations: '6.0', jsx: 'preserve',
          typeRoots: [join(root, 'node_modules/@types')], types: ['node']
        },
        files: ['consumer.ts', 'consumer-globals.d.ts', join(root, 'compat/types/global.d.ts')]
      }))
      const result = spawnSync(process.execPath, [join(root, 'node_modules/vue-tsc/bin/vue-tsc.js'),
        '--noEmit', '-p', join(directory, 'tsconfig.json')], { encoding: 'utf8' })
      expect(result.stdout + result.stderr).toBe('')
      expect(result.status).toBe(0)
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  }, 30_000)

  it('keeps store actions typed through the published package entry point', () => {
    const directory = mkdtempSync(join(tmpdir(), 'yuheng-package-consumer-'))
    try {
      mkdirSync(join(directory, 'node_modules'), { recursive: true })
      symlinkSync(root, join(directory, 'node_modules/yuheng-ui'), 'dir')
      for (const dependency of ['pinia', 'vue', 'vue-router', 'pinia-plugin-persistedstate']) {
        symlinkSync(join(root, 'node_modules', dependency), join(directory, 'node_modules', dependency), 'dir')
      }
      writeFileSync(join(directory, 'consumer.ts'), `
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { useTagsViewStore } from 'yuheng-ui/compat/store/modules/tagsView'
import request from 'yuheng-ui/compat/config/axios'
import * as UserApi from 'yuheng-ui/compat/api/system/user'
import * as AreaApi from 'yuheng-ui/compat/api/system/area'
import { getBoolDictOptions, getDictLabel } from 'yuheng-ui/compat/utils/dict'
import { beginOfDay, defaultShortcuts, endOfDay } from 'yuheng-ui/compat/utils/formatTime'
import { areaReplace, erpCalculatePercentage } from 'yuheng-ui/compat/utils'
import { findNode } from 'yuheng-ui/compat/utils/tree'
const delView: (view: RouteLocationNormalizedLoaded) => void = useTagsViewStore().delView
const found: { id: number } | null = findNode([{ id: 1 }], item => item.id === 1)
const upload: typeof request.upload = request.upload
void [delView, found, upload, UserApi.getSimpleUserList, AreaApi.getAreaTree, getBoolDictOptions,
  getDictLabel, beginOfDay, defaultShortcuts, endOfDay, areaReplace, erpCalculatePercentage]
`)
      writeFileSync(join(directory, 'consumer-globals.d.ts'), `
export {}
declare global {
  const ref: typeof import('vue').ref
}
`)
      writeFileSync(join(directory, 'tsconfig.json'), JSON.stringify({
        compilerOptions: {
          target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler',
          strict: true, skipLibCheck: true, noEmit: true, allowImportingTsExtensions: true
        },
        files: ['consumer.ts', 'consumer-globals.d.ts', join(root, 'compat/types/global.d.ts')]
      }))
      const result = spawnSync(process.execPath, [join(root, 'node_modules/vue-tsc/bin/vue-tsc.js'),
        '--noEmit', '-p', join(directory, 'tsconfig.json')], { encoding: 'utf8' })
      expect(result.stdout + result.stderr).toBe('')
      expect(result.status).toBe(0)
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  }, 30_000)

  it('checks the real public utilities, stores and chart/dept/icon components without consumer shims', () => {
    const directory = mkdtempSync(join(tmpdir(), 'yuheng-strict-consumer-'))
    try {
      symlinkSync(join(root, 'node_modules'), join(directory, 'node_modules'), 'dir')
      writeFileSync(join(directory, 'consumer.ts'), `
import { formatTime, buildSortingField, erpPriceTableColumnFormatter } from '${root}/compat/utils/index'
import { handleTree, handleTree2, treeToString } from '${root}/compat/utils/tree'
import { getStrDictOptions } from '${root}/compat/utils/dict'
import { setupI18n } from '${root}/compat/plugins/vueI18n'
import { useAppStore } from '${root}/compat/store/modules/app'
import { useTagsViewStore } from '${root}/compat/store/modules/tagsView'
import Echart from '${root}/compat/components/Echart/src/Echart.vue'
import MarkdownView from '${root}/compat/components/MarkdownView/index.vue'
import DeptTreeSelect from '${root}/compat/views/system/dept/components/DeptTreeSelect.vue'
import { Descriptions } from '${root}/compat/components/Descriptions'
import { Icon, IconSelect } from '${root}/compat/components/Icon'
import { updateFile } from '${root}/compat/api/infra/file'
import { Dialog } from '${root}/compat/components/Dialog'
import { UploadFile, UploadImg } from '${root}/compat/components/UploadFile'
import Pagination from '${root}/compat/components/Pagination/index.vue'
import { exportSmsTemplate } from '${root}/compat/api/system/sms/smsTemplate'
import { exportDictType } from '${root}/compat/api/system/dict/dict.type'
import { exportPost } from '${root}/compat/api/system/post'
type IsAny<T> = 0 extends (1 & T) ? true : false
const dictExportParamsAreTyped: false = null as unknown as IsAny<Parameters<typeof exportDictType>[0]>
const postExportParamsAreTyped: false = null as unknown as IsAny<Parameters<typeof exportPost>[0]>
const label: string | undefined = getStrDictOptions('status')[0]?.value
const sortingEvent: { prop: string; order: string | null } = { prop: 'createTime', order: 'ascending' }
if (sortingEvent.order) buildSortingField(sortingEvent)
const closeView = useTagsViewStore().delView
void [formatTime, buildSortingField, erpPriceTableColumnFormatter, handleTree, handleTree2,
  treeToString, setupI18n, useAppStore, Echart, MarkdownView, DeptTreeSelect, Descriptions, Icon, IconSelect,
  updateFile, Dialog, UploadFile, UploadImg, Pagination, exportSmsTemplate, exportDictType, exportPost,
  dictExportParamsAreTyped, postExportParamsAreTyped, label, closeView]
`)
      writeFileSync(join(directory, 'auto-imports.d.ts'), `
export {}
declare global {
  const computed: typeof import('vue').computed
  const ref: typeof import('vue').ref
  const nextTick: typeof import('vue').nextTick
  const useI18n: typeof import('${root}/compat/hooks/web/useI18n').useI18n
  const toRef: typeof import('vue').toRef
  const unref: typeof import('vue').unref
  const useAttrs: typeof import('vue').useAttrs
  const useSlots: typeof import('vue').useSlots
  const watch: typeof import('vue').watch
  const onMounted: typeof import('vue').onMounted
  const onBeforeUnmount: typeof import('vue').onBeforeUnmount
  const onActivated: typeof import('vue').onActivated
  const useMessage: typeof import('${root}/compat/hooks/web/useMessage').useMessage
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
