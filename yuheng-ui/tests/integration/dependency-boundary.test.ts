import { readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { moduleSpecifiers, packageName, walk } from './boundary-helpers'

const root = fileURLToPath(new URL('../..', import.meta.url))
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { dependencies: Record<string, string>; peerDependencies: Record<string, string> }
const runtimeImports = [...walk(join(root, 'src')), ...walk(join(root, 'compat'))]
  .filter((file) => !/\/(?:__tests__|tests)\//.test(file) && !/\.(?:test|spec)\./.test(file))
  .flatMap((file) => moduleSpecifiers(file).map((specifier) => ({ file, name: packageName(specifier) })))
  .filter((entry): entry is { file: string; name: string } => Boolean(entry.name))
const required = new Set(runtimeImports.map(({ name }) => name))

describe('core platform dependency boundary', () => {
  it('declares every runtime package imported by shipped src and compat modules', () => {
    const missing = runtimeImports.filter(({ name }) => !(name in pkg.dependencies) && !(name in pkg.peerDependencies))
      .map(({ file, name }) => `${relative(root, file)}: ${name}`)
    expect([...new Set(missing)]).toEqual([])
  })

  it('keeps business-only media, gantt and BPM engine packages out of core dependencies', () => {
    const business = ['livekit-client', 'dhtmlx-gantt', 'bpmn-js', 'bpmn-js-token-simulation',
      'camunda-bpmn-moddle', 'diagram-js', 'benz-amr-recorder', '@microsoft/fetch-event-source',
      '@videojs-player/vue', 'video.js', 'markmap-common', 'markmap-lib', 'markmap-toolbar',
      'markmap-view', '@wangeditor-next/plugin-mention', 'fast-xml-parser', 'min-dash',
      'steady-xml', 'tyme4ts', 'xml-js', 'jsbarcode', 'vue3-signature']
    expect(business.filter((name) => name in pkg.dependencies)).toEqual([])
  })

  it('requires evidence for every retained runtime dependency', () => {
    // Public ambient Pinia persistence contracts remain shipped, even with the shared runtime store.
    const contractPackages = new Set(['pinia-plugin-persistedstate'])
    expect(Object.keys(pkg.dependencies).filter((name) => !required.has(name) && !contractPackages.has(name))).toEqual([])
  })
})
