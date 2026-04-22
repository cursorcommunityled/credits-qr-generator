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
 *
 * Uses the official Cursor mark (132×150) centered inside a circular badge,
 * with colors inverted from the QR's foreground so it reads against the
 * "hidden background dots" clear area.
 */
function buildLogoDataUrl(theme: CardTheme): string {
  const bg = theme === "dark" ? "#ffffff" : "#0a0a0a"
  const fg = theme === "dark" ? "#0a0a0a" : "#ffffff"
  // 160×160 badge with a 132×150 mark centered inside (leaves padding).
  // Mark offset: x = (160-88)/2 = 36, y = (160-100)/2 = 30, mark scaled to 88×100.
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="76" fill="${bg}" />
      <g transform="translate(36 30) scale(0.6667)" fill="${fg}">
        <path d="M129.37 35.5041L69.1266 0.83515C67.1921 -0.278383 64.8051 -0.278383 62.8706 0.83515L2.63021 35.5041C1.00401 36.44 0 38.1709 0 40.0456V109.956C0 111.83 1.00401 113.561 2.63021 114.497L62.8734 149.166C64.8079 150.28 67.1949 150.28 69.1294 149.166L129.373 114.497C130.999 113.561 132.003 111.83 132.003 109.956V40.0456C132.003 38.1709 130.999 36.44 129.373 35.5041H129.37ZM125.586 42.8478L67.4296 143.252C67.0365 143.928 65.9986 143.652 65.9986 142.868V77.1249C65.9986 75.8112 65.2944 74.5962 64.1518 73.9365L7.0337 41.0661C6.35494 40.6743 6.6321 39.6397 7.41834 39.6397H123.73C125.382 39.6397 126.414 41.4241 125.589 42.8506H125.586V42.8478Z" />
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
