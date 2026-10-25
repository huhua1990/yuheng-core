import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const apiRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../src/modules/infra/api')
const requiredPaths = [
  'apiAccessLog/index.ts:/infra/api-access-log/page',
  'apiErrorLog/index.ts:/infra/api-error-log/page',
  'codegen/index.ts:/infra/codegen/table/page',
  'config/index.ts:/infra/config/page',
  'dataSourceConfig/index.ts:/infra/data-source-config/list',
  'file/index.ts:/infra/file/page',
  'fileConfig/index.ts:/infra/file-config/page',
  'job/index.ts:/infra/job/page',
  'jobLog/index.ts:/infra/job-log/page',
  'redis/index.ts:/infra/redis/get-monitor-info'
]

describe('infra API compatibility', () => {
  it('keeps production infra endpoint paths and excludes demo modules', () => {
    for (const item of requiredPaths) {
      const separator = item.indexOf(':')
      const file = item.slice(0, separator)
      const endpoint = item.slice(separator + 1)
      const source = readFileSync(resolve(apiRoot, file), 'utf8')
      expect(source, `${file} should contain ${endpoint}`).toContain(endpoint)
      expect(source).not.toContain("@/config/axios")
    }
    expect(existsSync(resolve(apiRoot, 'demo'))).toBe(false)
  })
})
