<script setup lang="ts">
defineProps<{ data?: unknown[] }>()
</script>
<template>
  <el-table v-bind="$attrs" :data="data ?? []">
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
  </el-table>
</template>
