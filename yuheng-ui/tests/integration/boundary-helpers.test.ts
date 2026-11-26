import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { moduleSpecifiers } from './boundary-helpers'

describe('module dependency discovery', () => {
  it('finds runtime and type imports in Vue script blocks', () => {
    const directory = mkdtempSync(join(tmpdir(), 'yuheng-vue-import-'))
    try {
      const file = join(directory, 'Example.vue')
      writeFileSync(file, '<script setup lang="ts">\nimport { ref } from "vue"\nimport type { Route } from "vue-router"\n</script>\n<template><div /></template>')
      expect(moduleSpecifiers(file)).toEqual(['vue'])
      expect(moduleSpecifiers(file, true)).toEqual(['vue', 'vue-router'])
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })
})
