import type { ApiResponse } from '../contracts'

export class YuhengApiError extends Error {
  readonly code: number
  readonly response?: ApiResponse

  constructor(message: string, code: number, response?: ApiResponse) {
    super(message)
    this.name = 'YuhengApiError'
    this.code = code
    this.response = response
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
