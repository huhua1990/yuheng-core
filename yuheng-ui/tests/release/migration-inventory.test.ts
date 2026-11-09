import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { businessAsset, businessDomain, inventory } from '../integration/boundary-helpers'

const root = fileURLToPath(new URL('../..', import.meta.url))
const rows = inventory(root)

describe('admin UI migration inventory', () => {
  it('classifies all 3004 source files with one canonical owner and no unresolved rows', () => {
    expect(rows).toHaveLength(3004)
    expect(new Set(rows.map((row) => row.source)).size).toBe(rows.length)
    const invalid = rows.filter((row) =>
      !row.source || row.source.startsWith('src/') || row.source.split('/').includes('..') ||
      !['core', 'demo', 'excluded-sample'].includes(row.owner) ||
      Object.hasOwn(row, 'ownership') ||
      (row.owner !== 'excluded-sample' ? !row.destination : row.destination !== null)
    )
    expect(invalid.map((row) => row.source)).toEqual([])
  })

  it('maps core files to unique existing compat destinations without path escapes', () => {
    const owned = rows.filter((row) => row.owner === 'core')
    const destinations = owned.map((row) => row.destination!)
    expect(new Set(destinations).size).toBe(destinations.length)
    const invalid = owned.filter((row) => {
      const prefix = 'yuheng-core/yuheng-ui/compat/'
      if (!row.destination?.startsWith(prefix)) return true
      const destination = resolve(root, row.destination.slice('yuheng-core/yuheng-ui/'.length))
      return relative(resolve(root, 'compat'), destination).startsWith('..') ||
        !existsSync(destination) || !statSync(destination).isFile()
    })
    expect(invalid.map((row) => row.source)).toEqual([])
  })

  it('keeps all business APIs/views/assets and infra demos outside core ownership', () => {
    const businessCode = new RegExp(`^(?:api|views)/${businessDomain}(?:/|$)`)
    expect(rows.filter((row) => row.owner === 'core' &&
      (businessCode.test(row.source) || businessAsset.test(row.source) || /^api\/infra\/demo\//.test(row.source))
    ).map((row) => row.source)).toEqual([])
  })

  it('tracks the nine runtime adapters as real core files and excludes the five infra sample APIs', () => {
    const adapters = ['config/axios/index.ts', 'config/axios/service.ts', 'router/index.ts',
      'router/modules/remaining.ts', 'store/index.ts', 'store/modules/dict.ts',
      'store/modules/permission.ts', 'store/modules/user.ts', 'utils/auth.ts']
    for (const source of adapters) {
      expect(rows.find((row) => row.source === source)).toEqual({
        source, owner: 'core', destination: `yuheng-core/yuheng-ui/compat/${source}`
      })
    }
    const samples = rows.filter((row) => /^api\/infra\/demo\//.test(row.source))
    expect(samples).toHaveLength(5)
    expect(samples.every((row) => row.owner === 'excluded-sample' && row.destination === null)).toBe(true)
  })

  it('assigns all 51 business assets to demo while retaining 13 generic platform assets', () => {
    const business = rows.filter((row) => businessAsset.test(row.source))
    expect(business).toHaveLength(51)
    expect(business.every((row) => row.owner === 'demo' && row.destination === `yuheng-demo/yuheng-demo-ui/src/${row.source}`)).toBe(true)
    expect(rows.filter((row) => row.owner === 'core' && row.source.startsWith('assets/'))).toHaveLength(13)
  })
})
