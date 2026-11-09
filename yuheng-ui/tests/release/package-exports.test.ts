import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { businessAsset, businessDomain, moduleSpecifiers, walk } from '../integration/boundary-helpers'

type ExportValue = string | Record<string, unknown> | ExportValue[]
const root = fileURLToPath(new URL('../..', import.meta.url))
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { exports: Record<string, ExportValue>; files: string[] }
function targets(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  return value && typeof value === 'object' ? Object.values(value).flatMap(targets) : []
}
function entryTargets(key: string): string[] {
  if (pkg.exports[key]) return targets(pkg.exports[key])
  for (const [pattern, value] of Object.entries(pkg.exports)) {
    if (!pattern.includes('*')) continue
    const [prefix, suffix] = pattern.split('*')
    if (key.startsWith(prefix) && key.endsWith(suffix)) {
      const middle = key.slice(prefix.length, suffix ? -suffix.length : undefined)
      return targets(value).map((target) => target.replace('*', middle))
    }
  }
  return []
}

describe('release package exports', () => {
  it('exposes the runtime, stylesheet and complete platform integration entry points', () => {
    for (const key of ['.', './styles.css', './compat/setup', './compat/runtime', './compat/platform']) {
      expect(entryTargets(key).length, key).toBeGreaterThan(0)
    }
  })

  it('resolves every actual export and conditional target to an existing packaged file', () => {
    const invalid: string[] = []
    for (const [key, value] of Object.entries(pkg.exports)) {
      const paths = targets(value)
      if (!paths.length) invalid.push(`${key}: empty target`)
      for (const target of paths) {
        if (!/^\.\/(?:dist|compat)\//.test(target) || target.split('/').includes('..') ||
            !pkg.files.some((path) => target.startsWith(`./${path}/`) || target === `./${path}`)) {
          invalid.push(`${key}: unpackaged ${target}`)
          continue
        }
        if (target.includes('*')) {
          const prefix = target.slice(2).split('*')[0]
          const base = join(root, prefix.replace(/\/$/, ''))
          if (!existsSync(base) || !walk(base).length) invalid.push(`${key}: empty pattern ${target}`)
        } else if (!existsSync(join(root, target)) || !statSync(join(root, target)).isFile()) {
          invalid.push(`${key}: missing ${target}`)
        }
      }
    }
    expect(invalid).toEqual([])
  })

  it('never exports original src, business API/view domains, samples or business assets', () => {
    const businessCode = new RegExp(`^\.\/compat/(?:api|views)/${businessDomain}(?:/|$)`)
    const forbidden = Object.entries(pkg.exports).flatMap(([key, value]) => [key, ...targets(value)])
      .filter((path) => path.startsWith('./src/') || businessCode.test(path) ||
        path.startsWith('./compat/api/infra/demo/') || businessAsset.test(path.replace(/^\.\/compat\//, '')))
    expect(forbidden).toEqual([])
    expect(pkg.exports['./compat/assets/*']).toBeUndefined()
  })

  it('resolves every actual platform self-import through a declared public export', () => {
    const unresolved: string[] = []
    for (const file of walk(join(root, 'compat'))) {
      for (const specifier of moduleSpecifiers(file, true).filter((path) => path.startsWith('yuheng-ui/'))) {
        const key = `.${specifier.slice('yuheng-ui'.length)}`
        const paths = entryTargets(key)
        if (!paths.length || paths.some((path) => !existsSync(resolve(root, path)))) {
          unresolved.push(`${relative(root, file)}: ${specifier}`)
        }
      }
    }
    expect(unresolved).toEqual([])
  })
})
