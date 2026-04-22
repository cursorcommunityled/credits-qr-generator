"use client"

import { useState } from "react"
import { Download, Package, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import {
  nodeToPngBlob,
  sanitizeFileSegment,
  triggerDownload,
  zipCards,
  type CardAsset,
} from "@/lib/bulk-qr/export"
import type { CardConfig, RedeemCode } from "@/lib/bulk-qr/types"
import { PdfExportDialog } from "./pdf-export-dialog.lazy"

interface DownloadActionsProps {
  codes: RedeemCode[]
  config: CardConfig
  /**
   * Returns the card front element for the given code id. The element must
   * be currently mounted and visible for html-to-image to capture it.
   */
  getFrontNode: (codeId: string) => HTMLElement | null
  getBackNode: () => HTMLElement | null
}

type Status =
  | { kind: "idle" }
  | { kind: "working"; label: string; progress: number }
  | { kind: "error"; message: string }

export function DownloadActions({
  codes,
  config,
  getFrontNode,
  getBackNode,
}: DownloadActionsProps) {
  const [status, setStatus] = useState<Status>({ kind: "idle" })

  async function handleDownloadBack() {
    try {
      const node = getBackNode()
      if (!node) throw new Error("The back card is not available.")
      setStatus({ kind: "working", label: "Rendering back…", progress: 100 })
      const blob = await nodeToPngBlob(node)
      const slug = sanitizeFileSegment(config.eventName) || "cursor"
      triggerDownload(blob, `${slug}-back.png`)
      setStatus({ kind: "idle" })
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Failed to render the card back.",
      })
    }
  }

  async function handleDownloadAll() {
    try {
      const total = codes.length + 1
      let completed = 0
      const assets: CardAsset[] = []

      setStatus({ kind: "working", label: "Rendering cards…", progress: 0 })

      for (const code of codes) {
        const node = getFrontNode(code.id)
        if (!node) throw new Error(`Missing card for ${code.code}.`)
        const blob = await nodeToPngBlob(node)
        const fileName = `${String(completed + 1).padStart(3, "0")}-${sanitizeFileSegment(code.code) || "code"}.png`
        assets.push({ fileName, blob })
        completed += 1
        setStatus({
          kind: "working",
          label: `Rendered ${completed} of ${codes.length} cards…`,
          progress: Math.round((completed / total) * 100),
        })
      }

      const backNode = getBackNode()
      if (!backNode) throw new Error("The back card is not available.")
      const backBlob = await nodeToPngBlob(backNode)
      completed += 1
      setStatus({
        kind: "working",
        label: "Packaging ZIP…",
        progress: Math.round((completed / total) * 100),
      })

      const zip = await zipCards(assets)
      const combined = await appendBackToZip(zip, backBlob)
      const slug = sanitizeFileSegment(config.eventName) || "cursor"
      triggerDownload(combined, `${slug}-cards.zip`)
      setStatus({ kind: "idle" })
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Failed to generate the ZIP.",
      })
    }
  }

  const isWorking = status.kind === "working"

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Button
          onClick={handleDownloadAll}
          disabled={isWorking || codes.length === 0}
          className="w-full"
        >
          {isWorking ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <Package className="h-4 w-4" aria-hidden="true" />
          )}
          Download all ({codes.length})
        </Button>
        <Button
          onClick={handleDownloadBack}
          disabled={isWorking}
          variant="outline"
          className="w-full"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download back
        </Button>
        <PdfExportDialog
          codes={codes}
          config={config}
          getFrontNode={getFrontNode}
          externallyDisabled={isWorking}
        />
      </div>

      {isWorking ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{status.label}</span>
            <span>{status.progress}%</span>
          </div>
          <Progress value={status.progress} />
        </div>
      ) : null}

      <AlertDialog
        open={status.kind === "error"}
        onOpenChange={(open) => {
          if (!open) setStatus({ kind: "idle" })
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
              Export failed
            </AlertDialogTitle>
            <AlertDialogDescription>
              {status.kind === "error" ? status.message : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setStatus({ kind: "idle" })}>
              Dismiss
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

async function appendBackToZip(zipBlob: Blob, backBlob: Blob): Promise<Blob> {
  // Re-open the generated zip to append the shared back image at the root.
  const { default: JSZip } = await import("jszip")
  const zip = await JSZip.loadAsync(zipBlob)
  zip.file("back.png", backBlob)
  return zip.generateAsync({ type: "blob" })
}
