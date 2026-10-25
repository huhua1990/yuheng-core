import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('release package exports', () => {
  it('exposes only the public root and stylesheet entry', () => {
    const packageJson = JSON.parse(
      readFileSync(new URL('../../package.json', import.meta.url), 'utf8')
    ) as { exports: Record<string, unknown> }
    expect(Object.keys(packageJson.exports).sort()).toEqual(['.', './styles.css'])
    expect(Object.keys(packageJson.exports).some((key) => key.includes('/src'))).toBe(false)
    expect(Object.keys(packageJson.exports).some((key) => key.includes('*'))).toBe(false)
  })
})
