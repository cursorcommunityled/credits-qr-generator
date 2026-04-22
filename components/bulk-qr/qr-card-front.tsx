import { forwardRef } from "react"
import { QrCode } from "./qr-code"
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  QR_SIZE,
  getCardTokens,
  type CardColorTokens,
  type CardConfig,
  type RedeemCode,
} from "@/lib/bulk-qr/types"
import { cn } from "@/lib/utils"

interface QrCardFrontProps {
  code: RedeemCode
  config: CardConfig
  className?: string
}

/**
 * Front of the card. A thin outer frame (card background) wraps an inner
 * container that holds the QR on the left and redemption instructions on
 * the right. Sized to the exact print dimensions.
 */
export const QrCardFront = forwardRef<HTMLDivElement, QrCardFrontProps>(function QrCardFront(
  { code, config, className },
  ref,
) {
  const tokens = getCardTokens(config.theme)

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden p-2 tracking-[-0.04em]", className)}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background: tokens.background,
        color: tokens.foreground,
      }}
      data-card-face="front"
    >
      <div
        className="flex h-full w-full flex-col border"
        style={{
          background: tokens.container,
          borderColor: tokens.border,
        }}
      >
        {/* Top row: instructions + QR */}
        <div
          className="grid min-h-0 flex-1"
          style={{
            // minmax(0, Xfr) prevents intrinsic content width (the QR) from
            // overriding the 60/40 ratio and forcing its column to expand.
            gridTemplateColumns: "minmax(0, 6fr) minmax(0, 4fr)",
          }}
        >
          {/* Left: Instructions */}
          <div className="flex h-full flex-col justify-center gap-3 py-3.5 pl-3.5">
            <div className="flex flex-col gap-0.5">
              <span
                className="text-[7px] font-medium"
                style={{ color: tokens.mutedForeground }}
              >
                Cursor credits
              </span>
              <h2
                className="text-balance text-[10px] font-semibold leading-tight"
                style={{ color: tokens.accent }}
              >
                Scan to redeem
              </h2>
            </div>

            <ol
              className="flex flex-col gap-1 text-[7px] leading-snug"
              style={{ color: tokens.foreground }}
            >
              <StepItem n={1} label="Scan the QR." tokens={tokens} />
              <StepItem
                n={2}
                label="Sign in (personal account, not Team)."
                tokens={tokens}
              />
              <StepItem
                n={3}
                label="Redeem — applies to your next invoice."
                tokens={tokens}
              />
            </ol>
          </div>

          {/* Right: QR */}
          <div className="flex min-w-0 items-center justify-center px-1 py-3">
            <QrCode
              value={code.url}
              size={QR_SIZE}
              style={config.qrStyle}
              theme={config.theme}
            />
          </div>
        </div>

        {/* Bottom row: raw link spans full card width */}
        <div className="flex items-center justify-center px-2 pb-2">
          <span
            className="max-w-full truncate text-center font-mono text-[7px] leading-tight tracking-normal"
            style={{ color: tokens.accent }}
            title={code.url}
          >
            {stripProtocol(code.url)}
          </span>
        </div>
      </div>
    </div>
  )
})

/**
 * Strips `http(s)://` from a URL so the fallback label is shorter and easier
 * to read. Also drops a trailing slash. Used purely for display.
 */
function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "")
}

function StepItem({
  n,
  label,
  tokens,
}: {
  n: number
  label: string
  tokens: CardColorTokens
}) {
  return (
    <li>
      <span style={{ color: tokens.mutedForeground }}>{n}.</span>{" "}
      <span>{label}</span>
    </li>
  )
}
