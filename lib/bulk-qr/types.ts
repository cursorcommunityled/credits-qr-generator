export type CardTheme = "light" | "dark"
export type QrStyle = "square" | "dots"

export interface RedeemCode {
  id: string
  url: string
  /** The short code after the last slash, if any. Used as a file name hint. */
  code: string
}

export interface CardConfig {
  theme: CardTheme
  qrStyle: QrStyle
  eventName: string
}

export interface ThemeTokens {
  background: string
  foreground: string
  mutedForeground: string
  border: string
  accent: string
}

/** Physical card dimensions, in CSS pixels. This is the exact size used for export. */
export const CARD_WIDTH = 249
export const CARD_HEIGHT = 165

/** Size of the QR code rendered on the front of the card. */
export const QR_SIZE = 104

/**
 * Scale factor used for on-screen preview. The card still renders at its real
 * pixel size internally (so the export matches exactly), but is visually
 * enlarged via CSS transform. Keeps aspect ratio intact.
 */
export const PREVIEW_SCALE = 2
