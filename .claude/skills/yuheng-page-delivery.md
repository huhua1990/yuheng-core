---
name: yuheng-page-delivery
description: Specialized frontend page development and delivery
---

# Yuheng Page Delivery

专项前端页面开发交付。

## 输入

- 前端页面开发任务
- 页面设计说明
- API 接口设计

## 输出

- 完整的 Vue 页面代码
- API 封装
- 通过的页面验证

## 执行流程

### 1. 读取任务

从开发计划中提取前端任务：
- 需要创建哪些页面
- 需要调用哪些 API
- 需要哪些组件

### 2. 创建 API 封装

遵守 `@rules/frontend-code-style.md`：

```javascript
// api/product.js
import { request } from 'yuheng-ui'

export const page = (params) => request.post('/api/product/page', params)
export const create = (data) => request.post('/api/product/create', data)
export const update = (data) => request.post('/api/product/update', data)
export const deleteById = (id) => request.post('/api/product/delete', { id })
```

### 3. 创建页面

遵守三级目录结构：`views/{group}/{module}/index.vue`

```vue
<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <el-form :model="queryForm" inline>
      <el-form-item label="名称">
        <el-input v-model="queryForm.name" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row class="mb-2">
      <el-button type="primary" @click="handleCreate">新增</el-button>
    </el-row>

    <!-- 数据表格 -->
    <el-table :data="tableData" border>
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="status" label="状态" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleUpdate(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="queryForm.pageNo"
      v-model:page-size="queryForm.pageSize"
      :total="total"
      @current-change="getList"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { page, create, update, deleteById } from '@/api/product'

const queryForm = ref({ pageNo: 1, pageSize: 10 })
const tableData = ref([])
const total = ref(0)

const getList = async () => {
  const res = await page(queryForm.value)
  if (res.code === 0) {
    tableData.value = res.data.list
    total.value = res.data.total
  }
}

onMounted(() => {
  getList()
})
</script>
```

### 4. 页面验证

- 页面可正常访问
- API 调用正常
- 数据显示正确
- 操作按钮有效
- Console 无错误

### 5. 交付检查

遵守 `@rules/yuheng-delivery-check.md`：
- [ ] 页面可访问
- [ ] 复用框架 Store
- [ ] 无重复请求
- [ ] Console 无错误

## 使用方法

```
输入：前端页面开发任务
AI：创建 API + 页面 + 验证...
```

## 相关规则

- `@rules/frontend-code-style.md` - 前端代码规范
- `@rules/api-response-convention.md` - API 响应规范
- `@rules/yuheng-delivery-check.md` - 交付检查
