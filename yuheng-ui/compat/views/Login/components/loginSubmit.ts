export async function submitLogin(options: {
  validate: () => Promise<unknown>
  tenant: () => Promise<unknown>
  login: () => Promise<unknown>
  report: (message: string) => void
  tenantRequired?: boolean
}): Promise<void> {
  try {
    if (!await options.validate()) return
  } catch {
    return
  }
  try {
    const tenant = await options.tenant()
    if (options.tenantRequired && (tenant === null || tenant === undefined || tenant === '')) {
      throw new Error('租户不存在')
    }
    await options.login()
  } catch (error) {
    options.report(error instanceof Error ? error.message : '登录失败，请重试')
  }
}
