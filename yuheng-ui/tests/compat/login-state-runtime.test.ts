import { describe, expect, it } from 'vitest'
import { LoginStateEnum, useLoginState } from '../../compat/views/Login/components/useLogin'

describe('login state runtime', () => {
  it('creates and updates the shared login state in a package consumer', () => {
    const state = useLoginState()

    expect(state.getLoginState.value).toBe(LoginStateEnum.LOGIN)
    state.setLoginState(LoginStateEnum.RESET_PASSWORD)
    expect(state.getLoginState.value).toBe(LoginStateEnum.RESET_PASSWORD)
    state.handleBackLogin()
    expect(state.getLoginState.value).toBe(LoginStateEnum.LOGIN)
  })
})
