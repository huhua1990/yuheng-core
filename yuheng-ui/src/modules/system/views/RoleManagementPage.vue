<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { getRolePage, type RoleVO } from '../api/role'

defineOptions({ name: 'SystemRolePage' })

interface RolePageResult {
  list: RoleVO[]
  total: number
}

const loading = ref(false)
const roles = ref<RoleVO[]>([])
const total = ref(0)
const filters = reactive({ pageNo: 1, pageSize: 10, name: '', code: '' })

async function loadRoles(): Promise<void> {
  loading.value = true
  try {
    const page = await getRolePage(filters) as RolePageResult
    roles.value = page.list ?? []
    total.value = page.total ?? 0
  } finally {
    loading.value = false
  }
}

function search(): void {
  filters.pageNo = 1
  void loadRoles()
}

onMounted(loadRoles)
</script>

<template>
  <section class="yuheng-ui-page">
    <el-form :model="filters" inline @submit.prevent="search">
      <el-form-item label="角色名称">
        <el-input v-model="filters.name" clearable placeholder="请输入角色名称" @keyup.enter="search" />
      </el-form-item>
      <el-form-item label="角色标识">
        <el-input v-model="filters.code" clearable placeholder="请输入角色标识" @keyup.enter="search" />
      </el-form-item>
      <el-form-item><el-button type="primary" @click="search">查询</el-button></el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="roles" stripe>
      <el-table-column prop="id" label="编号" width="100" />
      <el-table-column prop="name" label="角色名称" min-width="160" />
      <el-table-column prop="code" label="角色标识" min-width="180" />
      <el-table-column prop="sort" label="排序" width="100" />
      <el-table-column prop="createTime" label="创建时间" min-width="180" />
    </el-table>
    <el-pagination
      class="yuheng-ui-role-page__pagination"
      background
      layout="total, prev, pager, next, sizes"
      :total="total"
      :current-page="filters.pageNo"
      :page-size="filters.pageSize"
      @current-change="(page: number) => { filters.pageNo = page; void loadRoles() }"
      @size-change="(size: number) => { filters.pageSize = size; search() }"
    />
  </section>
</template>

<style scoped>
.yuheng-ui-role-page__pagination { justify-content: flex-end; margin-top: 16px; }
</style>
