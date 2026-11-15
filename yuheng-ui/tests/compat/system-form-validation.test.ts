// @vitest-environment happy-dom
import { createApp, defineComponent, h, nextTick, reactive, ref, type App, type Component } from 'vue'
import { ElButton, ElForm, ElFormItem, ElInput, ElOption, ElSelect } from 'element-plus'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// These legacy SFCs use consumer auto-import declarations. Load them at runtime
// without expanding the public package's typecheck into the whole compat tree.
const loadForm = async (path: string): Promise<Component> => (await import(/* @vite-ignore */ path)).default
const NoticeForm = await loadForm('../../compat/views/system/notice/NoticeForm.vue')
const PostForm = await loadForm('../../compat/views/system/post/PostForm.vue')
// Use the real CommonJS distribution for Node's dependency interop. The ESM
// distribution is bundled by Vite in consumers; no validator is mocked here.
vi.mock('element-plus', async () => {
  const { createRequire } = await import('node:module')
  return createRequire(import.meta.url)('element-plus')
})

const api = vi.hoisted(() => ({ get: vi.fn(), create: vi.fn(), update: vi.fn(), success: vi.fn() }))
vi.mock('../../compat/api/system/notice/index.ts', () => ({
  getNotice: api.get, createNotice: api.create, updateNotice: api.update
}))
vi.mock('../../compat/api/system/post/index.ts', () => ({
  getPost: api.get, createPost: api.create, updatePost: api.update
}))
vi.mock('../../compat/utils/dict.ts', () => ({
  DICT_TYPE: { SYSTEM_NOTICE_TYPE: 'notice', COMMON_STATUS: 'status' },
  getIntDictOptions: (type: string) => type === 'notice'
    ? [{ label: '通知', value: 1 }, { label: '公告', value: 2 }]
    : [{ label: '开启', value: 0 }, { label: '关闭', value: 1 }]
}))

let app: App | undefined
let host: HTMLDivElement
const settle = async () => {
  for (let i = 0; i < 8; i++) {
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}
const cases = [
  { name: 'notice', component: NoticeForm, required: ['公告标题不能为空', '公告内容不能为空', '公告类型不能为空'],
    data: { id: 42, title: '隔离公告', content: '<p>内容</p>', type: 1, status: 0, remark: '' } },
  { name: 'post', component: PostForm, required: ['岗位标题不能为空', '岗位编码不能为空'],
    data: { id: 42, name: '隔离岗位', code: 'validation-post', sort: 9, status: 0, remark: '' } }
]
const mount = (component: Component) => {
  const errors: unknown[] = []
  const onSuccess = vi.fn()
  host = document.createElement('div')
  document.body.append(host)
  app = createApp(component, { onSuccess })
  // Keep the real Element Plus form/rules and controls. Only the dialog shell
  // and rich editor are replaced to avoid layout/editor browser dependencies.
  app.component('Dialog', defineComponent({
    props: ['modelValue'],
    setup: (props, { slots }) => () => props.modelValue
      ? h('section', { role: 'dialog' }, [slots.default?.(), slots.footer?.()]) : null
  }))
  app.component('Editor', defineComponent({
    props: ['modelValue'], emits: ['update:modelValue'],
    setup: (props, { emit }) => () => h('textarea', {
      value: props.modelValue,
      onInput: (event: Event) => emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
    })
  }))
  for (const [name, component] of Object.entries({ ElButton, ElForm, ElFormItem, ElInput, ElOption, ElSelect })) {
    app.component(name, component)
  }
  app.directive('loading', {})
  app.config.errorHandler = (error) => errors.push(error)
  const vm = app.mount(host) as unknown as { open: (type: string, id?: number) => Promise<void> }
  const submit = async () => {
    const button = [...host.querySelectorAll('button')].find((button) => button.textContent?.replace(/\s/g, '') === '确定')
    expect(button).toBeDefined()
    button!.click()
    await settle()
  }
  return { vm, errors, onSuccess, submit }
}

beforeEach(() => {
  vi.resetAllMocks()
  api.create.mockResolvedValue(1)
  api.update.mockResolvedValue(true)
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

describe.each(cases)('$name form submission with real Element Plus validation', ({ component, required, data, name }) => {
  it('keeps required messages without a rejected event or API write', async () => {
    const view = mount(component)
    await view.vm.open('create')
    await settle()
    await view.submit()
    await new Promise((resolve) => setTimeout(resolve, 130))
    await nextTick()
    for (const message of required) expect(host.textContent).toContain(message)
    expect(api.create).not.toHaveBeenCalled()
    expect(api.update).not.toHaveBeenCalled()
    expect(view.onSuccess).not.toHaveBeenCalled()
    expect(host.querySelector('[role=dialog]')).not.toBeNull()
    expect(view.errors).toEqual([])
  })

  it.each(['create', 'update'])('preserves valid %s submission and success notification', async (type) => {
    const view = mount(component)
    if (type === 'update') {
      api.get.mockResolvedValue({ ...data })
      await view.vm.open('update', data.id)
    } else {
      await view.vm.open('create')
      await settle()
      const values = name === 'notice' ? [data.title] : [data.name, data.code, String(data.sort)]
      const inputs = [...host.querySelectorAll<HTMLInputElement>('input.el-input__inner')]
      for (let index = 0; index < values.length; index++) {
        inputs[index].value = values[index]!
        inputs[index].dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (name === 'notice') {
        const editor = host.querySelector('textarea')!
        editor.value = data.content!
        editor.dispatchEvent(new Event('input', { bubbles: true }))
        await settle()
        ;(host.querySelector('.el-select__wrapper') as HTMLElement).click()
        await settle()
        const option = [...document.querySelectorAll<HTMLElement>('.el-select-dropdown__item')].find((node) => node.textContent === '通知')
        expect(option).toBeDefined()
        option!.click()
      }
    }
    await settle()
    await view.submit()
    expect(type === 'create' ? api.create : api.update).toHaveBeenCalledTimes(1)
    expect(type === 'create' ? api.update : api.create).not.toHaveBeenCalled()
    const payload = (type === 'create' ? api.create : api.update).mock.calls[0][0]
    expect(payload).toMatchObject(name === 'notice'
      ? { title: data.title, content: data.content, type: 1, status: 0 }
      : { name: data.name, code: data.code, sort: type === 'create' ? '9' : 9, status: 0 })
    expect(api.success).toHaveBeenCalledWith(`common.${type}Success`)
    expect(view.onSuccess).toHaveBeenCalledTimes(1)
    expect(host.querySelector('[role=dialog]')).toBeNull()
    expect(view.errors).toEqual([])
  })

  it('propagates API failure and releases loading without emitting success', async () => {
    const failure = new Error('API unavailable')
    api.get.mockResolvedValue({ ...data })
    api.update.mockRejectedValue(failure)
    const view = mount(component)
    await view.vm.open('update', data.id)
    await settle()
    await view.submit()
    expect(view.errors).toEqual([failure])
    expect(view.onSuccess).not.toHaveBeenCalled()
    expect(api.success).not.toHaveBeenCalled()
    expect(host.querySelector('[role=dialog]')).not.toBeNull()
    expect(host.querySelector('button')!.disabled).toBe(false)
  })
})
