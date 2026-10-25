import { defineStore } from 'pinia'
import type { YuhengUiContext } from '../runtime/options'

export const useDictStore = defineStore('yuheng-dict', () => {
  let dictMap: Record<string, unknown> = {}
  const setDictMap = (next: Record<string, unknown> | Map<string, unknown>): void => {
    dictMap =
      next instanceof Map ? Object.fromEntries(next.entries()) : { ...next }
  }
  const getDict = <T = unknown>(type: string): T | undefined => dictMap[type] as T | undefined
  const fetchDict = async (context: YuhengUiContext): Promise<unknown> => {
    const result = await context.request.get('/system/dict-data/simple-list')
    setDictMap(result as Record<string, unknown>)
    return result
  }
  return {
    get dictMap() {
      return dictMap
    },
    setDictMap,
    getDict,
    fetchDict
  }
})
