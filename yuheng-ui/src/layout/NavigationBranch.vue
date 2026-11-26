<script setup lang="ts">
import { reactive } from 'vue'
import { useRoute } from 'vue-router'
import type { PlatformRouteRecord } from '../contracts'

defineOptions({ name: 'NavigationBranch' })

const props = defineProps<{
  routes: PlatformRouteRecord[]
  collapsed: boolean
}>()

const route = useRoute()
const expanded = reactive(new Map<string, boolean>())

function hasChildren(item: PlatformRouteRecord): boolean {
  return Boolean(item.children?.some((child) => child.meta?.title && !child.meta?.hidden))
}

function isExpanded(item: PlatformRouteRecord): boolean {
  const key = String(item.name ?? item.path)
  if (expanded.has(key)) return expanded.get(key)!
  return route.matched.some((matched) => matched.name === item.name)
}

function toggle(item: PlatformRouteRecord): void {
  const key = String(item.name ?? item.path)
  expanded.set(key, !isExpanded(item))
}
</script>

<template>
  <div class="yuheng-ui-shell__navigation-branch">
    <div v-for="item in routes" :key="String(item.name ?? item.path)" class="yuheng-ui-shell__navigation-item">
      <div class="yuheng-ui-shell__navigation-row">
        <RouterLink
          :to="{ name: item.name! }"
          class="yuheng-ui-shell__nav-link"
          :title="String(item.meta?.title)"
        >
          <span v-if="!collapsed">{{ item.meta?.title }}</span>
          <span v-else>{{ String(item.meta?.title).slice(0, 1) }}</span>
        </RouterLink>
        <button
          v-if="!collapsed && hasChildren(item)"
          class="yuheng-ui-shell__nav-toggle"
          type="button"
          :aria-label="`${isExpanded(item) ? '收起' : '展开'}${String(item.meta?.title)}子菜单`"
          :aria-expanded="isExpanded(item)"
          @click="toggle(item)"
        >
          <span aria-hidden="true">{{ isExpanded(item) ? '⌄' : '›' }}</span>
        </button>
      </div>
      <NavigationBranch
        v-if="!collapsed && hasChildren(item) && isExpanded(item)"
        :routes="item.children!.filter((child) => child.meta?.title && !child.meta?.hidden) as PlatformRouteRecord[]"
        :collapsed="collapsed"
      />
    </div>
  </div>
</template>
