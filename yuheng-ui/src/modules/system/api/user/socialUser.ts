import { systemRequest as request } from '../request'

// 社交绑定，使用 code 授权码
export const socialBind = (type: string, code: string, state: string) => {
  return request.post({
    url: '/system/social-user/bind',
    data: {
      type,
      code,
      state
    }
  })
}

// 取消社交绑定
export const socialUnbind = (type: string, openid: string) => {
  return request.delete({
    url: '/system/social-user/unbind',
    data: {
      type,
      openid
    }
  })
}

// 社交授权的跳转
export const socialAuthRedirect = (type: string, redirectUri: string) => {
  return request.get({
    url: '/system/auth/social-auth-redirect?type=' + type + '&redirectUri=' + redirectUri
  })
}
