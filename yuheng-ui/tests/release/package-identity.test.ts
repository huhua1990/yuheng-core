import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

describe('release package identity', () => {
  it('publishes under the yuheng-ui package name', () => {
    const packagePath = fileURLToPath(new URL('../../package.json', import.meta.url))
    const metadata = JSON.parse(readFileSync(packagePath, 'utf8')) as { name: string }
    expect(metadata.name).toBe('yuheng-ui')
  })
})
