import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const apiRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../src/modules/system/api')

const requiredPaths = [
  'user/index.ts:/system/user/page',
  'role/index.ts:/system/role/page',
  'dept/index.ts:/system/dept/list',
  'menu/index.ts:/system/menu/list',
  'tenant/index.ts:/system/tenant/page',
  'dict/dict.data.ts:/system/dict-data/page',
  'dict/dict.type.ts:/system/dict-type/page',
  'notice/index.ts:/system/notice/page',
  'oauth2/client.ts:/system/oauth2-client/page',
  'oauth2/token.ts:/system/oauth2-token/page',
  'social/user/index.ts:/system/social-user/get-bind-list',
  'post/index.ts:/system/post/page',
  'loginLog/index.ts:/system/login-log/page',
  'sms/smsChannel/index.ts:/system/sms-channel/page',
  'sms/smsLog/index.ts:/system/sms-log/page',
  'sms/smsTemplate/index.ts:/system/sms-template/page',
  'mail/account/index.ts:/system/mail-account/page',
  'mail/log/index.ts:/system/mail-log/page',
  'mail/template/index.ts:/system/mail-template/page',
  'notify/message/index.ts:/system/notify-message/page',
  'notify/template/index.ts:/system/notify-template/page'
]

describe('system API compatibility', () => {
  it('keeps the baseline system endpoint paths', () => {
    for (const item of requiredPaths) {
      const separator = item.indexOf(':')
      const file = item.slice(0, separator)
      const endpoint = item.slice(separator + 1)
      const source = readFileSync(resolve(apiRoot, file), 'utf8')
      expect(source, `${file} should contain ${endpoint}`).toContain(endpoint)
      expect(source).not.toContain("@/config/axios")
    }
  })
})
