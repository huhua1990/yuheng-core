import { computed, reactive } from 'vue'
import { useDictStore as usePlatformDictStore } from 'yuheng-ui'
import { getPlatformContext } from '../../runtime'
import type { DictDataType } from '../../utils/dict.ts'

export type DictValueType = DictDataType
export interface DictTypeType { dictType:string; dictValue:DictValueType[] }

export function useDictStore(): {
  getDictMap: Record<string, unknown>
  getIsSetDict: boolean
  getDictByType: (type: string) => DictValueType[]
  setDictMap: () => Promise<unknown>
  resetDict: () => Promise<unknown>
} {
  const context = getPlatformContext()
  const source = usePlatformDictStore(context.pinia)
  return reactive({
    getDictMap: computed(() => source.dictMap),
    getIsSetDict: computed(() => Object.keys(source.dictMap).length > 0),
    getDictByType: (type: string) => source.getDict<DictValueType[]>(type) ?? [],
    setDictMap: () => source.fetchDict(context),
    resetDict: () => source.fetchDict(context)
  })
}
export const useDictStoreWithOut=useDictStore
