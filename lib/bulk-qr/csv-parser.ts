import Papa from "papaparse"
import type { RedeemCode } from "./types"

export interface ParseResult {
  codes: RedeemCode[]
  skipped: number
}

/**
 * Parses a CSV file and extracts redeem URLs from the first column of every row.
 * - Ignores empty rows and cells.
 * - Skips an optional header row if the first cell is not a URL.
 */
export function parseRedeemCsv(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data.filter((row) => Array.isArray(row) && row.length > 0)
          const raw = rows.map((row) => (row[0] ?? "").toString().trim()).filter(Boolean)

          // Drop header row if first cell doesn't look like a URL.
          const startIndex = isLikelyUrl(raw[0] ?? "") ? 0 : 1
          resolve(parseRedeemUrls(raw.slice(startIndex), "csv"))
        } catch (error) {
          reject(error)
        }
      },
      error: reject,
    })
  })
}

/**
 * Parses newline-separated redeem URLs pasted into the manual input field.
 * Empty lines are ignored so users can space entries out.
 */
export function parseManualRedeemLinks(input: string): ParseResult {
  const raw = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  return parseRedeemUrls(raw, "manual")
}

function parseRedeemUrls(values: string[], source: "csv" | "manual"): ParseResult {
  const urls = values.filter(isLikelyUrl)
  const skipped = values.length - urls.length

  const codes: RedeemCode[] = urls.map((url, index) => ({
    id: `${source}-${index}`,
    url,
    code: extractCode(url),
  }))

  return { codes, skipped }
}

function isLikelyUrl(value: string): boolean {
  if (!value) return false
  try {
    const parsed = new URL(value)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

function extractCode(url: string): string {
  try {
    const parsed = new URL(url)
    const segments = parsed.pathname.split("/").filter(Boolean)
    const last = segments[segments.length - 1] ?? ""
    return last || parsed.hostname
  } catch {
    return url
  }
}
