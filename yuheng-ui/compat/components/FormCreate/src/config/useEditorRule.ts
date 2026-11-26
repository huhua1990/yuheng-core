import { generateUUID } from '../../../../utils/index.ts'
import { localeProps, makeRequiredRule } from '../utils/index.ts'

export const useEditorRule = () => {
  const label = '富文本'
  const name = 'Editor'
  return {
    icon: 'icon-editor',
    label,
    name,
    rule() {
      return {
        type: name,
        field: generateUUID(),
        title: label,
        info: '',
        $required: false
      }
    },
    props(_, { t }) {
      return localeProps(t, name + '.props', [
        makeRequiredRule(),
        {
          type: 'input',
          field: 'height',
          title: '高度'
        },
        { type: 'switch', field: 'readonly', title: '是否只读' }
      ])
    }
  }
}
