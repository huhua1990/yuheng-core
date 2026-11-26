import Table from './src/Table.vue'
import { ElTable } from 'element-plus'
import type { TableSetPropsType } from '../../types/table.d.ts'
import TableSelectForm from './src/TableSelectForm.vue'

export interface TableExpose {
  setProps: (props: Recordable) => void
  setColumn: (columnProps: TableSetPropsType[]) => void
  selections: Recordable[]
  elTableRef: ComponentRef<typeof ElTable>
}

export { Table, TableSelectForm }
