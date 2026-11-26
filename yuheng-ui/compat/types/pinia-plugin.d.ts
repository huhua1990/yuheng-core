// Pinia 持久化插件运行时已在根包注册；这里仅补齐选项 API 的类型声明。
// persist: false 表示显式关闭某个 Store 的持久化。
import 'pinia'

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S extends import('pinia').StateTree, Store> {
    persist?:
      | boolean
      | import('pinia-plugin-persistedstate').PersistenceOptions<S>
      | import('pinia-plugin-persistedstate').PersistenceOptions<S>[]
  }
}
