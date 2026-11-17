import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { walk } from '../integration/boundary-helpers'

const root = fileURLToPath(new URL('../..', import.meta.url))

describe('tracked release tarball', () => {
  it('contains the current platform compat sources and package exports', () => {
    const directory = mkdtempSync(join(tmpdir(), 'yuheng-package-content-'))
    try {
      execFileSync('tar', ['-xzf', join(root, 'vendor/yuheng-ui-0.1.0-SNAPSHOT.tgz'), '-C', directory])
      const packaged = join(directory, 'package')
      const sourceFiles = walk(join(root, 'compat')).map((file) => relative(root, file)).sort()
      const packageFiles = walk(join(packaged, 'compat')).map((file) => relative(packaged, file)).sort()
      expect(packageFiles).toEqual(sourceFiles)
      const changed = sourceFiles.filter((file) => !readFileSync(join(root, file)).equals(readFileSync(join(packaged, file))))
      expect(changed, 'rebuild the tracked tarball after changing compat sources').toEqual([])
      const sourceManifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
      const packageManifest = JSON.parse(readFileSync(join(packaged, 'package.json'), 'utf8'))
      for (const key of ['name', 'version', 'exports', 'dependencies', 'peerDependencies']) {
        expect(packageManifest[key], key).toEqual(sourceManifest[key])
      }
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })
})
