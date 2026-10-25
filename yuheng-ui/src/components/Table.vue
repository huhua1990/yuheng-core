<script setup lang="ts">
defineProps<{ data?: unknown[] }>()
</script>
<template><el-table v-bind="$attrs" :data="data ?? []"><slot /></el-table></template>
