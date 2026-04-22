"use client"

import { useMemo } from "react"
import type { PdfLayout } from "@/lib/bulk-qr/pdf"

interface PdfLayoutPreviewProps {
  layout: PdfLayout
  /** How many of the cards on the first page are actually filled. */
  filledOnFirstPage: number
}

/**
 * Scale-accurate preview of the PDF layout. The SVG viewBox is the paper in
 * millimeters, so strokes and positions directly match the print output.
 *
 * The component is purely visual — it never mutates state and can be fed any
 * layout (including empty ones) without blowing up.
 */
export function PdfLayoutPreview({
  layout,
  filledOnFirstPage,
}: PdfLayoutPreviewProps) {
  const {
    pageWidthMm,
    pageHeightMm,
    marginMm,
    gapMm,
    cardWidthMm,
    cardHeightMm,
    cols,
    rows,
    offsetXMm,
    offsetYMm,
  } = layout

  const cards = useMemo(() => {
    if (cols <= 0 || rows <= 0) return []
    const items: Array<{ x: number; y: number; filled: boolean; key: string }> = []
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const index = row * cols + col
        items.push({
          key: `${row}-${col}`,
          x: offsetXMm + col * (cardWidthMm + gapMm),
          y: offsetYMm + row * (cardHeightMm + gapMm),
          filled: index < filledOnFirstPage,
        })
      }
    }
    return items
  }, [cols, rows, offsetXMm, offsetYMm, cardWidthMm, cardHeightMm, gapMm, filledOnFirstPage])

  // Scale strokes so they read as ~1px on screen regardless of paper size.
  // The preview container is ~400px wide; the factor keeps strokes thin at any zoom.
  const strokeWidth = Math.max(pageWidthMm, pageHeightMm) / 400

  return (
    <div className="flex items-center justify-center rounded-lg border border-border bg-secondary/40 p-4">
      <svg
        role="img"
        aria-label={`Preview of ${cols} by ${rows} card grid on ${pageWidthMm.toFixed(0)} by ${pageHeightMm.toFixed(0)} millimeter paper`}
        viewBox={`0 0 ${pageWidthMm} ${pageHeightMm}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-auto max-h-[320px] w-full"
      >
        {/* Page */}
        <rect
          x={0}
          y={0}
          width={pageWidthMm}
          height={pageHeightMm}
          className="fill-background stroke-border"
          strokeWidth={strokeWidth}
        />

        {/* Margin guide */}
        {marginMm > 0 ? (
          <rect
            x={marginMm}
            y={marginMm}
            width={Math.max(0, pageWidthMm - 2 * marginMm)}
            height={Math.max(0, pageHeightMm - 2 * marginMm)}
            fill="none"
            className="stroke-muted-foreground/40"
            strokeWidth={strokeWidth}
            strokeDasharray={`${strokeWidth * 3} ${strokeWidth * 3}`}
          />
        ) : null}

        {/* Cards */}
        {cards.map((card) => (
          <g key={card.key}>
            <rect
              x={card.x}
              y={card.y}
              width={cardWidthMm}
              height={cardHeightMm}
              rx={cardWidthMm * 0.025}
              ry={cardWidthMm * 0.025}
              className={
                card.filled
                  ? "fill-foreground/85"
                  : "fill-muted/60"
              }
              stroke="none"
            />
            {/* Tiny QR dot to hint card orientation */}
            <rect
              x={card.x + cardWidthMm * 0.07}
              y={card.y + (cardHeightMm - cardHeightMm * 0.55) / 2}
              width={cardHeightMm * 0.55}
              height={cardHeightMm * 0.55}
              className={
                card.filled ? "fill-background" : "fill-muted-foreground/30"
              }
              rx={cardHeightMm * 0.04}
              ry={cardHeightMm * 0.04}
            />
          </g>
        ))}

        {cards.length === 0 ? (
          <text
            x={pageWidthMm / 2}
            y={pageHeightMm / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-destructive"
            style={{
              fontSize: Math.min(pageWidthMm, pageHeightMm) * 0.05,
              fontFamily: "var(--font-sans, system-ui, sans-serif)",
            }}
          >
            No cards fit
          </text>
        ) : null}
      </svg>
    </div>
  )
}
