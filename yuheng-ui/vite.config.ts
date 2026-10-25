import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'

const cssDeclarationPlugin: Plugin = {
  name: 'yuheng-ui-css-declaration',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'styles.css.d.ts',
      source: 'declare const css: string\nexport default css\n'
    })
  }
}

export default defineConfig({
  plugins: [vue(), cssDeclarationPlugin],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@yuheng-ui': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: ['vue', 'vue-router', 'pinia', 'element-plus', 'vue-i18n'],
      output: {
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith('.css') ? 'styles.css' : assetInfo.name ?? 'asset'
      }
    }
  }
})
