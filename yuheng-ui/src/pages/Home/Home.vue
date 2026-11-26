<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon as IconifyIcon } from '@iconify/vue'
import * as echarts from 'echarts'
import { cloneDeep } from 'lodash-es'
import 'animate.css'
defineOptions({ name: 'YuhengHomePage' })
const router = useRouter()
const loading = ref(true)
const total = reactive({ project: 0, access: 0, todo: 0 })
const projects = reactive([
  { name: 'ruoyi-vue-pro', icon: 'simple-icons:springboot', message: 'github.com/YunaiV/ruoyi-vue-pro', personal: 'Spring Boot 单体架构', time: '2025-01-02', color: '#6DB33F' },
  { name: '平台管理端', icon: 'ep:element-plus', message: '通用平台 UI', personal: 'Vue3 + element-plus 管理后台', time: '2025-02-03', color: '#409EFF' },
  { name: 'yudao-mall-uniapp', icon: 'icon-park-outline:mall-bag', message: 'github.com/yudaocode/yudao-mall-uniapp', personal: 'Vue3 + uniapp 商城手机端', time: '2025-03-04', color: '#ff4d4f' },
  { name: 'yudao-cloud', icon: 'material-symbols:cloud-outline', message: 'github.com/YunaiV/yudao-cloud', personal: 'Spring Cloud 微服务架构', time: '2025-04-05', color: '#1890ff' },
  { name: 'yudao-ui-admin-vben', icon: 'devicon:antdesign', message: 'github.com/yudaocode/yudao-ui-admin-vben', personal: 'Vue3 + vben5(antd) 管理后台', time: '2025-05-06', color: '#e18525' },
  { name: 'yudao-ui-admin-uniapp', icon: 'ant-design:mobile', message: 'github.com/yudaocode/yudao-ui-admin-uniapp', personal: 'Vue3 + uniapp 手机端', time: '2025-06-01', color: '#2979ff' }
])
const notice = reactive([
  { title: '系统支持 JDK 8/17/21，Vue 2/3', type: '技术兼容性', keys: ['JDK','Vue'], date: new Date() },
  { title: '后端提供 Spring Boot 2.7/3.2 + Cloud 双架构', type: '架构灵活性', keys: ['Boot','Cloud'], date: new Date() },
  { title: '全部开源，个人与企业可 100% 直接使用，无需授权', type: '开源免授权', keys: ['无需授权'], date: new Date() },
  { title: '国内使用最广泛的快速开发平台', type: '项目优势', keys: ['快速开发'], date: new Date() }
])
const shortcut = reactive([
  { name: '首页', icon: 'ion:home-outline', url: '/', color: '#1fdaca' },
  { name: '用户管理', icon: 'ep:user', url: '/system/user', color: '#ff6b6b' },
  { name: '角色管理', icon: 'ep:avatar', url: '/system/role', color: '#7c3aed' },
  { name: '参数配置', icon: 'ep:setting', url: '/infra/config', color: '#3fb27f' },
  { name: 'API 访问日志', icon: 'ep:document', url: '/infra/api-access-log', color: '#4daf1bc9' },
  { name: '个人中心', icon: 'ep:user-filled', url: '/profile', color: '#1a73e8' }
])
const pieEl = ref<HTMLElement>()
const barEl = ref<HTMLElement>()
const pieOptions = {
  title: { text: '用户访问来源', left: 'center' },
  tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)' },
  legend: { orient:'vertical', left:'left' },
  series: [{ name:'用户访问来源', type:'pie', radius:'55%', center:['50%','60%'], data:[
    { value:335, name:'直接访问' }, { value:310, name:'邮件营销' },
    { value:234, name:'联盟广告' }, { value:135, name:'视频广告' },
    { value:1548, name:'搜索引擎' }
  ]}]
}
const barOptionsData = reactive(cloneDeep({
  title: { text: '每周用户活跃量', left: 'center' },
  tooltip: { trigger:'axis', axisPointer:{ type:'shadow' } },
  grid: { left:50, right:20, bottom:20 },
  xAxis: { type:'category', data:['周一','周二','周三','周四','周五','周六','周日'] },
  yAxis: { type:'value' },
  series: [{ name:'活跃量', data:[13253,34235,26321,12340,24643,1322,1324], type:'bar' }]
}) as Record<string, any>)
let pieChart: echarts.ECharts | undefined
let barChart: echarts.ECharts | undefined
onMounted(async () => {
  Object.assign(total, { project: 40, access: 2340, todo: 10 })
  if (pieEl.value) {
    pieChart = echarts.init(pieEl.value)
    pieChart.setOption(pieOptions)
  }
  if (barEl.value) {
    barChart = echarts.init(barEl.value)
    barChart.setOption(barOptionsData)
  }
  const resize = () => { pieChart?.resize(); barChart?.resize() }
  window.addEventListener('resize', resize)
  onBeforeUnmount(() => {
    window.removeEventListener('resize', resize)
    pieChart?.dispose()
    barChart?.dispose()
  })
  loading.value = false
})
</script>
<template>
  <div v-loading="loading" class="yuheng-ui-page">
    <el-row :gutter="16" class="yuheng-ui-home__stats">
      <el-col :span="8"><el-card><el-statistic title="项目数" :value="total.project" /></el-card></el-col>
      <el-col :span="8"><el-card><el-statistic title="项目访问" :value="total.access" /></el-card></el-col>
      <el-col :span="8"><el-card><el-statistic title="待办" :value="total.todo" /></el-card></el-col>
    </el-row>
    <el-row :gutter="16">
      <el-col :md="14" :xs="24">
        <el-card>
          <template #header>项目</template>
          <el-table :data="projects" size="small">
            <el-table-column prop="name" label="项目名" />
            <el-table-column prop="personal" label="技术栈" />
            <el-table-column prop="time" label="发布时间" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :md="10" :xs="24">
        <el-card class="yuheng-ui-home__shortcut">
          <template #header>快捷入口</template>
          <el-row :gutter="8">
            <el-col v-for="item in shortcut" :key="item.url" :span="8">
              <el-button text @click="router.push(item.url)">
                <IconifyIcon :icon="item.icon" :style="{ color: item.color }" />
                {{ item.name }}
              </el-button>
            </el-col>
          </el-row>
        </el-card>
        <el-card class="yuheng-ui-home__notice">
          <template #header>通知公告</template>
          <el-timeline>
            <el-timeline-item v-for="item in notice" :key="item.title" :timestamp="item.type">
              <el-tag v-for="key in item.keys" :key="key" class="yuheng-ui-home__tag">{{ key }}</el-tag>
              {{ item.title }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      <el-col :md="12" :xs="24"><el-card><div ref="pieEl" class="yuheng-ui-home__chart" /></el-card></el-col>
      <el-col :md="12" :xs="24"><el-card><div ref="barEl" class="yuheng-ui-home__chart" /></el-card></el-col>
    </el-row>
  </div>
</template>
<style scoped>
.yuheng-ui-home__stats { margin-bottom:16px; }
.yuheng-ui-home__shortcut, .yuheng-ui-home__notice { margin-bottom:16px; }
.yuheng-ui-home__chart { width:100%; height:300px; }
.yuheng-ui-home__tag { margin-right:4px; }
</style>
