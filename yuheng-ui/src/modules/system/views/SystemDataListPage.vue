<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import * as api from '../api'

defineOptions({ name: 'SystemDataListPage' })

const props = defineProps<{ apiKey: string; title: string }>()
type Row = Record<string, unknown>
export type SystemListApiKey = string
interface PageResult { list?: Row[]; total?: number }

const loaders: Record<string, (params: Record<string, unknown>) => Promise<unknown>> = {
  getMenuList: (params) => api.getMenuList(params),
  getPostPage: (params) => api.getPostPage(params),
  getTenantPage: (params) => api.getTenantPage(params as never),
  getTenantPackagePage: (params) => api.getTenantPackagePage(params),
  getDictTypePage: (params) => api.getDictTypePage(params),
  getNoticePage: (params) => api.getNoticePage(params),
  getLoginLogPage: (params) => api.getLoginLogPage(params),
  getOperateLogPage: (params) => api.getOperateLogPage(params),
  getOAuth2ClientPage: (params) => api.getOAuth2ClientPage(params),
  getAccessTokenPage: (params) => api.getAccessTokenPage(params),
  getSocialClientPage: (params) => api.getSocialClientPage(params),
  getSocialUserPage: (params) => api.getSocialUserPage(params),
  getSmsChannelPage: (params) => api.getSmsChannelPage(params),
  getSmsLogPage: (params) => api.getSmsLogPage(params),
  getSmsTemplatePage: (params) => api.getSmsTemplatePage(params),
  getMailAccountPage: (params) => api.getMailAccountPage(params),
  getMailLogPage: (params) => api.getMailLogPage(params),
  getMailTemplatePage: (params) => api.getMailTemplatePage(params),
  getNotifyMessagePage: (params) => api.getNotifyMessagePage(params),
  getNotifyTemplatePage: (params) => api.getNotifyTemplatePage(params)
}

const infraLoaders: Record<string, (params: Record<string, unknown>) => Promise<unknown>> = {
  'infra:api-access-log': (params) => import('../../infra/api').then((module) => module.getApiAccessLogPage(params)),
  'infra:api-error-log': (params) => import('../../infra/api').then((module) => module.getApiErrorLogPage(params)),
  'infra:file': (params) => import('../../infra/api').then((module) => module.getFilePage(params)),
  'infra:file-config': (params) => import('../../infra/api').then((module) => module.getFileConfigPage(params)),
  'infra:job': (params) => import('../../infra/api').then((module) => module.getJobPage(params)),
  'infra:job-log': (params) => import('../../infra/api').then((module) => module.getJobLogPage(params)),
  'infra:codegen': (params) => import('../../infra/api').then((module) => module.getCodegenTablePage(params))
}

const loading = ref(false)
const rows = ref<Row[]>([])
const total = ref(0)
const filters = reactive({ pageNo: 1, pageSize: 10, keyword: '' })
const columns = computed(() => Object.keys(rows.value[0] ?? {}).filter((key) => !['rawTokenInfo', 'rawUserInfo'].includes(key)))

async function load(): Promise<void> {
  const loader = loaders[props.apiKey] ?? infraLoaders[props.apiKey]
  if (!loader) return
  loading.value = true
  try {
    const result = await loader(filters) as PageResult
    rows.value = result?.list ?? []
    total.value = result?.total ?? 0
  } finally {
    loading.value = false
  }
}

function search(): void {
  filters.pageNo = 1
  void load()
}

onMounted(load)
</script>

<template>
  <section class="yuheng-ui-page">
    <el-form :model="filters" inline @submit.prevent="search">
      <el-form-item label="关键字"><el-input v-model="filters.keyword" clearable @keyup.enter="search" /></el-form-item>
      <el-form-item><el-button type="primary" @click="search">查询</el-button></el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="rows" stripe>
      <el-table-column v-for="column in columns" :key="column" :prop="column" :label="column" min-width="140" show-overflow-tooltip />
      <template #empty>{{ loading ? '加载中' : `${title}暂无数据` }}</template>
    </el-table>
    <el-pagination
      class="yuheng-ui-system-list__pagination"
      background layout="total, prev, pager, next, sizes"
      :total="total" :current-page="filters.pageNo" :page-size="filters.pageSize"
      @current-change="(page: number) => { filters.pageNo = page; void load() }"
      @size-change="(size: number) => { filters.pageSize = size; search() }"
    />
  </section>
</template>

<style scoped>
.yuheng-ui-system-list__pagination { justify-content: flex-end; margin-top: 16px; }
</style>
