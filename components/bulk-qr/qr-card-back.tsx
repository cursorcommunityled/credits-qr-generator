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
      <div className="flex flex-col items-center gap-4">
        <CursorLogo className="h-16 w-auto" />
        <CursorWordmark className="h-7 w-auto" />
        {eventName ? (
          <div className="flex flex-col items-center gap-1.5 pt-1">
            <span
              className={cn(
                "h-px w-8",
                isDark ? "bg-neutral-700" : "bg-neutral-300",
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                "text-[11px] font-medium uppercase tracking-[0.22em]",
                isDark ? "text-neutral-300" : "text-neutral-600",
              )}
            >
              {eventName}
            </span>
          </div>
        ) : null}
      </div>

      <span
        className={cn(
          "absolute bottom-3 text-[9px] font-medium uppercase tracking-[0.18em]",
          isDark ? "text-neutral-600" : "text-neutral-400",
        )}
      >
        Ambassador Program
      </span>
    </div>
  )
})
