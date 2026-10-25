<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { useUserStore } from '../stores/user'

const appStore = useAppStore()
const userStore = useUserStore()
const router = useRouter()
const sidebarWidth = computed(() => appStore.collapsed ? '64px' : 'var(--yuheng-ui-sidebar-width)')
const logout = async () => {
  userStore.userInfo = null
  await router.push('/login')
}
</script>
<template>
  <div class="yuheng-ui-shell" style="display:flex;min-height:100%;width:100%">
    <aside class="yuheng-ui-shell__sidebar" :style="{ width: sidebarWidth, transition: 'width .2s' }">
      <slot name="sidebar"><div style="padding:16px;font-weight:600">Yuheng</div></slot>
    </aside>
    <div style="display:flex;flex:1;flex-direction:column;min-width:0">
      <header class="yuheng-ui-shell__header" style="height:var(--yuheng-ui-header-height);display:flex;align-items:center;padding:0 16px;gap:12px">
        <slot name="header"><span style="font-weight:600">{{ userStore.userInfo?.nickname ?? 'Yuheng' }}</span><button type="button" @click="appStore.toggleCollapsed()">☰</button><button type="button" @click="logout">退出</button></slot>
      </header>
      <main style="flex:1;min-width:0"><slot><RouterView /></slot></main>
    </div>
  </div>
</template>
