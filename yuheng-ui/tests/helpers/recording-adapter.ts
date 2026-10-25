import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

export interface RecordedRequest {
  config: InternalAxiosRequestConfig
  response?: AxiosResponse
  error?: unknown
}

export class RecordingAdapter {
  readonly requests: RecordedRequest[] = []
  private readonly responder: (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>

  constructor(responder: (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>) {
    this.responder = responder
  }

  adapter: AxiosAdapter = async (config) => {
    const record: RecordedRequest = { config }
    this.requests.push(record)
    try {
      record.response = await this.responder(config)
      return record.response
    } catch (error) {
      record.error = error
      throw error
    }
  }
}
