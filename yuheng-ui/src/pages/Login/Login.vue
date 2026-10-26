<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { inject } from 'vue'
import { YUHENG_UI_CONTEXT, type YuhengUiContext } from '../../runtime/options'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const context = inject<YuhengUiContext | undefined>(YUHENG_UI_CONTEXT)
const userStore = context ? useUserStore(context.pinia) : undefined
const form = reactive({ username: '', password: '' })
const loading = ref(false)
const error = ref('')
const submit = async () => {
  error.value = ''
  loading.value = true
  try {
    if (userStore && context) await userStore.login(context, form)
    await router.push('/')
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '登录失败'
  } finally { loading.value = false }
}
</script>
<template>
  <main class="yuheng-ui-page" style="display:grid;place-items:center;min-height:100vh">
    <el-card style="width:min(420px,100%)"><h1>{{ context?.options.appTitle ?? 'Yuheng' }}</h1><p v-if="error" role="alert">{{ error }}</p>
      <el-form @submit.prevent="submit"><el-form-item label="用户名"><el-input v-model="form.username" autocomplete="username" /></el-form-item><el-form-item label="密码"><el-input v-model="form.password" type="password" autocomplete="current-password" show-password /></el-form-item><el-button native-type="submit" type="primary" :loading="loading">登录</el-button></el-form>
    </el-card>
  </main>
</template>
