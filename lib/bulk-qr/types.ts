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

/** Physical card dimensions, in CSS pixels. */
export const CARD_WIDTH = 328.81
export const CARD_HEIGHT = 249

/** Size of the QR code rendered on the front of the card. */
export const QR_SIZE = 180
