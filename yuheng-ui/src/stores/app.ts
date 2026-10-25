import { defineStore } from 'pinia'

export const useAppStore = defineStore('yuheng-app', () => {
  let collapsed = false
  let mobile = false
  const setCollapsed = (value: boolean): void => {
    collapsed = value
  }
  const toggleCollapsed = (): void => {
    collapsed = !collapsed
  }
  const setMobile = (value: boolean): void => {
    mobile = value
  }
  return {
    get collapsed() {
      return collapsed
    },
    get mobile() {
      return mobile
    },
    setCollapsed,
    toggleCollapsed,
    setMobile
  }
})
