"use client"

import { useMemo, useState } from "react"
import { AlertCircle, Download, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  nodeToPngBlob,
  PRINT_SCALE,
  sanitizeFileSegment,
  triggerDownload,
} from "@/lib/bulk-qr/export"
import {
  computePdfLayout,
  countPdfPages,
  DEFAULT_PDF_SETTINGS,
  generateCardsPdf,
  type PdfExportSettings,
} from "@/lib/bulk-qr/pdf"
import type { CardConfig, RedeemCode } from "@/lib/bulk-qr/types"

import { PdfExportFields } from "./pdf-export-fields"
import { PdfLayoutPreview } from "./pdf-layout-preview"

interface PdfExportDialogProps {
  codes: RedeemCode[]
  config: CardConfig
  getFrontNode: (codeId: string) => HTMLElement | null
  /** Disables the trigger while other exports are in-flight. */
  externallyDisabled?: boolean
}

type Status =
  | { kind: "idle" }
  | { kind: "rendering"; done: number; total: number }
  | { kind: "packaging" }
  | { kind: "error"; message: string }

/**
 * Orchestrates the "Export as PDF" flow:
 *   1. User tweaks paper / layout settings.
 *   2. SVG preview updates live (cards/page, total pages).
 *   3. On download, render each front PNG at print-ready DPI, then hand off
 *      to {@link generateCardsPdf} which lays them on real-world mm pages.
 */
export function PdfExportDialog({
  codes,
  config,
  getFrontNode,
  externallyDisabled,
}: PdfExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<PdfExportSettings>(DEFAULT_PDF_SETTINGS)
  const [status, setStatus] = useState<Status>({ kind: "idle" })

  const layout = useMemo(() => computePdfLayout(settings), [settings])
  const totalPages = countPdfPages(codes.length, layout)
  const cardsOnFirstPage = Math.min(codes.length, layout.perPage)
  const canDownload = layout.perPage > 0 && codes.length > 0

  const isBusy = status.kind === "rendering" || status.kind === "packaging"

  async function handleDownload() {
    if (!canDownload) return
    try {
      setStatus({ kind: "rendering", done: 0, total: codes.length })

      const fronts: Blob[] = []
      for (let i = 0; i < codes.length; i += 1) {
        const node = getFrontNode(codes[i].id)
        if (!node) {
          throw new Error(`Missing card for ${codes[i].code}.`)
        }
        const blob = await nodeToPngBlob(node, { pixelRatio: PRINT_SCALE })
        fronts.push(blob)
        setStatus({ kind: "rendering", done: i + 1, total: codes.length })
      }

      setStatus({ kind: "packaging" })
      const slug = sanitizeFileSegment(config.eventName) || "cursor"
      const pdfBlob = await generateCardsPdf({
        fronts,
        layout,
        documentTitle: `${slug}-cards`,
      })
      triggerDownload(pdfBlob, `${slug}-cards.pdf`)

      setStatus({ kind: "idle" })
      setOpen(false)
    } catch (err) {
      setStatus({
        kind: "error",
        message:
          err instanceof Error ? err.message : "Failed to generate the PDF.",
      })
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isBusy) return // lock while working
    setOpen(nextOpen)
    if (!nextOpen) setStatus({ kind: "idle" })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full"
          disabled={externallyDisabled || codes.length === 0}
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          Export as PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Export as PDF</DialogTitle>
          <DialogDescription>
            Pick a paper size and layout. We&apos;ll generate a print-ready PDF
            using real-world millimeter sizing, with gaps between cards so you
            can trim cleanly.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <PdfExportFields
            settings={settings}
            onChange={setSettings}
            disabled={isBusy}
          />

          <div className="flex flex-col gap-3">
            <PdfLayoutPreview layout={layout} filledOnFirstPage={cardsOnFirstPage} />
            <LayoutStats
              cols={layout.cols}
              rows={layout.rows}
              perPage={layout.perPage}
              totalCards={codes.length}
              totalPages={totalPages}
            />
          </div>
        </div>

        {status.kind === "error" ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>Export failed</AlertTitle>
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        ) : null}

        {isBusy ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {status.kind === "rendering"
                  ? `Rendering ${status.done} of ${status.total} cards…`
                  : "Assembling PDF…"}
              </span>
              <span>
                {status.kind === "rendering" && status.total > 0
                  ? `${Math.round((status.done / status.total) * 100)}%`
                  : null}
              </span>
            </div>
            <Progress
              value={
                status.kind === "rendering" && status.total > 0
                  ? Math.round((status.done / status.total) * 100)
                  : undefined
              }
            />
          </div>
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button onClick={handleDownload} disabled={isBusy || !canDownload}>
            {isBusy ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface LayoutStatsProps {
  cols: number
  rows: number
  perPage: number
  totalCards: number
  totalPages: number
}

function LayoutStats({
  cols,
  rows,
  perPage,
  totalCards,
  totalPages,
}: LayoutStatsProps) {
  return (
    <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-card p-3 text-sm">
      <StatRow label="Cards per page" value={perPage > 0 ? `${cols} × ${rows} = ${perPage}` : "0"} />
      <StatRow label="Total codes" value={`${totalCards}`} />
      <StatRow
        label="Pages"
        value={`${totalPages}`}
        tone={totalPages === 0 ? "warn" : "default"}
      />
      <StatRow
        label="Last page fill"
        value={
          perPage > 0 && totalCards > 0
            ? `${totalCards - (totalPages - 1) * perPage} / ${perPage}`
            : "—"
        }
      />
    </dl>
  )
}

interface StatRowProps {
  label: string
  value: string
  tone?: "default" | "warn"
}

function StatRow({ label, value, tone = "default" }: StatRowProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd
        className={
          tone === "warn"
            ? "font-mono text-sm tabular-nums text-destructive"
            : "font-mono text-sm tabular-nums text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  )
}
