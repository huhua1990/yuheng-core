import type { CSSProperties } from 'vue'
import type { ColProps, ComponentProps, ComponentName } from './components'
import type { AxiosPromise } from 'axios'

export type FormSetPropsType = {
  field: string
  path: string
  value: any
}

export type FormValueType = string | number | string[] | number[] | boolean | undefined | null

export type FormItemProps = {
  labelWidth?: string | number
  required?: boolean
  rules?: Recordable
  error?: string
  showMessage?: boolean
  inlineMessage?: boolean
  style?: CSSProperties
}

export type FormSchema = {
  field: string
  label?: string
  labelMessage?: string
  colProps?: ColProps
  componentProps?: { slots?: Recordable } & ComponentProps
  formItemProps?: FormItemProps
  component?: ComponentName
  value?: FormValueType
  hidden?: boolean
  api?: <T = any>() => AxiosPromise<T>
}
