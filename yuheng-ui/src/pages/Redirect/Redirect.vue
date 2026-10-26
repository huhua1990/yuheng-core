<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute(); const router = useRouter()
onMounted(() => { const target = String(route.query.redirect ?? route.params.path ?? '/'); void router.replace(target.startsWith('/') ? target : `/${target}`) })
</script>
<template><div class="yuheng-ui-page">正在跳转…</div></template>
