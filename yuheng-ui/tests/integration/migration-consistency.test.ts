import { existsSync, readFileSync } from 'node:fs'
import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

interface InventoryRow {
  source: string
  owner: 'core' | 'demo' | 'excluded-sample'
  destination: string | null
}

const workspaceRoot = fileURLToPath(new URL('../../../..', import.meta.url))
const packageRoot = fileURLToPath(new URL('../..', import.meta.url))
const upstreamSrc = join(workspaceRoot, 'yudao-ui-admin-vue3/src')
const rows: InventoryRow[] = readFileSync(
  join(packageRoot, 'docs/admin-ui-migration-inventory.ndjson'),
  'utf8'
).trim().split(/\r?\n/).map((line) => JSON.parse(line))

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const file = join(directory, entry)
    return statSync(file).isDirectory() ? walk(file) : [file]
  })
}

describe('full admin UI migration consistency', () => {
  it('contains one inventory row for every upstream src file and no stale rows', () => {
    const files = walk(upstreamSrc).map((file) => relative(upstreamSrc, file))
    const sources = new Set(rows.map((row) => row.source))
    expect(sources.size).toBe(rows.length)
    expect(files.filter((file) => !sources.has(file))).toEqual([])
    expect(rows.filter((row) => !existsSync(join(upstreamSrc, row.source)))).toEqual([])
    expect(files).toHaveLength(rows.length)
  })

  it('maps all 460 core and 2515 demo rows after moving 51 business assets', () => {
    expect(rows.filter((row) => row.owner === 'core')).toHaveLength(460)
    expect(rows.filter((row) => row.owner === 'demo')).toHaveLength(2515)
    const missing = rows
      .filter((row) => row.owner === 'core' || row.owner === 'demo')
      .filter((row) => !existsSync(join(workspaceRoot, row.destination!)))
    expect(missing).toEqual([])
  })

  it('keeps business API domains out of core-owned migration rows', () => {
    const businessApiRows = rows.filter(
      (row) => row.owner === 'core' && /^api\/(?!infra\/|system\/|login\/)/.test(row.source)
    )
    expect(businessApiRows).toEqual([])
  })

  it('keeps core source free of member business APIs and routes', () => {
    const system = join(packageRoot, 'src/modules/system')
    const entryFiles = ['index.ts', 'api/index.ts', 'routes/index.ts']
    const exposed = entryFiles
      .map((file) => ({ file, content: readFileSync(join(system, file), 'utf8') }))
      .filter(({ content }) => /member|MemberUser/.test(content))
      .map(({ file }) => file)
    expect(exposed).toEqual([])
    expect(existsSync(join(system, 'api/member'))).toBe(false)
    expect(existsSync(join(system, 'routes/member.ts'))).toBe(false)
  })

  it('registers runtime routes from complete compat platform metadata', () => {
    const platform = readFileSync(join(packageRoot, 'compat/platform.ts'), 'utf8')
    expect(platform).toMatch(/path:\s*'\/login'/)
    expect(platform).toMatch(/path:\s*'\/'/)
    expect(platform).toContain("import.meta.glob('./views/**/*.{vue,tsx}')")
    const main = readFileSync(
      join(workspaceRoot, 'yuheng-demo/yuheng-demo-ui/src/main.ts'),
      'utf8'
    )
    expect(main).toContain('platformRoutes: completePlatformRoutes')
    expect(main).toContain('runtime.registerRoutes(router)')
  })

  it('contains no unresolved @ aliases in the full compat tree', () => {
    const compat = join(packageRoot, 'compat')
    const files = walk(compat).filter((file) => /\.(?:[cm]?[jt]sx?|vue|scss|css)$/.test(file))
    const aliases = files.flatMap((file) =>
      readFileSync(file, 'utf8').split(/\r?\n/).flatMap((line, index) => {
        const match = line.match(/(?:from\s*|import\s*\()(['"])@\/([^'"]+)\1/)
        return match ? [`${relative(packageRoot, file)}:${index + 1}: @/${match[2]}`] : []
      })
    )
    expect(aliases).toEqual([])
  })
})
