import type { ConfigGlobalTypes } from '../../types/configGlobal.d.ts'

export const useConfigGlobal = () => {
  const configGlobal = inject('configGlobal', {}) as ConfigGlobalTypes

  return {
    configGlobal
  }
}
