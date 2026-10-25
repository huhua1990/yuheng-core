import type { App } from 'vue'
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

export function setupYuhengComponents(app: App): void {
  ;[Backtop, ConfigGlobal, ContentDetailWrap, ContentWrap, Dialog, Error, Form, Icon, Pagination, Table, UploadFile].forEach((component) => {
    if (component.name) app.component(component.name, component)
  })
}
