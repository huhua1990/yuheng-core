import { getPlatformContext } from '../runtime'
import type { Pinia } from 'pinia'
export const store = new Proxy({} as Pinia, { get(_target, key) { return Reflect.get(getPlatformContext().pinia, key) }, set(_target, key, value) { return Reflect.set(getPlatformContext().pinia, key, value) } })
