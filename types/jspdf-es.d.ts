/**
 * Type shim for the deep path we import to force jsPDF's browser ES build.
 * The runtime exports are identical to the package's main entry, so we
 * re-export the public types verbatim.
 *
 * See {@link ../lib/bulk-qr/pdf.ts} for why we import this deep path.
 */
declare module "jspdf/dist/jspdf.es.min.js" {
  export * from "jspdf"
}
