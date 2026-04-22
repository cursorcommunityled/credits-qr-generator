import { toPng } from "html-to-image"
import JSZip from "jszip"

const EXPORT_SCALE = 3

export async function nodeToPngBlob(node: HTMLElement): Promise<Blob> {
  const dataUrl = await toPng(node, {
    pixelRatio: EXPORT_SCALE,
    cacheBust: true,
    backgroundColor: "transparent",
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
  const fronts = zip.folder("fronts")
  for (const asset of assets) {
    fronts?.file(asset.fileName, asset.blob)
  }
  return zip.generateAsync({ type: "blob" })
}

export function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
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
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
}
