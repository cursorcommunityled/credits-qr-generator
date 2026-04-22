import { forwardRef } from "react"
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  getCardTokens,
  type CardConfig,
} from "@/lib/bulk-qr/types"
import { CursorLogo, CursorWordmark } from "./cursor-logo"
import { cn } from "@/lib/utils"

interface QrCardBackProps {
  config: CardConfig
  className?: string
}

/**
 * Back of the card. Uses the same outer-frame + inner-container layout as
 * the front, centered around the Cursor mark, wordmark, and an optional
 * event/city name.
 */
export const QrCardBack = forwardRef<HTMLDivElement, QrCardBackProps>(function QrCardBack(
  { config, className },
  ref,
) {
  const tokens = getCardTokens(config.theme)
  const eventName = config.eventName.trim()

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden p-2 tracking-[-0.07em]", className)}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background: tokens.background,
        color: tokens.foreground,
      }}
      data-card-face="back"
    >
      <div
        className="flex h-full w-full items-center justify-center border"
        style={{
          background: tokens.container,
          borderColor: tokens.border,
        }}
      >
        <div className="flex flex-col items-center gap-2.5">
          <CursorLogo className="h-10 w-auto" />
          <CursorWordmark className="h-[18px] w-auto" />
          {eventName ? (
            <div className="flex flex-col items-center gap-1 pt-0.5">
              <span
                className="h-px w-8"
                style={{ background: tokens.border }}
                aria-hidden="true"
              />
              <span
                className="text-[10px] font-medium uppercase"
                style={{ color: tokens.mutedForeground }}
              >
                {eventName}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
})
