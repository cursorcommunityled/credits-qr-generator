import type { jsPDF as JsPDF } from "jspdf"

import { CARD_ASPECT } from "./types"

// NOTE: jsPDF's default export condition resolves to its Node.js build, whose
// transitive `fflate` dep uses a dynamic `new Worker(...)` call that Next.js's
// bundler cannot statically resolve. Importing the ES (browser) build file
// directly bypasses the exports map and keeps SSR/build happy on both
// webpack and Turbopack. We only import at runtime, and only from
// {@link generateCardsPdf} (client-only), so SSR never evaluates jsPDF.

/**
 * A single paper size, always stored with the long edge as {@link heightMm}
 * (portrait orientation). Landscape swaps width and height at layout time.
 */
export interface PaperSizeDefinition {
  id: string
  label: string
  widthMm: number
  heightMm: number
}

/**
 * Built-in paper sizes commonly used for card printing. The id `"custom"` is
 * excluded from this list — it's handled as a separate option in the UI so
 * users can type their own dimensions.
 */
export const PAPER_SIZES: readonly PaperSizeDefinition[] = [
  { id: "a4", label: "A4 — 210 × 297 mm", widthMm: 210, heightMm: 297 },
  { id: "a3", label: "A3 — 297 × 420 mm", widthMm: 297, heightMm: 420 },
  { id: "a5", label: "A5 — 148 × 210 mm", widthMm: 148, heightMm: 210 },
  { id: "letter", label: "Letter — 215.9 × 279.4 mm", widthMm: 215.9, heightMm: 279.4 },
  { id: "legal", label: "Legal — 215.9 × 355.6 mm", widthMm: 215.9, heightMm: 355.6 },
  { id: "tabloid", label: "Tabloid — 279.4 × 431.8 mm", widthMm: 279.4, heightMm: 431.8 },
] as const

export const CUSTOM_PAPER_ID = "custom" as const

export type PaperOrientation = "portrait" | "landscape"

/**
 * User-facing settings captured in the PDF export dialog. {@link cardWidthMm}
 * is the only card dimension — height is always derived from
 * {@link CARD_ASPECT} so the design never stretches.
 */
export interface PdfExportSettings {
  paperId: string
  /** Used only when {@link paperId} === {@link CUSTOM_PAPER_ID}. */
  customWidthMm: number
  /** Used only when {@link paperId} === {@link CUSTOM_PAPER_ID}. */
  customHeightMm: number
  orientation: PaperOrientation
  marginMm: number
  gapMm: number
  cardWidthMm: number
}

export const DEFAULT_PDF_SETTINGS: PdfExportSettings = {
  paperId: "a4",
  customWidthMm: 210,
  customHeightMm: 297,
  orientation: "portrait",
  marginMm: 10,
  gapMm: 5,
  cardWidthMm: 85,
}

/** Strong validation guard-rails for dimension fields (in mm). */
export const PDF_FIELD_LIMITS = {
  paperMin: 50,
  paperMax: 2000,
  marginMin: 0,
  marginMax: 50,
  gapMin: 0,
  gapMax: 50,
  cardWidthMin: 30,
  cardWidthMax: 300,
} as const

export interface PdfLayout {
  pageWidthMm: number
  pageHeightMm: number
  marginMm: number
  gapMm: number
  cardWidthMm: number
  cardHeightMm: number
  cols: number
  rows: number
  perPage: number
  gridWidthMm: number
  gridHeightMm: number
  /** Horizontal offset (mm) from the page edge to the first card's left. */
  offsetXMm: number
  /** Vertical offset (mm) from the page edge to the first card's top. */
  offsetYMm: number
}

export function resolvePaperSize(
  settings: Pick<PdfExportSettings, "paperId" | "customWidthMm" | "customHeightMm">,
): { widthMm: number; heightMm: number } {
  if (settings.paperId === CUSTOM_PAPER_ID) {
    return {
      widthMm: settings.customWidthMm,
      heightMm: settings.customHeightMm,
    }
  }
  const preset = PAPER_SIZES.find((paper) => paper.id === settings.paperId)
  if (!preset) {
    // Fall back to A4 if an unknown id is ever supplied.
    return { widthMm: 210, heightMm: 297 }
  }
  return { widthMm: preset.widthMm, heightMm: preset.heightMm }
}

export function computePdfLayout(settings: PdfExportSettings): PdfLayout {
  const paper = resolvePaperSize(settings)
  const [pageWidthMm, pageHeightMm] =
    settings.orientation === "portrait"
      ? [paper.widthMm, paper.heightMm]
      : [paper.heightMm, paper.widthMm]

  const cardWidthMm = Math.max(0, settings.cardWidthMm)
  const cardHeightMm = cardWidthMm / CARD_ASPECT
  const marginMm = Math.max(0, settings.marginMm)
  const gapMm = Math.max(0, settings.gapMm)

  const availW = Math.max(0, pageWidthMm - 2 * marginMm)
  const availH = Math.max(0, pageHeightMm - 2 * marginMm)

  const cols =
    cardWidthMm > 0 && availW >= cardWidthMm
      ? Math.max(1, Math.floor((availW + gapMm) / (cardWidthMm + gapMm)))
      : 0
  const rows =
    cardHeightMm > 0 && availH >= cardHeightMm
      ? Math.max(1, Math.floor((availH + gapMm) / (cardHeightMm + gapMm)))
      : 0

  const gridWidthMm = cols > 0 ? cols * cardWidthMm + (cols - 1) * gapMm : 0
  const gridHeightMm = rows > 0 ? rows * cardHeightMm + (rows - 1) * gapMm : 0

  // Center the grid inside the printable area so trim marks land symmetrically.
  const offsetXMm = marginMm + Math.max(0, (availW - gridWidthMm) / 2)
  const offsetYMm = marginMm + Math.max(0, (availH - gridHeightMm) / 2)

  return {
    pageWidthMm,
    pageHeightMm,
    marginMm,
    gapMm,
    cardWidthMm,
    cardHeightMm,
    cols,
    rows,
    perPage: cols * rows,
    gridWidthMm,
    gridHeightMm,
    offsetXMm,
    offsetYMm,
  }
}

export function countPdfPages(totalCards: number, layout: PdfLayout): number {
  if (layout.perPage <= 0 || totalCards <= 0) return 0
  return Math.ceil(totalCards / layout.perPage)
}

export interface GeneratePdfInput {
  /** One PNG blob per card front, in the order they should appear. */
  fronts: Blob[]
  layout: PdfLayout
  /** Optional title written to the PDF's metadata. */
  documentTitle?: string
  /** Called after each card is drawn, 1-based. */
  onProgress?: (done: number, total: number) => void
}

/**
 * Lays out already-rendered card PNGs into a print-ready PDF. Uses mm units so
 * the cards on paper match the user's configured physical size exactly.
 */
export async function generateCardsPdf({
  fronts,
  layout,
  documentTitle,
  onProgress,
}: GeneratePdfInput): Promise<Blob> {
  if (layout.perPage <= 0) {
    throw new Error(
      "No cards fit on the page. Reduce margins, gaps, or card width.",
    )
  }
  if (fronts.length === 0) {
    throw new Error("There are no cards to export.")
  }

  const orientation: "portrait" | "landscape" =
    layout.pageWidthMm >= layout.pageHeightMm ? "landscape" : "portrait"

  // Import the browser ES build directly — see the file-level note. This
  // path is stable (published under `"./dist/*"` in jspdf's exports map).
  const mod = (await import("jspdf/dist/jspdf.es.min.js")) as {
    jsPDF: typeof JsPDF
  }
  const { jsPDF } = mod
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: [layout.pageWidthMm, layout.pageHeightMm],
    compress: true,
  })

  if (documentTitle) {
    doc.setDocumentProperties({
      title: documentTitle,
      creator: "Cursor Bulk QR Generator",
    })
  }

  // jsPDF wants data URLs for addImage. Convert blobs up front in parallel so
  // the hot loop below only does synchronous drawing work.
  const dataUrls = await Promise.all(fronts.map(blobToDataUrl))

  let drawn = 0
  let pageIndex = 0

  for (let i = 0; i < dataUrls.length; i += layout.perPage) {
    if (pageIndex > 0) {
      doc.addPage([layout.pageWidthMm, layout.pageHeightMm], orientation)
    }
    pageIndex += 1

    const slice = dataUrls.slice(i, i + layout.perPage)
    for (let idx = 0; idx < slice.length; idx += 1) {
      const col = idx % layout.cols
      const row = Math.floor(idx / layout.cols)
      const x = layout.offsetXMm + col * (layout.cardWidthMm + layout.gapMm)
      const y = layout.offsetYMm + row * (layout.cardHeightMm + layout.gapMm)
      doc.addImage(
        slice[idx],
        "PNG",
        x,
        y,
        layout.cardWidthMm,
        layout.cardHeightMm,
        undefined,
        "FAST",
      )
      drawn += 1
      onProgress?.(drawn, dataUrls.length)
    }
  }

  return doc.output("blob")
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === "string") {
        resolve(result)
      } else {
        reject(new Error("Unable to read image blob as a data URL."))
      }
    }
    reader.onerror = () => reject(reader.error ?? new Error("Blob read failed."))
    reader.readAsDataURL(blob)
  })
}
