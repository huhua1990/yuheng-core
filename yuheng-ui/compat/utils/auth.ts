import { getPlatformContext } from '../runtime'
import { useUserStore } from 'yuheng-ui'
export const getAccessToken = () => getPlatformContext().tokenStore.getAccessToken()
export const getRefreshToken = () => getPlatformContext().tokenStore.getRefreshToken()
export const setToken = (token: any) => { const ctx = getPlatformContext(); ctx.tokenStore.setToken(token); ctx.initialized = false }
export const removeToken = () => { const ctx = getPlatformContext(); ctx.tokenStore.removeToken(); ctx.initialized = false }
export const formatToken = (token: string) => `Bearer ${token}`
export const getCurrentUserId = () => Number(useUserStore(getPlatformContext().pinia).userInfo?.id ?? 0)
export const getTenantId = () => getPlatformContext().tenantStore.getTenantContext().tenantId
export const setTenantId = (tenantId: number | string) => getPlatformContext().tenantStore.setTenantContext({ tenantId: String(tenantId) })
export const getVisitTenantId = () => getPlatformContext().tenantStore.getTenantContext().visitTenantId
export const setVisitTenantId = (visitTenantId: number | string) => getPlatformContext().tenantStore.setTenantContext({ visitTenantId: String(visitTenantId) })
export interface LoginFormType { tenantName: string; username: string; password: string; rememberMe: boolean }
export function getLoginForm(): LoginFormType | undefined { try { const text=localStorage.getItem('YUHENG_LOGIN_FORM'); return text ? JSON.parse(text) : undefined } catch { return undefined } }
export function setLoginForm(form: LoginFormType) { localStorage.setItem('YUHENG_LOGIN_FORM', JSON.stringify({ ...form, password: '' })) }
export function removeLoginForm() { localStorage.removeItem('YUHENG_LOGIN_FORM') }
