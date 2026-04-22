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

/**
 * All color roles used inside a printed card. Both sides and the embedded
 * QR all derive their colors from here, so the theme is edited in one place.
 */
export interface CardColorTokens {
  /** Card outer background (outside the inner container). */
  background: string
  /** Inner container fill — also used as the QR's effective background. */
  container: string
  /** Inner container hairline border. */
  border: string
  /** Main text, Cursor logo/wordmark, and QR dots. */
  foreground: string
  /** Secondary labels, event/city name, divider caps. */
  mutedForeground: string
  /** Accent color for "Scan to redeem" and the raw redeem link. */
  accent: string
}

const DARK_CARD_TOKENS: CardColorTokens = {
  background: "#15120B",
  container: "#1C1B16",
  border: "#33322D",
  foreground: "#FDFDFB",
  mutedForeground: "#969590",
  accent: "#D95910",
}

const LIGHT_CARD_TOKENS: CardColorTokens = {
  background: "#FAFAF9",
  container: "#F5F5F4",
  border: "#D6D3D1",
  foreground: "#0C0A09",
  mutedForeground: "#57534D",
  accent: "#CE530D",
}

export function getCardTokens(theme: CardTheme): CardColorTokens {
  return theme === "dark" ? DARK_CARD_TOKENS : LIGHT_CARD_TOKENS
}

/** Physical card dimensions, in CSS pixels. This is the exact size used for export. */
export const CARD_WIDTH = 249
export const CARD_HEIGHT = 165

/**
 * Size of the QR code rendered on the front of the card.
 * Must fit inside the QR column (30% of ~231px inner width ≈ 69px).
 */
export const QR_SIZE = 64

/**
 * Scale factor used for on-screen preview. The card still renders at its real
 * pixel size internally (so the export matches exactly), but is visually
 * enlarged via CSS transform. Keeps aspect ratio intact.
 */
export const PREVIEW_SCALE = 2
