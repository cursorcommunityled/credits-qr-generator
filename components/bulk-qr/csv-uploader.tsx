'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, FileSpreadsheet, X } from 'lucide-react'
import { parseRedeemCsv } from '@/lib/bulk-qr/csv-parser'
import type { RedeemCode } from '@/lib/bulk-qr/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CsvUploaderProps {
  fileName: string | null
  codeCount: number
  onCodesParsed: (codes: RedeemCode[], fileName: string) => void
  onReset: () => void
}

export function CsvUploader({
  fileName,
  codeCount,
  onCodesParsed,
  onReset,
}: CsvUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)
      setIsParsing(true)
      try {
        const { codes } = await parseRedeemCsv(file)
        if (codes.length === 0) {
          setError('No valid URLs were found in the first column.')
          return
        }
        onCodesParsed(codes, file.name)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to parse the CSV file.',
        )
      } finally {
        setIsParsing(false)
      }
    },
    [onCodesParsed],
  )

  if (fileName) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{fileName}</span>
            <span className="text-xs text-muted-foreground">
              {codeCount} {codeCount === 1 ? 'code' : 'codes'} detected
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          aria-label="Clear uploaded file"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Clear</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        className={cn(
          'group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition-colors',
          isDragging
            ? 'border-foreground bg-secondary'
            : 'border-border bg-card hover:bg-secondary/60',
        )}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          const file = event.dataTransfer.files?.[0]
          if (file) void handleFile(file)
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void handleFile(file)
            event.target.value = ''
          }}
        />
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Upload className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {isParsing ? 'Parsing…' : 'Drop your CSV here'}
          </span>
          <span className="text-xs text-muted-foreground">
            The first column of every row should be a redeem URL.
          </span>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={(event) => {
            event.preventDefault()
            inputRef.current?.click()
          }}
        >
          Select file
        </Button>
      </label>
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
