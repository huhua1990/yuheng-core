import type { TokenSnapshot, TokenStore } from '../../src/auth/token'

export class MemoryTokenStore implements TokenStore {
  private snapshot: TokenSnapshot = {}

  getAccessToken(): string | undefined {
    return this.snapshot.accessToken
  }

  getRefreshToken(): string | undefined {
    return this.snapshot.refreshToken
  }

  setToken(snapshot: TokenSnapshot): void {
    this.snapshot = { ...this.snapshot, ...snapshot }
  }

  removeToken(): void {
    this.snapshot = {}
  }

  getSnapshot(): TokenSnapshot {
    return { ...this.snapshot }
  }
}
