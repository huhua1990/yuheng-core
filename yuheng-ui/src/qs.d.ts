declare module 'qs' {
  const qs: {
    stringify(value: unknown, options?: Record<string, unknown>): string
  }
  export default qs
}
