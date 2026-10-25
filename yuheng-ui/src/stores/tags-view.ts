import { defineStore } from 'pinia'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

export const useTagsViewStore = defineStore('yuheng-tags-view', () => {
  let visitedViews: RouteLocationNormalizedLoaded[] = []
  let cachedViews: string[] = []
  const addView = (view: RouteLocationNormalizedLoaded): void => {
    if (!visitedViews.some((item) => item.fullPath === view.fullPath)) visitedViews.push(view)
    if (view.name && !cachedViews.includes(String(view.name))) cachedViews.push(String(view.name))
  }
  const delView = (view: RouteLocationNormalizedLoaded): void => {
    visitedViews = visitedViews.filter((item) => item.fullPath !== view.fullPath)
    if (view.name) cachedViews = cachedViews.filter((name) => name !== String(view.name))
  }
  const clear = (): void => {
    visitedViews = []
    cachedViews = []
  }
  return {
    get visitedViews() {
      return visitedViews
    },
    get cachedViews() {
      return cachedViews
    },
    addView,
    delView,
    clear
  }
})
