import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

export const useTagsViewStore = defineStore('yuheng-tags-view', () => {
  const visitedViews = ref<RouteLocationNormalizedLoaded[]>([])
  const cachedViews = ref<string[]>([])
  const addView = (view: RouteLocationNormalizedLoaded): void => {
    if (!visitedViews.value.some((item) => item.fullPath === view.fullPath)) visitedViews.value.push(view)
    if (view.name && !cachedViews.value.includes(String(view.name))) cachedViews.value.push(String(view.name))
  }
  const delView = (view: RouteLocationNormalizedLoaded): void => {
    visitedViews.value = visitedViews.value.filter((item) => item.fullPath !== view.fullPath)
    if (view.name) cachedViews.value = cachedViews.value.filter((name) => name !== String(view.name))
  }
  const clear = (): void => {
    visitedViews.value = []
    cachedViews.value = []
  }
  return {
    visitedViews,
    cachedViews,
    addView,
    delView,
    clear
  }
})
