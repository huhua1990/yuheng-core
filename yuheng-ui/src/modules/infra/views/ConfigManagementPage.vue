<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { getConfigPage, type ConfigVO } from '../api/config'

defineOptions({ name: 'InfraConfigPage' })

interface ConfigPageResult {
  list: ConfigVO[]
  total: number
}

const loading = ref(false)
const configs = ref<ConfigVO[]>([])
const total = ref(0)
const filters = reactive({ pageNo: 1, pageSize: 10, key: '', name: '', type: undefined as number | undefined })

async function loadConfigs(): Promise<void> {
  loading.value = true
  try {
    const page = await getConfigPage(filters) as ConfigPageResult
    configs.value = page.list ?? []
    total.value = page.total ?? 0
  } finally {
    loading.value = false
  }
}

function search(): void {
  filters.pageNo = 1
  void loadConfigs()
}

onMounted(loadConfigs)
</script>

<template>
  <section class="yuheng-ui-page">
    <el-form :model="filters" inline @submit.prevent="search">
      <el-form-item label="参数名称">
        <el-input v-model="filters.name" clearable placeholder="请输入参数名称" @keyup.enter="search" />
      </el-form-item>
      <el-form-item label="参数键名">
        <el-input v-model="filters.key" clearable placeholder="请输入参数键名" @keyup.enter="search" />
      </el-form-item>
      <el-form-item><el-button type="primary" @click="search">查询</el-button></el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="configs" stripe>
      <el-table-column prop="id" label="编号" width="100" />
      <el-table-column prop="category" label="分类" width="140" />
      <el-table-column prop="name" label="参数名称" min-width="180" />
      <el-table-column prop="key" label="参数键名" min-width="220" />
      <el-table-column prop="value" label="参数值" min-width="220" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" min-width="180" />
    </el-table>
    <el-pagination
      class="yuheng-ui-config-page__pagination"
      background
      layout="total, prev, pager, next, sizes"
      :total="total"
      :current-page="filters.pageNo"
      :page-size="filters.pageSize"
      @current-change="(page: number) => { filters.pageNo = page; void loadConfigs() }"
      @size-change="(size: number) => { filters.pageSize = size; search() }"
    />
  </section>
</template>

<style scoped>
.yuheng-ui-config-page__pagination { justify-content: flex-end; margin-top: 16px; }
</style>
