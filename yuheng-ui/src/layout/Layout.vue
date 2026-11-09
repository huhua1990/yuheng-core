<script setup lang="ts">
import { computed, inject, useSlots } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Icon as IconifyIcon } from '@iconify/vue'
import { useAppStore } from '../stores/app'
import { useUserStore } from '../stores/user'
import { usePermissionStore } from '../stores/permission'
import { YUHENG_UI_CONTEXT, type YuhengUiContext } from '../runtime/options'
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
  permissionStore.getAddRoutes().filter((route) => route.meta?.title && !route.meta?.hidden)
)
const logout = async () => {
  await ElMessageBox.confirm('确认退出登录吗?', '提示', { type: 'warning' })
  if (context) {
    await userStore.logout(context)
    permissionStore.resetRoutes()
  } else {
    userStore.userInfo = null
  }
  await router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
}
</script>
<template>
  <div class="yuheng-ui-shell">
    <aside v-if="!slots.sidebar" class="yuheng-ui-shell__sidebar" :style="{ width: sidebarWidth }">
      <RouterLink to="/" class="yuheng-ui-shell__brand">
        <img class="yuheng-ui-shell__logo" :src="logoUrl" alt="logo" />
        <span v-if="!appStore.collapsed">{{ context?.options.appTitle ?? 'Yuheng' }}</span>
      </RouterLink>
      <nav class="yuheng-ui-shell__navigation" aria-label="主导航">
        <RouterLink
          v-for="route in navigationRoutes"
          :key="String(route.name ?? route.path)"
          :to="{ name: route.name! }"
          class="yuheng-ui-shell__nav-link"
          :title="String(route.meta?.title)"
        >
          <span v-if="!appStore.collapsed">{{ route.meta?.title }}</span>
          <span v-else>{{ String(route.meta?.title).slice(0, 1) }}</span>
        </RouterLink>
      </nav>
    </aside>
    <slot v-else name="sidebar" />
    <div class="yuheng-ui-shell__main">
      <header class="yuheng-ui-shell__header">
        <slot name="header">
          <div class="yuheng-ui-shell__header-left">
            <IconifyIcon
              class="yuheng-ui-shell__collapse"
              :icon="appStore.collapsed ? 'ep:expand' : 'ep:fold'"
              :size="18"
              @click="appStore.toggleCollapsed()"
            />
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
<style scoped src="../styles/layout.css"></style>
