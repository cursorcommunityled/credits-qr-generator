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
      className={cn("relative overflow-hidden p-2", className)}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background: tokens.background,
        color: tokens.foreground,
      }}
      data-card-face="front"
    >
      <div
        className="grid h-full w-full border"
        style={{
          gridTemplateColumns: "1fr 1fr",
          background: tokens.container,
          borderColor: tokens.border,
        }}
      >
        {/* Left: QR + fallback URL */}
        <div className="flex flex-col items-center justify-center gap-1.5 px-2 py-3">
          <QrCode
            value={code.url}
            size={QR_SIZE}
            style={config.qrStyle}
            theme={config.theme}
          />
          <span
            className="max-w-full break-all text-center font-mono text-[6px] leading-tight"
            style={{ color: tokens.accent }}
            title={code.url}
          >
            {stripProtocol(code.url)}
          </span>
        </div>

        {/* Right: Instructions */}
        <div className="flex h-full flex-col justify-center gap-3 py-3.5 pr-3.5">
          <div className="flex flex-col gap-0.5">
            <span
              className="text-[8px] font-medium uppercase tracking-[0.14em]"
              style={{ color: tokens.mutedForeground }}
            >
              Cursor credits
            </span>
            <h2
              className="text-balance text-[13px] font-semibold leading-tight"
              style={{ color: tokens.accent }}
            >
              Scan to redeem
            </h2>
          </div>

          <ol
            className="flex flex-col gap-1 text-[9px] leading-snug"
            style={{ color: tokens.foreground }}
          >
            <li className="flex gap-1">
              <Step n={1} tokens={tokens} />
              <span>Open the camera and scan the QR.</span>
            </li>
            <li className="flex gap-1">
              <Step n={2} tokens={tokens} />
              <span>Sign in to your Cursor account.</span>
            </li>
            <li className="flex gap-1">
              <Step n={3} tokens={tokens} />
              <span>Credits are added automatically.</span>
            </li>
          </ol>
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

function Step({ n, tokens }: { n: number; tokens: CardColorTokens }) {
  return (
    <span
      className="mt-[1px] flex h-3 w-3 shrink-0 items-center justify-center rounded-full text-[7px] font-semibold"
      style={{ background: tokens.accent, color: tokens.container }}
      aria-hidden="true"
    >
      {n}
    </span>
  )
}
