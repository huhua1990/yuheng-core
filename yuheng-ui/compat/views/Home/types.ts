export type WorkplaceTotal = {
  project: number
  access: number
  todo: number
}

export type Project = {
  name: string
  icon: string
  message: string
  personal: string
  time: Date | number | string
  color: string
}

export type Notice = {
  title: string
  type: string
  keys: string[]
  date: Date | number | string
}

export type Shortcut = {
  name: string
  icon: string
  url: string
  color: string
}

export type RadarData = {
  personal: number
  team: number
  max: number
  name: string
}
export type AnalysisTotalTypes = {
  users: number
  messages: number
  moneys: number
  shoppings: number
}

export type UserAccessSource = {
  value: number
  name: string
}

export type WeeklyUserActivity = {
  value: number
  name: string
}

export type MonthlySales = {
  name: string
  estimate: number
  actual: number
}
import type { PlatformRouteRecord } from 'yuheng-ui'

export interface HomeEntry {
  title: string
  path: string
  to: { name: string } | { path: string }
}

export interface HomeModule {
  title: string
  entries: HomeEntry[]
}

export function hasHomePermission(grants: readonly string[], required: string): boolean {
  if (grants.includes('*') || grants.includes(required)) return true
  const requiredParts = required.split(':')
  return grants.some((grant) => {
    const grantParts = grant.split(':')
    if (grantParts.length > requiredParts.length) return false
    return grantParts.every((part, index) => part === '*' || part === requiredParts[index]) &&
      (grantParts.length === requiredParts.length || grantParts.at(-1) === '*')
  })
}

function normalizePath(parent: string, child: string): string {
  if (/^https?:\/\//i.test(child) || child.startsWith('//')) return child
  const joined = child.startsWith('/') ? child : `${parent.replace(/\/$/, '')}/${child}`
  const segments: string[] = []
  for (const segment of joined.split('/')) {
    if (!segment || segment === '.') continue
    if (segment === '..') segments.pop()
    else segments.push(segment)
  }
  return `/${segments.join('/')}`
}

function routeTitle(route: PlatformRouteRecord): string {
  const metaTitle = route.meta?.title
  return typeof metaTitle === 'string' && metaTitle ? metaTitle : String(route.name ?? route.path)
}

export function buildHomeModules(
  routes: readonly PlatformRouteRecord[],
  grants: readonly string[]
): HomeModule[] {
  const modules: HomeModule[] = []
  const moduleByPath = new Map<string, HomeModule>()
  const seen = new Set<string>()

  const visit = (
    route: PlatformRouteRecord,
    parentPath: string,
    ancestorsVisible: boolean,
    groupTitle: string,
    groupKey: string
  ) => {
    const meta = route.meta as (typeof route.meta & { hidden?: boolean; permission?: string | string[] }) | undefined
    const visible = ancestorsVisible && meta?.hidden !== true &&
      (route.redirect === undefined || Boolean(route.children?.length))
    const path = normalizePath(parentPath, route.path)
    if (!visible || /^https?:\/\//i.test(path) || path.startsWith('//') || path.split('/').some((part) => part.startsWith(':'))) return

    const children = route.children as PlatformRouteRecord[] | undefined
    const isPage = !children?.length
    if (isPage) {
      const required = meta?.permission
      const allowed = required === undefined || (Array.isArray(required)
        ? required.some((permission) => hasHomePermission(grants, permission))
        : hasHomePermission(grants, required))
      if (!allowed || seen.has(path)) return
      seen.add(path)
      let group = moduleByPath.get(groupKey)
      if (!group) {
        group = { title: groupTitle, entries: [] }
        moduleByPath.set(groupKey, group)
        modules.push(group)
      }
      group.entries.push({
        title: routeTitle(route),
        path,
        to: route.name ? { name: String(route.name) } : { path }
      })
      return
    }

    for (const child of children ?? []) visit(child, path, visible, groupTitle, groupKey)
  }

  for (const route of routes) {
    const title = typeof route.meta?.title === 'string' ? route.meta.title : '平台管理'
    visit(route, '', true, title, normalizePath('', route.path))
  }
  return modules.filter((module) => module.entries.length > 0)
}

export function formatNoticeDate(value: Date | number | string | undefined): string {
  if (value === undefined || value === null || value === '') return '未提供发布时间'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '未提供发布时间'
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
