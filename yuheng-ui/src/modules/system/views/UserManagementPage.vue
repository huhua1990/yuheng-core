<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { getUserPage, type UserVO } from '../api/user'

defineOptions({ name: 'SystemUserPage' })

interface UserPageResult {
  list: UserVO[]
  total: number
}

const loading = ref(false)
const users = ref<UserVO[]>([])
const total = ref(0)
const filters = reactive({
  pageNo: 1,
  pageSize: 10,
  username: '',
  mobile: ''
})

async function loadUsers(): Promise<void> {
  loading.value = true
  try {
    const page = await getUserPage(filters) as UserPageResult
    users.value = page.list ?? []
    total.value = page.total ?? 0
  } finally {
    loading.value = false
  }
}

function search(): void {
  filters.pageNo = 1
  void loadUsers()
}

function changePage(pageNo: number): void {
  filters.pageNo = pageNo
  void loadUsers()
}

onMounted(loadUsers)
</script>

<template>
  <section class="yuheng-ui-page">
    <el-form :model="filters" inline @submit.prevent="search">
      <el-form-item label="用户名">
        <el-input v-model="filters.username" clearable placeholder="请输入用户名" @keyup.enter="search" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="filters.mobile" clearable placeholder="请输入手机号" @keyup.enter="search" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="users" stripe>
      <el-table-column prop="id" label="用户编号" width="110" />
      <el-table-column prop="username" label="用户名" min-width="140" />
      <el-table-column prop="nickname" label="昵称" min-width="140" />
      <el-table-column prop="deptName" label="部门" min-width="140" />
      <el-table-column prop="mobile" label="手机号" min-width="140" />
      <el-table-column prop="email" label="邮箱" min-width="180" />
    </el-table>
    <el-pagination
      class="yuheng-ui-user-page__pagination"
      background
      layout="total, prev, pager, next, sizes"
      :total="total"
      :current-page="filters.pageNo"
      :page-size="filters.pageSize"
      @current-change="changePage"
      @size-change="(size: number) => { filters.pageSize = size; search() }"
    />
  </section>
</template>

<style scoped>
.yuheng-ui-user-page__pagination { justify-content: flex-end; margin-top: 16px; }
</style>
