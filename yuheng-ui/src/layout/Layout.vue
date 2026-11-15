<script setup lang="ts">
import { computed, inject, useSlots } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Icon as IconifyIcon } from '@iconify/vue'
import { useAppStore } from '../stores/app'
import { useUserStore } from '../stores/user'
import { usePermissionStore } from '../stores/permission'
import { YUHENG_UI_CONTEXT, type YuhengUiContext } from '../runtime/options'
import type { PlatformRouteRecord } from '../contracts'
import NavigationBranch from './NavigationBranch.vue'
import { logoutAndRedirect } from './logout'
import logoUrl from '../assets/logo.png'
import avatarUrl from '../assets/avatar.gif'

const context = inject<YuhengUiContext | undefined>(YUHENG_UI_CONTEXT)
const appStore = context ? useAppStore(context.pinia) : useAppStore()
const userStore = context ? useUserStore(context.pinia) : useUserStore()
const permissionStore = context ? usePermissionStore(context.pinia) : usePermissionStore()
const router = useRouter()
const slots = useSlots()
const sidebarWidth = computed(() => appStore.collapsed ? '64px' : 'var(--yuheng-ui-sidebar-width)')
const navigationRoutes = computed(() =>
  permissionStore.getAddRoutes().filter((route) => route.meta?.title && !route.meta?.hidden) as PlatformRouteRecord[]
)
const logout = async () => {
  await ElMessageBox.confirm('确认退出登录吗?', '提示', { type: 'warning' })
  await logoutAndRedirect({ context, userStore, permissionStore, router })
}
</script>
<template>
  <div class="yuheng-ui-shell">
    <aside v-if="!slots.sidebar" class="yuheng-ui-shell__sidebar" :class="{ 'is-collapsed': appStore.collapsed }" :style="{ width: sidebarWidth }">
      <RouterLink to="/" class="yuheng-ui-shell__brand">
        <img class="yuheng-ui-shell__logo" :src="logoUrl" alt="logo" />
        <span v-if="!appStore.collapsed">{{ context?.options.appTitle ?? 'Yuheng' }}</span>
      </RouterLink>
      <nav class="yuheng-ui-shell__navigation" aria-label="主导航">
        <NavigationBranch :routes="navigationRoutes" :collapsed="appStore.collapsed" />
      </nav>
    </aside>
    <slot v-else name="sidebar" />
    <div class="yuheng-ui-shell__main">
      <header class="yuheng-ui-shell__header">
        <slot name="header">
          <div class="yuheng-ui-shell__header-left">
            <button class="yuheng-ui-shell__collapse" type="button" :aria-label="appStore.collapsed ? '展开侧栏' : '收起侧栏'" @click="appStore.toggleCollapsed()">
              <IconifyIcon
              class="yuheng-ui-shell__collapse"
              :icon="appStore.collapsed ? 'ep:expand' : 'ep:fold'"
              :size="18"
              />
            </button>
            <strong>{{ context?.options.appTitle ?? 'Yuheng' }}</strong>
          </div>
          <div class="yuheng-ui-shell__user">
            <el-dropdown>
              <span class="yuheng-ui-shell__user-trigger">
                <el-avatar :size="26" :src="avatarUrl" />
                {{ userStore.userInfo?.nickname ?? userStore.userInfo?.username }}
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="router.push('/profile')">个人中心</el-dropdown-item>
                  <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </slot>
      </header>
      <main class="yuheng-ui-shell__content"><slot><RouterView /></slot></main>
    </div>
  </div>
</template>
<style src="../styles/layout.css"></style>
