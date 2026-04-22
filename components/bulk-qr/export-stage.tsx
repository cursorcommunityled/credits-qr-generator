"use client"

import { forwardRef, useImperativeHandle, useRef } from "react"
import { QrCardBack } from "./qr-card-back"
import { QrCardFront } from "./qr-card-front"
import type { CardConfig, RedeemCode } from "@/lib/bulk-qr/types"

export interface ExportStageHandle {
  getFrontNode: (codeId: string) => HTMLElement | null
  getBackNode: () => HTMLElement | null
}

interface ExportStageProps {
  codes: RedeemCode[]
  config: CardConfig
}

/**
 * Off-screen stage that renders every card at full physical size so
 * html-to-image can capture them. Positioned outside the viewport
 * (instead of `display: none`) so layout and canvases actually paint.
 */
export const ExportStage = forwardRef<ExportStageHandle, ExportStageProps>(
  function ExportStage({ codes, config }, ref) {
    const frontRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
    const backRef = useRef<HTMLDivElement | null>(null)

    useImperativeHandle(
      ref,
      () => ({
        getFrontNode: (codeId: string) => frontRefs.current.get(codeId) ?? null,
        getBackNode: () => backRef.current,
      }),
      [],
    )

    return (
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: -10000,
          top: 0,
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        {codes.map((code) => (
          <QrCardFront
            key={code.id}
            code={code}
            config={config}
            ref={(node) => {
              frontRefs.current.set(code.id, node)
            }}
          />
        ))}
        <QrCardBack ref={backRef} config={config} />
      </div>
    )
  },
)
