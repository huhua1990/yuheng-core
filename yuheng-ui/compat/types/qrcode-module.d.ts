declare module 'qrcode' {
  export interface QRCodeRenderersOptions {
    errorCorrectionLevel?: string
    margin?: number
    scale?: number
    width?: number
    color?: { dark?: string; light?: string }
  }

  const QRCode: {
    toCanvas: (canvas: HTMLCanvasElement, text: string, options: QRCodeRenderersOptions) => Promise<HTMLCanvasElement>
    toDataURL: (text: string, options: QRCodeRenderersOptions) => Promise<string>
  }
  export default QRCode
}
