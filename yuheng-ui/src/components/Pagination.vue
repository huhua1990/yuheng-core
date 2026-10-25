<script setup lang="ts">
withDefaults(defineProps<{ total?: number; page?: number; pageSize?: number }>(), { total: 0, page: 1, pageSize: 20 })
const emit = defineEmits<{ change: [page: number] }>()
</script>
<template><el-pagination :total="total" :current-page="page" :page-size="pageSize" layout="total, prev, pager, next" @current-change="(value: number) => emit('change', value)" /></template>
