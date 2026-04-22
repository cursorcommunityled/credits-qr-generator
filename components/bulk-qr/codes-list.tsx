import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { RedeemCode } from "@/lib/bulk-qr/types"

interface CodesListProps {
  codes: RedeemCode[]
}

export function CodesList({ codes }: CodesListProps) {
  return (
    <section className="rounded-2xl border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Detected codes</h2>
        <Badge variant="secondary" className="font-mono tabular-nums">
          {codes.length}
        </Badge>
      </header>
      <ScrollArea className="h-[220px]">
        <ol className="divide-y divide-border text-xs">
          {codes.map((code, index) => (
            <li
              key={code.id}
              className="flex items-center gap-3 px-4 py-2.5"
            >
              <span className="w-6 shrink-0 text-right font-mono tabular-nums text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="truncate font-mono text-foreground">{code.url}</span>
              <span className="ml-auto shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {code.code.slice(0, 14)}
              </span>
            </li>
          ))}
        </ol>
      </ScrollArea>
    </section>
  )
}
