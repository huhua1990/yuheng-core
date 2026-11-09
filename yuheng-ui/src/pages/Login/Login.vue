<script setup lang="ts">
import { computed, inject, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Icon as IconifyIcon } from '@iconify/vue'
import 'animate.css'
import type { YuhengUiContext } from '../../runtime/options'
import { YUHENG_UI_CONTEXT } from '../../runtime/options'
import { useUserStore } from '../../stores/user'
import { usePermissionStore } from '../../stores/permission'
import { registerRoutes } from '../../router/guards'
import logoUrl from '../../assets/logo.png'
import loginBoxBgUrl from '../../assets/login-box-bg.svg'

defineOptions({ name: 'YuhengLoginPage' })
const context = inject<YuhengUiContext | undefined>(YUHENG_UI_CONTEXT)
const pinia = context?.pinia
const userStore = useUserStore(pinia)
const permissionStore = usePermissionStore(pinia)
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const redirect = computed(() => String(route.query.redirect ?? '/'))
const formRef = ref()
const tenantEnabled = computed(() => context?.options.tenantEnabled ?? false)
const form = reactive({
  tenantName: '',
  username: '',
  password: '',
  rememberMe: true
})
const loadRememberedUsername = () => {
  try {
    form.username = window.localStorage.getItem('YUHENG_REMEMBERED_USERNAME') ?? ''
    form.rememberMe = Boolean(form.username)
  } catch {
    form.rememberMe = false
  }
}
const resolveTenant = async () => {
  if (!context || !tenantEnabled.value) return
  const website = await context.request.get<{ id: number; name: string } | null>(
    '/system/tenant/get-by-website',
    { params: { website: window.location.host } }
  )
  if (website?.id) {
    form.tenantName = website.name
    context.tenantStore.setTenantContext({ tenantId: String(website.id) })
  }
}
onMounted(() => {
  loadRememberedUsername()
  void resolveTenant().catch(() => undefined)
})
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}
const submit = async () => {
  await formRef.value?.validate()
  loading.value = true
  try {
    if (!context) throw new Error('Yuheng context is unavailable')
    if (tenantEnabled.value) {
      const tenantId = await context.request.get<number | null>('/system/tenant/get-id-by-name', {
        params: { name: form.tenantName }
      })
      if (!tenantId) throw new Error('租户不存在，请检查租户名称')
      context.tenantStore.setTenantContext({ tenantId: String(tenantId) })
    }
    await userStore.login(context, { ...form })
    const info = await userStore.fetchUserInfo(context)
    const menus = Array.isArray(info.menus) ? (info.menus as import('../../contracts').MenuNode[]) : []
    const routes = await permissionStore.generateRoutes(context, menus, info.permissions ?? [], 'menus')
    registerRoutes(router, routes, 'Home')
    if (context) context.initialized = true
    await router.replace(redirect.value)
    try {
      if (form.rememberMe) window.localStorage.setItem('YUHENG_REMEMBERED_USERNAME', form.username)
      else window.localStorage.removeItem('YUHENG_REMEMBERED_USERNAME')
    } catch {
      // Remembering a username is optional when browser storage is unavailable.
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '登录失败')
  } finally {
    loading.value = false
  }
}
const socialList = [
  { icon: 'ant-design:wechat-filled', type: 30 },
  { icon: 'ant-design:dingtalk-circle-filled', type: 20 },
  { icon: 'ant-design:github-filled', type: 0 },
  { icon: 'ant-design:alipay-circle-filled', type: 0 }
]
</script>
<template>
  <div class="yuheng-ui-login">
    <aside class="yuheng-ui-login__hero">
      <div class="yuheng-ui-login__brand">
        <img :src="logoUrl" alt="logo" />
        <span>Yuheng</span>
      </div>
      <transition appear enter-active-class="animate__animated animate__bounceInLeft">
        <div class="yuheng-ui-login__hero-body">
          <img class="yuheng-ui-login__hero-image" :src="loginBoxBgUrl" alt="" />
          <h2>欢迎使用本系统</h2>
          <p>开箱即用的中后台管理系统</p>
        </div>
      </transition>
    </aside>
    <section class="yuheng-ui-login__panel">
      <transition appear enter-active-class="animate__animated animate__bounceInRight">
        <el-card class="yuheng-ui-login__card">
          <h2 class="yuheng-ui-login__title">欢迎回来</h2>
          <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large" @keyup.enter="submit">
            <el-form-item v-if="tenantEnabled" prop="tenantName">
              <el-input v-model="form.tenantName" placeholder="请输入租户名称">
                <template #prefix><IconifyIcon icon="ep:house" /></template>
              </el-input>
            </el-form-item>
            <el-form-item prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名">
                <template #prefix><IconifyIcon icon="ep:avatar" /></template>
              </el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="form.password" type="password" show-password placeholder="请输入密码">
                <template #prefix><IconifyIcon icon="ep:lock" /></template>
              </el-input>
            </el-form-item>
            <div class="yuheng-ui-login__row">
              <el-checkbox v-model="form.rememberMe">记住我</el-checkbox>
              <el-link type="primary">忘记密码?</el-link>
            </div>
            <el-button class="yuheng-ui-login__submit" type="primary" size="large" :loading="loading" @click="submit">
              登录
            </el-button>
            <el-divider>其他登录方式</el-divider>
            <div class="yuheng-ui-login__social">
              <IconifyIcon
                v-for="item in socialList"
                :key="item.icon"
                :icon="item.icon"
                :size="28"
                color="#8d9399"
              />
            </div>
          </el-form>
        </el-card>
      </transition>
    </section>
  </div>
</template>
<style scoped>
.yuheng-ui-login { display:flex; width:100%; min-height:100vh; background:#f2f5f8; color:#303133; }
.yuheng-ui-login__hero { position:relative; flex:1 1 50%; display:flex; flex-direction:column; padding:30px; background:rgba(100,100,100,.2); overflow:auto; }
.yuheng-ui-login__brand { display:flex; align-items:center; gap:10px; font-size:20px; font-weight:700; }
.yuheng-ui-login__brand img { width:48px; height:48px; }
.yuheng-ui-login__hero-body { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; }
.yuheng-ui-login__hero-image { width:350px; max-width:80%; }
.yuheng-ui-login__panel { flex:1 1 50%; display:flex; align-items:center; justify-content:center; padding:30px; overflow:auto; background:#fff; }
.yuheng-ui-login__card { width:100%; max-width:500px; color:var(--el-text-color-primary); }
.yuheng-ui-login__title { margin:0 0 20px; text-align:center; }
.yuheng-ui-login__row { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
.yuheng-ui-login__submit { width:100%; }
.yuheng-ui-login__social { display:flex; justify-content:space-between; padding:0 20px; cursor:pointer; }
@media (max-width:720px) { .yuheng-ui-login { background:#fff; } .yuheng-ui-login__hero { display:none; } .yuheng-ui-login__panel { padding:18px; } .yuheng-ui-login__card { border:0; box-shadow:none; } }
</style>
