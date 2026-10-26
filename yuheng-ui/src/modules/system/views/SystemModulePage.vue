<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
  }>(),
  { description: '该平台页面已纳入 yuheng-ui，业务消费端可直接注册和扩展。' }
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
