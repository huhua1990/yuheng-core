<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useDictStore, usePermissionStore, useUserStore } from 'yuheng-ui'
import { getPlatformContext } from '../../runtime'
import { buildHomeModules, formatNoticeDate } from './types'

defineOptions({ name: 'YuhengHomePage' })

interface NoticeItem {
  id?: number
  title: string
  type?: string | number
  createTime?: Date | number | string
}

const router = useRouter()
const context = getPlatformContext()
const userStore = useUserStore(context.pinia)
const permissionStore = usePermissionStore(context.pinia)
const dictStore = useDictStore(context.pinia)
const homeModules = computed(() => buildHomeModules(permissionStore.addRoutes, userStore.permissions))
const notices = ref<NoticeItem[]>([])
const loading = ref(false)
const failed = ref(false)
let requestGeneration = 0

const username = computed(() => String(userStore.userInfo?.nickname ?? userStore.userInfo?.username ?? '用户'))
const dictionaryCount = computed(() => Object.keys(dictStore.dictMap).length)
const shortcutCount = computed(() => homeModules.value.reduce((count, module) => count + module.entries.length, 0))
const hasNoticePermission = computed(() => userStore.permissions.some((permission) =>
  permission === '*' || permission === 'system:notice:query' || permission === 'system:*' || permission === '*:*:*'
))

async function loadNotices(): Promise<void> {
  const generation = ++requestGeneration
  if (!hasNoticePermission.value) {
    notices.value = []
    loading.value = false
    failed.value = false
    return
  }
  loading.value = true
  failed.value = false
  try {
    const result = await context.request.get<{ list?: NoticeItem[]; total?: number }>('/system/notice/page', {
      params: { pageNo: 1, pageSize: 5, status: 0 }
    })
    if (generation !== requestGeneration) return
    if (!result || !Array.isArray(result.list)) throw new Error('Invalid notice response')
    notices.value = result.list
  } catch {
    if (generation === requestGeneration) failed.value = true
  } finally {
    if (generation === requestGeneration) loading.value = false
  }
}

function retryNotices(): void {
  void loadNotices()
}

watch(hasNoticePermission, () => { void loadNotices() })
onMounted(() => { void loadNotices() })
onBeforeUnmount(() => { requestGeneration += 1 })
</script>

<template>
  <main class="home">
    <header class="home__header">
      <div>
        <h1>欢迎，{{ username }}</h1>
        <p>Yuheng 平台工作台</p>
      </div>
      <dl class="home__stats">
        <div><dt>授权模块</dt><dd>{{ homeModules.length }}</dd></div>
        <div><dt>可访问入口</dt><dd>{{ shortcutCount }}</dd></div>
        <div><dt>已加载字典</dt><dd>{{ dictionaryCount }}</dd></div>
      </dl>
    </header>

    <section class="home__section" aria-labelledby="modules-title">
      <h2 id="modules-title">快捷入口</h2>
      <template v-if="homeModules.length">
        <div v-for="module in homeModules" :key="module.title" class="home__module">
          <h3>{{ module.title }}</h3>
          <div class="home__links">
            <button v-for="entry in module.entries" :key="entry.path" type="button" @click="router.push(entry.to)">
              <Icon icon="ep:link" aria-hidden="true" />
              <span>{{ entry.title }}</span>
            </button>
          </div>
        </div>
      </template>
      <p v-else class="home__empty">暂无可访问模块</p>
    </section>

    <section class="home__section" aria-labelledby="notices-title">
      <h2 id="notices-title">通知公告</h2>
      <p v-if="!hasNoticePermission" class="home__empty">暂无通知公告查询权限</p>
      <p v-else-if="loading" role="status" class="home__empty">正在加载通知公告</p>
      <div v-else-if="failed" class="home__error" role="alert">
        <span>通知公告加载失败</span>
        <button type="button" @click="retryNotices">重试</button>
      </div>
      <ul v-else-if="notices.length" class="home__notices">
        <li v-for="notice in notices" :key="notice.id ?? notice.title">
          <div><strong>{{ notice.title }}</strong><span>{{ notice.type ?? '' }}</span></div>
          <time>{{ formatNoticeDate(notice.createTime) }}</time>
        </li>
      </ul>
      <p v-else class="home__empty">暂无通知公告</p>
    </section>
  </main>
</template>

<style>
.home { display: grid; gap: 24px; padding: 24px; color: var(--el-text-color-primary); }
.home__header { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
h1, h2, h3, p { margin: 0; }
h1 { font-size: 24px; font-weight: 600; }
.home__header p { margin-top: 8px; color: var(--el-text-color-secondary); }
.home__stats { display: flex; gap: 28px; margin: 0; }
.home__stats div { min-width: 96px; }
.home__stats dt { color: var(--el-text-color-secondary); font-size: 13px; }
.home__stats dd { margin: 6px 0 0; font-size: 22px; font-weight: 600; }
.home__section { border-top: 1px solid var(--el-border-color); padding-top: 18px; }
h2 { margin-bottom: 16px; font-size: 17px; font-weight: 600; }
.home__module + .home__module { margin-top: 18px; }
h3 { margin-bottom: 10px; color: var(--el-text-color-secondary); font-size: 13px; font-weight: 500; }
.home__links { display: flex; flex-wrap: wrap; gap: 8px; }
.home__links button, .home__error button { display: inline-flex; align-items: center; gap: 8px; min-height: 36px; border: 1px solid var(--el-border-color); border-radius: 4px; padding: 0 12px; background: var(--el-bg-color); color: var(--el-text-color-primary); cursor: pointer; }
.home__links button:hover, .home__error button:hover { border-color: var(--el-color-primary); color: var(--el-color-primary); }
.home__empty { color: var(--el-text-color-secondary); }
.home__error { display: flex; align-items: center; gap: 12px; color: var(--el-color-danger); }
.home__notices { display: grid; gap: 0; margin: 0; padding: 0; list-style: none; }
.home__notices li { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; border-top: 1px solid var(--el-border-color-lighter); padding: 12px 0; }
.home__notices li:first-child { border-top: 0; }
.home__notices li div { display: grid; gap: 5px; min-width: 0; }
.home__notices strong { overflow-wrap: anywhere; font-size: 14px; font-weight: 500; }
.home__notices span, .home__notices time { color: var(--el-text-color-secondary); font-size: 12px; }
.home__notices time { flex: none; }
@media (max-width: 640px) { .home { padding: 16px; } .home__stats { width: 100%; justify-content: space-between; gap: 12px; } .home__notices li { flex-direction: column; gap: 6px; } }
</style>
