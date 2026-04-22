"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { QrCardFront } from "./qr-card-front"
import { QrCardBack } from "./qr-card-back"
import { CARD_HEIGHT, CARD_WIDTH, PREVIEW_SCALE, type CardConfig, type RedeemCode } from "@/lib/bulk-qr/types"

interface CardPreviewProps {
  codes: RedeemCode[]
  config: CardConfig
}

export function CardPreview({ codes, config }: CardPreviewProps) {
  const [index, setIndex] = useState(0)
  const [face, setFace] = useState<"front" | "back">("front")

  const currentIndex = Math.min(index, Math.max(0, codes.length - 1))
  const currentCode = codes[currentIndex]

  if (codes.length === 0) {
    return (
      <Empty className="h-full min-h-[360px] border border-dashed">
        <EmptyHeader>
          <EmptyTitle>Upload a CSV to preview</EmptyTitle>
          <EmptyDescription>
            Once you upload a file, you&apos;ll see each card render here with your styling applied.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={face} onValueChange={(value) => setFace(value as "front" | "back")}>
          <TabsList>
            <TabsTrigger value="front">Front</TabsTrigger>
            <TabsTrigger value="back">Back</TabsTrigger>
          </TabsList>
        </Tabs>
        {face === "front" && codes.length > 1 ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIndex((i) => (i - 1 + codes.length) % codes.length)}
              aria-label="Previous card"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <span className="min-w-[72px] text-center font-mono text-xs tabular-nums text-muted-foreground">
              {currentIndex + 1} / {codes.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIndex((i) => (i + 1) % codes.length)}
              aria-label="Next card"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        ) : null}
      </div>

      <div
        className="flex items-center justify-center rounded-2xl border border-border bg-secondary/40 p-8"
        data-theme-preview={config.theme}
      >
        <div
          style={{
            width: CARD_WIDTH * PREVIEW_SCALE,
            height: CARD_HEIGHT * PREVIEW_SCALE,
          }}
          aria-label={`Card preview at ${PREVIEW_SCALE}x scale`}
        >
          <div
            style={{
              transform: `scale(${PREVIEW_SCALE})`,
              transformOrigin: "top left",
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
            }}
          >
            {face === "front" && currentCode ? (
              <QrCardFront code={currentCode} config={config} />
            ) : (
              <QrCardBack config={config} />
            )}
          </div>
        </div>
      </div>

      {face === "front" && currentCode ? (
        <EmptyContent className="flex flex-col items-center gap-1 text-center">
          <span className="font-mono text-[11px] text-muted-foreground break-all">
            {currentCode.url}
          </span>
        </EmptyContent>
      ) : null}
    </div>
  )
}
