import { toPng } from 'html-to-image'
import JSZip from 'jszip'

/** Default raster scale used for PNG exports (ZIP). */
export const EXPORT_SCALE = 3

/**
 * Higher raster scale used for print-ready PDF exports, so a card printed at
 * its real-world size still resolves to ~300 DPI on paper.
 */
export const PRINT_SCALE = 4

export interface RenderNodeOptions {
  /** html-to-image pixelRatio. Defaults to {@link EXPORT_SCALE}. */
  pixelRatio?: number
}

export async function nodeToPngBlob(
  node: HTMLElement,
  options: RenderNodeOptions = {},
): Promise<Blob> {
  // NOTE: do not pass `backgroundColor` here. html-to-image applies that option
  // as an inline style on the cloned root AFTER copying computed styles, which
  // would overwrite the card's own outer frame color (tokens.background) and
  // cause the export to drop the darker outer frame, leaving only the inner
  // container. The card root already paints its own full-bleed background.
  const dataUrl = await toPng(node, {
    pixelRatio: options.pixelRatio ?? EXPORT_SCALE,
    cacheBust: true,
  })
  const res = await fetch(dataUrl)
  return res.blob()
}

export interface CardAsset {
  fileName: string
  blob: Blob
}

export async function zipCards(assets: CardAsset[]): Promise<Blob> {
  const zip = new JSZip()
  const fronts = zip.folder('fronts')
  for (const asset of assets) {
    const fileName = sanitizeFileSegment(asset.fileName.replace(/\.[^.]+$/, '')) || 'code'
    fronts?.file(`${fileName}.png`, asset.blob)
  }
  return zip.generateAsync({ type: 'blob' })
}

export function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function sanitizeFileSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}
