<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
  }>(),
  { description: '该基础设施页面已纳入 yuheng-ui，默认不包含 infra/demo 样例路由。' }
)
</script>

<template>
  <section class="yuheng-ui-page" style="padding:24px">
    <el-card>
      <template #header><strong>{{ title }}</strong></template>
      <p>{{ description }}</p>
      <slot />
    </el-card>
  </section>
</template>
