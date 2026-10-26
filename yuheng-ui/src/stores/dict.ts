import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { YuhengUiContext } from '../runtime/options'

export const useDictStore = defineStore('yuheng-dict', () => {
  const dictMap = ref<Record<string, unknown>>({})
  const setDictMap = (next: Record<string, unknown> | Map<string, unknown>): void => {
    dictMap.value =
      next instanceof Map ? Object.fromEntries(next.entries()) : { ...next }
  }
  const getDict = <T = unknown>(type: string): T | undefined => dictMap.value[type] as T | undefined
  const fetchDict = async (context: YuhengUiContext): Promise<unknown> => {
    const result = await context.request.get('/system/dict-data/simple-list')
    setDictMap(result as Record<string, unknown>)
    return result
  }
  return {
    dictMap,
    setDictMap,
    getDict,
    fetchDict
  }
})
