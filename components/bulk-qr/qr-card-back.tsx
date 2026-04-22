import { forwardRef } from "react"
import { CARD_HEIGHT, CARD_WIDTH, type CardConfig } from "@/lib/bulk-qr/types"
import { CursorLogo, CursorWordmark } from "./cursor-logo"
import { cn } from "@/lib/utils"

interface QrCardBackProps {
  config: CardConfig
  className?: string
}

export const QrCardBack = forwardRef<HTMLDivElement, QrCardBackProps>(function QrCardBack(
  { config, className },
  ref,
) {
  const isDark = config.theme === "dark"
  const eventName = config.eventName.trim()

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden",
        isDark ? "bg-neutral-950 text-neutral-50" : "bg-white text-neutral-950",
        className,
      )}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 14,
        boxShadow: isDark
          ? "inset 0 0 0 1px rgba(255,255,255,0.08)"
          : "inset 0 0 0 1px rgba(0,0,0,0.08)",
      }}
      data-card-face="back"
    >
      <div className="flex flex-col items-center gap-2.5">
        <CursorLogo className="h-10 w-auto" />
        <CursorWordmark className="h-[18px] w-auto" />
        {eventName ? (
          <div className="flex flex-col items-center gap-1 pt-0.5">
            <span
              className={cn(
                "h-px w-8",
                isDark ? "bg-neutral-700" : "bg-neutral-300",
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-[0.22em]",
                isDark ? "text-neutral-300" : "text-neutral-600",
              )}
            >
              {eventName}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
})
