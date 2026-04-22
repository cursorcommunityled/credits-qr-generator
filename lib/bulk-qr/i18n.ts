export type CardLocale = 'en' | 'es'

/**
 * All strings printed on the card. Kept here so the card components stay
 * presentational and translations live in one strongly-typed source.
 *
 * Spanish copy targets es-MX and intentionally leaves proper nouns like
 * "Team" (the name of a Cursor plan) untranslated.
 */
export interface CardCopy {
  eyebrow: string
  headline: string
  steps: {
    scan: string
    signIn: string
    redeem: string
  }
}

const COPY: Record<CardLocale, CardCopy> = {
  en: {
    eyebrow: 'Cursor credits',
    headline: 'Scan to redeem',
    steps: {
      scan: 'Scan the QR.',
      signIn: 'Sign in (personal account, not Team).',
      redeem: 'Redeem — applies to your next invoice.',
    },
  },
  es: {
    eyebrow: 'Créditos de Cursor',
    headline: 'Escanea para canjear',
    steps: {
      scan: 'Escanea el QR.',
      signIn: 'Inicia sesión (cuenta personal, no Team).',
      redeem: 'Canjéalo — se aplica a tu próxima factura.',
    },
  },
}

export function getCardCopy(locale: CardLocale): CardCopy {
  return COPY[locale]
}

export const CARD_LOCALE_OPTIONS: ReadonlyArray<{
  value: CardLocale
  label: string
  ariaLabel: string
}> = [
  { value: 'en', label: 'EN', ariaLabel: 'English' },
  { value: 'es', label: 'ES', ariaLabel: 'Spanish (Mexico)' },
]
