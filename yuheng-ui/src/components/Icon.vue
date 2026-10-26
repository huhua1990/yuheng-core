<script setup lang="ts">
defineProps<{ name?: string }>()
</script>
<template><span class="yuheng-ui-icon" :aria-label="name"><slot>{{ name }}</slot></span></template>
