import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../src', import.meta.url))
const patterns = [
  /yudao-ui-admin-vue3/,
  /yuheng-demo-ui/,
  /\/Users\/huhua\/study\/ai\/yuheng\/yudao-ui-admin-vue3/,
  /from ['\"]yuheng-ui\/src\//,
  /from ['\"]@\/(?:api|views)\/(?:ai|ai1|bpm|crm|erp|fms|hrm|im|iot|mall|member|mes|mp|oa|pay|pms|report|wms)(?:\/|['\"])/,
  /from ['\"]@\/api\/bpm/,
  /from ['\"]@\/views\/crm/
]
const violations = []
function walk(directory) {
  for (const entry of readdirSync(directory)) {
    const file = join(directory, entry)
    const stat = statSync(file)
    if (stat.isDirectory()) walk(file)
    else if (stat.isFile()) {
      const lines = readFileSync(file, 'utf8').split(/\r?\n/)
      lines.forEach((line, index) => {
        if (patterns.some((pattern) => pattern.test(line))) violations.push(`${relative(root, file)}:${index + 1}: ${line.trim()}`)
      })
    }
  }
}
walk(root)
if (violations.length) {
  console.error('yuheng-ui boundary: FAIL')
  console.error(violations.join('\n'))
  process.exitCode = 1
} else {
  console.log('yuheng-ui boundary: PASS')
}
