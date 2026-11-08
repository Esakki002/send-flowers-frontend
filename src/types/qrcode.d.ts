declare module 'qrcode' {
  export interface QRCodeModules {
    size: number;
    data: Uint8Array;
  }

  export interface QRCode {
    modules: QRCodeModules;
  }

  export function create(
    text: string,
    options: { errorCorrectionLevel: 'H' },
  ): QRCode;
}
