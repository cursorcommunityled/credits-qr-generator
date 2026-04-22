import { forwardRef } from "react"
import { QrCode } from "./qr-code"
import { CARD_HEIGHT, CARD_WIDTH, QR_SIZE, type CardConfig, type RedeemCode } from "@/lib/bulk-qr/types"
import { cn } from "@/lib/utils"

interface QrCardFrontProps {
  code: RedeemCode
  config: CardConfig
  className?: string
}

/**
 * Front of the card. Left half renders the QR code, right half renders
 * the redemption instructions. Sized to the exact print dimensions.
 */
export const QrCardFront = forwardRef<HTMLDivElement, QrCardFrontProps>(function QrCardFront(
  { code, config, className },
  ref,
) {
  const isDark = config.theme === "dark"

  return (
    <div
      ref={ref}
      className={cn(
        "relative grid overflow-hidden",
        isDark ? "bg-neutral-950 text-neutral-50" : "bg-white text-neutral-950",
        className,
      )}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        gridTemplateColumns: "1fr 1fr",
        borderRadius: 14,
        boxShadow: isDark
          ? "inset 0 0 0 1px rgba(255,255,255,0.08)"
          : "inset 0 0 0 1px rgba(0,0,0,0.08)",
      }}
      data-card-face="front"
    >
      {/* Left: QR */}
      <div className="flex items-center justify-center">
        <div
          className={cn(
            "flex items-center justify-center rounded-lg p-1.5",
            isDark ? "bg-neutral-900/60" : "bg-neutral-100/60",
          )}
        >
          <QrCode
            value={code.url}
            size={QR_SIZE}
            style={config.qrStyle}
            theme={config.theme}
          />
        </div>
      </div>

      {/* Right: Instructions */}
      <div className="flex h-full flex-col justify-between py-3.5 pr-3.5">
        <div className="flex flex-col gap-0.5">
          <span
            className={cn(
              "text-[8px] font-medium uppercase tracking-[0.14em]",
              isDark ? "text-neutral-400" : "text-neutral-500",
            )}
          >
            Cursor credits
          </span>
          <h2 className="text-balance text-[13px] font-semibold leading-tight">
            Scan to redeem
          </h2>
        </div>

        <ol
          className={cn(
            "flex flex-col gap-1 text-[9px] leading-snug",
            isDark ? "text-neutral-300" : "text-neutral-600",
          )}
        >
          <li className="flex gap-1">
            <Step n={1} dark={isDark} />
            <span>Open the camera and scan the QR.</span>
          </li>
          <li className="flex gap-1">
            <Step n={2} dark={isDark} />
            <span>Sign in to your Cursor account.</span>
          </li>
          <li className="flex gap-1">
            <Step n={3} dark={isDark} />
            <span>Credits are added automatically.</span>
          </li>
        </ol>

        <div
          className={cn(
            "flex items-center justify-between text-[7px] font-medium uppercase tracking-[0.18em]",
            isDark ? "text-neutral-500" : "text-neutral-400",
          )}
        >
          <span>One-time use</span>
          <span className="font-mono normal-case tracking-normal">
            {code.code.slice(0, 10)}
          </span>
        </div>
      </div>
    </div>
  )
})

function Step({ n, dark }: { n: number; dark: boolean }) {
  return (
    <span
      className={cn(
        "mt-[1px] flex h-3 w-3 shrink-0 items-center justify-center rounded-full text-[7px] font-semibold",
        dark
          ? "bg-neutral-50 text-neutral-950"
          : "bg-neutral-950 text-neutral-50",
      )}
      aria-hidden="true"
    >
      {n}
    </span>
  )
}
