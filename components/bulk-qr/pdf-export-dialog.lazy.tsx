"use client"

import dynamic from "next/dynamic"

/**
 * jsPDF bundles a Node.js build whose transitive `fflate` dependency uses a
 * dynamic `new Worker(...)` call that Next.js's webpack SSR pass cannot
 * statically resolve. Loading the real dialog with `next/dynamic({ ssr: false })`
 * keeps the entire jsPDF import graph out of the server bundle — the dialog
 * only exists in the browser, where jsPDF belongs.
 */
export const PdfExportDialog = dynamic(
  () => import("./pdf-export-dialog").then((mod) => mod.PdfExportDialog),
  { ssr: false },
)
