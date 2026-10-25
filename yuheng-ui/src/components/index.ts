import type { App, Component } from 'vue'
import ConfigGlobal from './ConfigGlobal.vue'
import ContentDetailWrap from './ContentDetailWrap.vue'
import ContentWrap from './ContentWrap.vue'
import Dialog from './Dialog.vue'
import Error from './Error.vue'
import Form from './Form.vue'
import Icon from './Icon.vue'
import Pagination from './Pagination.vue'
import Table from './Table.vue'
import UploadFile from './UploadFile.vue'
import Backtop from './Backtop.vue'

export { Backtop, ConfigGlobal, ContentDetailWrap, ContentWrap, Dialog, Error, Form, Icon, Pagination, Table, UploadFile }

const platformComponents: ReadonlyArray<readonly [string, Component]> = [
  ['Backtop', Backtop],
  ['ConfigGlobal', ConfigGlobal],
  ['ContentDetailWrap', ContentDetailWrap],
  ['ContentWrap', ContentWrap],
  ['Dialog', Dialog],
  ['Error', Error],
  ['Form', Form],
  ['Icon', Icon],
  ['Pagination', Pagination],
  ['Table', Table],
  ['UploadFile', UploadFile]
]

export function setupYuhengComponents(app: App): void {
  for (const [name, component] of platformComponents) app.component(name, component)
}
