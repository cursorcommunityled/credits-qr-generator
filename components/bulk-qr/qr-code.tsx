"use client"

import { useEffect, useRef } from "react"
import type { CardTheme, QrStyle } from "@/lib/bulk-qr/types"
import { cn } from "@/lib/utils"

interface QrCodeProps {
  value: string
  size: number
  style: QrStyle
  theme: CardTheme
  className?: string
}

/**
 * Builds a monochrome SVG of the Cursor mark for embedding at the center
 * of the QR code. Returns a data URL so `qr-code-styling` can consume it.
 */
function buildLogoDataUrl(theme: CardTheme): string {
  // Circular background so the QR "clear area" reads as a badge.
  const bg = theme === "dark" ? "#ffffff" : "#000000"
  const fg = theme === "dark" ? "#000000" : "#ffffff"
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="22" fill="${bg}" />
      <g transform="translate(12 8) scale(1)" fill="${fg}">
        <path d="M12 0 0 6.9v10.9L12 24.7 24 17.8V6.9L12 0Z" opacity="0.95" />
        <path d="M12 0 0 6.9l12 6.9 12-6.9L12 0Z" fill="${fg}" opacity="0.75" />
        <path d="M0 6.9v10.9L12 24.7V13.8L0 6.9Z" fill="${fg}" opacity="0.55" />
      </g>
    </svg>
  `.trim()
  if (typeof window === "undefined") return ""
  return `data:image/svg+xml;base64,${window.btoa(svg)}`
}

export function QrCode({ value, size, style, theme, className }: QrCodeProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const instanceRef = useRef<unknown>(null)

  useEffect(() => {
    let cancelled = false

    async function render() {
      const host = hostRef.current
      if (!host) return

      const { default: QRCodeStyling } = await import("qr-code-styling")
      if (cancelled) return

      const isDark = theme === "dark"
      const dark = "#0a0a0a"
      const light = "#ffffff"

      const options = {
        width: size,
        height: size,
        data: value,
        margin: 0,
        qrOptions: {
          errorCorrectionLevel: "H" as const,
        },
        dotsOptions: {
          type: (style === "dots" ? "dots" : "square") as "dots" | "square",
          color: isDark ? light : dark,
        },
        backgroundOptions: {
          color: "transparent",
        },
        cornersSquareOptions: {
          type: (style === "dots" ? "extra-rounded" : "square") as
            | "extra-rounded"
            | "square",
          color: isDark ? light : dark,
        },
        cornersDotOptions: {
          type: (style === "dots" ? "dot" : "square") as "dot" | "square",
          color: isDark ? light : dark,
        },
        image: buildLogoDataUrl(theme),
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.28,
          margin: 2,
          crossOrigin: "anonymous" as const,
        },
      }

      type QRCtor = new (opts: unknown) => {
        append: (el: HTMLElement) => void
        update: (opts: unknown) => void
      }
      const Ctor = QRCodeStyling as unknown as QRCtor

      const existing = instanceRef.current as
        | { update: (opts: unknown) => void }
        | null

      if (existing) {
        existing.update(options)
      } else {
        const instance = new Ctor(options)
        host.innerHTML = ""
        instance.append(host)
        instanceRef.current = instance
      }
    }

    void render()
    return () => {
      cancelled = true
    }
  }, [value, size, style, theme])

  return (
    <div
      ref={hostRef}
      className={cn("flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-label="QR code"
    />
  )
}
