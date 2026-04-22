'use client'

import { useEffect, useRef } from 'react'
import {
  getCardTokens,
  type CardTheme,
  type QrStyle,
} from '@/lib/bulk-qr/types'
import { cn } from '@/lib/utils'

interface QrCodeProps {
  value: string
  size: number
  style: QrStyle
  theme: CardTheme
  className?: string
}

/**
 * Internal render resolution for the QR. We render at a high resolution and
 * let CSS scale it down so dots/edges stay crisp regardless of the final
 * `size` prop. 1024 is plenty for both on-screen preview and print export.
 */
const RENDER_SIZE = 1024

/**
 * Builds a monochrome SVG of the Cursor mark for embedding at the center
 * of the QR code. Returns a data URL so `qr-code-styling` can consume it.
 *
 * Uses the official Cursor mark (132×150) centered inside a circular badge,
 * with colors inverted from the QR's foreground so it reads against the
 * "hidden background dots" clear area.
 */
function buildLogoDataUrl(theme: CardTheme): string {
  const tokens = getCardTokens(theme)
  // Circle fill matches the card's inner container so the logo badge blends
  // seamlessly into the cleared QR area; the mark itself uses the foreground.
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="76" fill="${tokens.container}" />
      <g transform="translate(36 30) scale(0.6667)" fill="${tokens.foreground}">
        <path d="M129.37 35.5041L69.1266 0.83515C67.1921 -0.278383 64.8051 -0.278383 62.8706 0.83515L2.63021 35.5041C1.00401 36.44 0 38.1709 0 40.0456V109.956C0 111.83 1.00401 113.561 2.63021 114.497L62.8734 149.166C64.8079 150.28 67.1949 150.28 69.1294 149.166L129.373 114.497C130.999 113.561 132.003 111.83 132.003 109.956V40.0456C132.003 38.1709 130.999 36.44 129.373 35.5041H129.37ZM125.586 42.8478L67.4296 143.252C67.0365 143.928 65.9986 143.652 65.9986 142.868V77.1249C65.9986 75.8112 65.2944 74.5962 64.1518 73.9365L7.0337 41.0661C6.35494 40.6743 6.6321 39.6397 7.41834 39.6397H123.73C125.382 39.6397 126.414 41.4241 125.589 42.8506H125.586V42.8478Z" />
      </g>
    </svg>
  `.trim()
  if (typeof window === 'undefined') return ''
  return `data:image/svg+xml;base64,${window.btoa(svg)}`
}

type QrDotType = 'dots' | 'square'
type QrCornerSquareType = 'extra-rounded' | 'square'
type QrCornerDotType = 'dot' | 'square'

interface QrStyleVariant {
  dots: QrDotType
  cornersSquare: QrCornerSquareType
  cornersDot: QrCornerDotType
}

function getStyleVariant(style: QrStyle): QrStyleVariant {
  if (style === 'dots') {
    return { dots: 'dots', cornersSquare: 'extra-rounded', cornersDot: 'dot' }
  }
  return { dots: 'square', cornersSquare: 'square', cornersDot: 'square' }
}

export function QrCode({ value, size, style, theme, className }: QrCodeProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    const host = hostRef.current
    if (!host) return

    async function render() {
      const { default: QRCodeStyling } = await import('qr-code-styling')
      if (cancelled || !host) return

      const tokens = getCardTokens(theme)
      const fg = tokens.foreground
      const variant = getStyleVariant(style)

      const options = {
        // SVG output is resolution-independent — CSS resizes it cleanly.
        type: 'svg' as const,
        width: RENDER_SIZE,
        height: RENDER_SIZE,
        data: value,
        margin: 0,
        qrOptions: {
          errorCorrectionLevel: 'H' as const,
        },
        dotsOptions: {
          type: variant.dots,
          color: fg,
        },
        backgroundOptions: {
          color: 'transparent',
        },
        cornersSquareOptions: {
          type: variant.cornersSquare,
          color: fg,
        },
        cornersDotOptions: {
          type: variant.cornersDot,
          color: fg,
        },
        image: buildLogoDataUrl(theme),
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.26,
          margin: 4,
          crossOrigin: 'anonymous' as const,
        },
      }

      type QRCtor = new (opts: unknown) => {
        append: (el: HTMLElement) => void
      }
      const Ctor = QRCodeStyling as unknown as QRCtor
      const instance = new Ctor(options)

      // Always recreate: qr-code-styling's `update()` does not reliably
      // swap dot/corner types between "dots" and "square".
      host.innerHTML = ''
      instance.append(host)

      // Force the rendered SVG to fill the host so CSS can scale it down.
      const svg = host.querySelector('svg')
      if (svg) {
        svg.setAttribute('width', '100%')
        svg.setAttribute('height', '100%')
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
        svg.style.display = 'block'
      }
    }

    void render()
    return () => {
      cancelled = true
    }
  }, [value, style, theme])

  return (
    <div
      ref={hostRef}
      className={cn(
        'flex items-center justify-center overflow-hidden',
        className,
      )}
      style={{ width: size, height: size }}
      aria-label="QR code"
    />
  )
}
