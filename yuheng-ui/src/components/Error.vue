<script setup lang="ts">
defineProps<{ code?: number | string; message?: string }>()
</script>
<template><div class="yuheng-ui-error"><strong>{{ code }}</strong><p>{{ message }}</p><slot /></div></template>
