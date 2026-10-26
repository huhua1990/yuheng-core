<script setup lang="ts">
import { inject } from 'vue'
import { YUHENG_UI_CONTEXT, type YuhengUiContext } from '../../runtime/options'
import { useUserStore } from '../../stores/user'
const context = inject<YuhengUiContext | undefined>(YUHENG_UI_CONTEXT)
const user = context ? useUserStore(context.pinia) : undefined
</script>
<template><div class="yuheng-ui-page"><el-card><h1>个人中心</h1><dl><dt>用户</dt><dd>{{ user?.userInfo?.nickname ?? user?.userInfo?.username ?? '未登录' }}</dd></dl></el-card></div></template>
