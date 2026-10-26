import { h, type Component } from 'vue'
import type { PlatformRouteRecord } from '../../../contracts'
import InfraModulePage from '../views/InfraModulePage.vue'

function page(title: string): Component {
  return {
    name: `${title.replace(/[^a-zA-Z0-9]+/g, '')}Page`,
    setup() {
      return () => h(InfraModulePage, { title })
    }
  }
}

export const infraRoutes: PlatformRouteRecord[] = [
  ['api-access-log', 'API 访问日志', 'infra:api-access-log:list'],
  ['api-error-log', 'API 错误日志', 'infra:api-error-log:list'],
  ['codegen', '代码生成', 'infra:codegen:list'],
  ['config', '参数配置', 'infra:config:list'],
  ['data-source-config', '数据源配置', 'infra:data-source-config:list'],
  ['file', '文件管理', 'infra:file:list'],
  ['file-config', '文件配置', 'infra:file-config:list'],
  ['job', '定时任务', 'infra:job:list'],
  ['job/log', '任务日志', 'infra:job-log:list'],
  ['redis', 'Redis 监控', 'infra:redis:monitor'],
  ['server', '服务器监控', 'infra:server:monitor'],
  ['swagger', '接口文档', 'infra:swagger:access'],
  ['skywalking', '链路追踪', 'infra:skywalking:access'],
  ['websocket', 'WebSocket', 'infra:web-socket:access']
].map(([segment, title, permission]) => ({
  path: `/infra/${segment}`,
  name: `Infra${segment
    .split('/')
    .map((part) => part.replace(/(^|-)([a-z])/g, (_, _separator, char) => char.toUpperCase()))
    .join('')}`,
  component: page(title),
  meta: { title, permission }
}))
