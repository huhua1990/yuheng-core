import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('yuheng-app', () => {
  const collapsed = ref(false)
  const mobile = ref(false)
  const setCollapsed = (value: boolean): void => {
    collapsed.value = value
  }
  const toggleCollapsed = (): void => {
    collapsed.value = !collapsed.value
  }
  const setMobile = (value: boolean): void => {
    mobile.value = value
  }
  return {
    collapsed,
    mobile,
    setCollapsed,
    toggleCollapsed,
    setMobile
  }
})
