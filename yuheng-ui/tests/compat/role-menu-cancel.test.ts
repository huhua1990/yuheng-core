// @vitest-environment happy-dom
import { createApp, defineComponent, h, nextTick, reactive, ref, type App, type Component } from 'vue'
import { ElButton, ElCard, ElForm, ElFormItem, ElSwitch, ElTag, ElTree } from 'element-plus'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const api = vi.hoisted(() => ({ getRoleMenus: vi.fn(), getSimpleMenus: vi.fn(), assign: vi.fn(), success: vi.fn() }))
vi.mock('../../compat/api/system/role/index.ts', () => ({}))
vi.mock('../../compat/api/system/menu/index.ts', () => ({ getSimpleMenusList: api.getSimpleMenus }))
vi.mock('../../compat/api/system/permission/index.ts', () => ({
  getRoleMenuList: api.getRoleMenus,
  assignRoleMenu: api.assign
}))
vi.mock('../../compat/utils/tree.ts', () => ({
  defaultProps: { children: 'children', label: 'name' },
  handleTree: (items: unknown[]) => items
}))

const loadForm = async (path: string): Promise<Component> => (await import(/* @vite-ignore */ path)).default
const RoleAssignMenuForm = await loadForm('../../compat/views/system/role/RoleAssignMenuForm.vue')

let app: App | undefined
let host: HTMLDivElement

const settle = async () => {
  for (let i = 0; i < 8; i++) {
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}

beforeEach(() => {
  vi.resetAllMocks()
  api.getSimpleMenus.mockResolvedValue([{ id: 10, name: 'System', children: [{ id: 11, name: 'Users' }] }])
  api.getRoleMenus.mockResolvedValue([11])
  api.assign.mockResolvedValue(true)
  vi.stubGlobal('ref', ref)
  vi.stubGlobal('reactive', reactive)
  vi.stubGlobal('useI18n', () => ({ t: (key: string) => key }))
  vi.stubGlobal('useMessage', () => ({ success: api.success }))
})

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('role menu assignment cancellation', () => {
  it('closes after changing a menu selection without saving or emitting success', async () => {
    host = document.createElement('div')
    document.body.append(host)
    const onSuccess = vi.fn()
    app = createApp(RoleAssignMenuForm, { onSuccess })
    app.component('Dialog', defineComponent({
      props: ['modelValue'],
      setup: (props, { slots }) => () => props.modelValue
        ? h('section', { role: 'dialog' }, [slots.default?.(), slots.footer?.()]) : null
    }))
    for (const [name, component] of Object.entries({ ElButton, ElCard, ElForm, ElFormItem, ElSwitch, ElTag, ElTree })) {
      app.component(name, component)
    }
    app.directive('loading', {})
    const vm = app.mount(host) as unknown as { open: (role: { id: number; name: string; code: string }) => Promise<void> }
    await vm.open({ id: 2, name: '普通角色', code: 'normal' })
    await settle()

    const tree = host.querySelector('.el-tree')
    expect(tree).not.toBeNull()
    const expand = host.querySelector<HTMLElement>('.el-tree-node__expand-icon')
    expect(expand).not.toBeNull()
    expand!.click()
    await settle()
    const userCheckbox = host.querySelectorAll<HTMLInputElement>('.el-checkbox__original')[1]
    expect(userCheckbox).toBeDefined()
    const checkedBefore = host.querySelectorAll('.el-tree-node.is-checked').length
    userCheckbox!.click()
    await settle()
    expect(host.querySelectorAll('.el-tree-node.is-checked').length).not.toBe(checkedBefore)

    const cancel = [...host.querySelectorAll('button')].find((button) => button.textContent?.replace(/\s/g, '') === '取消')
    expect(cancel).toBeDefined()
    cancel!.click()
    await settle()

    expect(api.assign).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
    expect(host.querySelector('[role=dialog]')).toBeNull()
  })
})
