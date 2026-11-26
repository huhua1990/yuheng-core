import { h } from 'vue'
import type { VNode } from 'vue'
import { Icon } from '../../components/Icon/index.ts'
import type { IconTypes } from '../../types/icon.d.ts'

export const useIcon = (props: IconTypes): VNode => {
  return h(Icon, props)
}
