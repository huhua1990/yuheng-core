import { defineComponent, h, type Component } from 'vue'
import type { PlatformRouteRecord } from '../../../contracts'
import SystemModulePage from '../views/SystemModulePage.vue'
import UserManagementPage from '../views/UserManagementPage.vue'
import RoleManagementPage from '../views/RoleManagementPage.vue'
import SystemDataListPage from '../views/SystemDataListPage.vue'
import type { SystemListApiKey } from '../views/SystemDataListPage.vue'

function page(title: string): Component {
  return {
    name: `${title.replace(/[^a-zA-Z0-9]+/g, '')}Page`,
    setup() {
      return () => h(SystemModulePage, { title })
    }
  }
}

// Kept as a stable route contract while individual baseline screens are migrated in later increments.
export const systemRoutes: PlatformRouteRecord[] = ([
  ['user', '用户管理', 'system:user:list'],
  ['role', '角色管理', 'system:role:list'],
  ['dept', '部门管理', 'system:dept:list'],
  ['post', '岗位管理', 'system:post:list'],
  ['menu', '菜单管理', 'system:menu:list'],
  ['tenant', '租户管理', 'system:tenant:list'],
  ['tenant-package', '租户套餐', 'system:tenant-package:list'],
  ['dict', '字典管理', 'system:dict:list'],
  ['notice', '通知公告', 'system:notice:list'],
  ['login-log', '登录日志', 'system:login-log:list'],
  ['operate-log', '操作日志', 'system:operate-log:list'],
  ['oauth2/client', 'OAuth2 客户端', 'system:oauth2-client:list'],
  ['oauth2/token', 'OAuth2 令牌', 'system:oauth2-token:list'],
  ['social/client', '社交客户端', 'system:social-client:list'],
  ['social/user', '社交用户', 'system:social-user:list'],
  ['sms/channel', '短信渠道', 'system:sms-channel:list'],
  ['sms/log', '短信日志', 'system:sms-log:list'],
  ['sms/template', '短信模板', 'system:sms-template:list'],
  ['mail/account', '邮件账号', 'system:mail-account:list'],
  ['mail/log', '邮件日志', 'system:mail-log:list'],
  ['mail/template', '邮件模板', 'system:mail-template:list'],
  ['notify/message', '站内信', 'system:notify-message:list'],
  ['notify/template', '站内信模板', 'system:notify-template:list'],
  ['area', '地区管理', 'system:area:list']
] as (string | [string, string, string] | PlatformRouteRecord)[]).map((entry) => {
  if (typeof entry !== 'string' && 'path' in entry) {
    return entry
  }
  const [segment, title, permission] = entry as [string, string, string]
  return {
  path: `/system/${segment}`,
  name: `System${segment
    .split('/')
    .map((part) => part.replace(/(^|-)([a-z])/g, (_, _separator, char) => char.toUpperCase()))
    .join('')}`,
  component: (() => {
    const apiKeys: Record<string, string> = {
      post: 'getPostPage',
      menu: 'getMenuList',
      tenant: 'getTenantPage',
      'tenant-package': 'getTenantPackagePage',
      dict: 'getDictTypePage',
      notice: 'getNoticePage',
      'login-log': 'getLoginLogPage',
      'operate-log': 'getOperateLogPage',
      'oauth2/client': 'getOAuth2ClientPage',
      'oauth2/token': 'getAccessTokenPage',
      'social/client': 'getSocialClientPage',
      'social/user': 'getSocialUserPage',
      'sms/channel': 'getSmsChannelPage',
      'sms/log': 'getSmsLogPage',
      'sms/template': 'getSmsTemplatePage',
      'mail/account': 'getMailAccountPage',
      'mail/log': 'getMailLogPage',
      'mail/template': 'getMailTemplatePage',
      'notify/message': 'getNotifyMessagePage',
      'notify/template': 'getNotifyTemplatePage'
    }
    if (segment === 'user') return UserManagementPage
    if (segment === 'role') return RoleManagementPage
    const apiKey = apiKeys[segment]
    return apiKey
      ? defineComponent({
          name: `${String(permission).replace(/[^a-zA-Z0-9]/g, '')}Page`,
          setup: () => () => h(SystemDataListPage, { apiKey: apiKey as SystemListApiKey, title })
        })
      : page(title)
  })(),
  meta: { title, permission }
  }
})
