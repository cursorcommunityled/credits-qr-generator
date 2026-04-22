import { cn } from "@/lib/utils"

interface CursorLogoProps {
  className?: string
  /** Render as a solid monochrome mark (used inside QR center, etc). */
  monochrome?: boolean
  title?: string
}

/**
 * Stylized Cursor mark — the angular prism silhouette.
 * Uses currentColor so it inherits the surrounding text color.
 */
export function CursorLogo({ className, monochrome = false, title = "Cursor" }: CursorLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("block", className)}
      role="img"
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      {monochrome ? (
        <path
          d="M11.924 1.2 2.3 6.76v10.48l9.624 5.56 9.776-5.56V6.76L11.924 1.2Z"
          fill="currentColor"
        />
      ) : (
        <>
          <path
            d="M11.924 1.2 2.3 6.76l9.624 5.56 9.776-5.56L11.924 1.2Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M2.3 6.76v10.48l9.624 5.56V12.32L2.3 6.76Z"
            fill="currentColor"
            opacity="0.65"
          />
          <path
            d="M21.7 6.76v10.48l-9.776 5.56V12.32L21.7 6.76Z"
            fill="currentColor"
          />
        </>
      )}
    </svg>
  )
}

/**
 * "cursor" wordmark — simple text rendering in a tight lowercase style.
 * Kept as a separate component so the back of the card can compose it easily.
 */
export function CursorWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-sans font-semibold tracking-tight lowercase",
        className,
      )}
    >
      cursor
    </span>
  )
}
