import { store } from '../../index.ts'
import { defineStore } from 'pinia'

export const useWorkFlowStore = defineStore('simpleWorkflow', {
  state: () => ({
    tableId: '',
    isTried: false,
    promoterDrawer: false,
    approverDrawer: false,
    approverConfig1: {},
    copyerDrawer: false,
    copyerConfig: {},
    conditionDrawer: false,
    conditionsConfig1: {
      conditionNodes: [] as any[]
    },
    userTaskConfig: {}
  }),
  actions: {
    setTableId(payload: any) {
      this.tableId = payload
    },
    setIsTried(payload: any) {
      this.isTried = payload
    },
    setPromoter(payload: any) {
      this.promoterDrawer = payload
    },
    setApproverDrawer(payload: any) {
      this.approverDrawer = payload
    },
    setApproverConfig(payload: Recordable) {
      this.approverConfig1 = payload
    },
    setCopyerDrawer(payload: any) {
      this.copyerDrawer = payload
    },
    setCopyerConfig(payload: Recordable) {
      this.copyerConfig = payload
    },
    setCondition(payload: any) {
      this.conditionDrawer = payload
    },
    setConditionsConfig(payload: { conditionNodes: any[] }) {
      this.conditionsConfig1 = payload
    },
    setUserTaskConfig(payload: Recordable) {
      this.userTaskConfig = payload
    }
  }
})

export const useWorkFlowStoreWithOut = () => {
  return useWorkFlowStore(store)
}
