'use client'

import { Link2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface ManualLinksInputProps {
  value: string
  codeCount: number
  skippedCount: number
  onChange: (value: string) => void
}

export function ManualLinksInput({
  value,
  codeCount,
  skippedCount,
  onChange,
}: ManualLinksInputProps) {
  const hasValue = value.trim().length > 0

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-secondary/30 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
            <Link2 className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="manual-links">Optional manual links</Label>
            <p className="text-xs text-muted-foreground">
              Paste one full redeem URL per line. We&apos;ll combine them with
              any uploaded CSV file.
            </p>
          </div>
        </div>
        {hasValue ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange('')}
            aria-label="Clear manual links"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Clear manual links</span>
          </Button>
        ) : null}
      </div>

      <Textarea
        id="manual-links"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`https://cursor.com/redeem/abc123\nhttps://cursor.com/redeem/def456`}
        rows={5}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className="min-h-28 resize-y bg-background font-mono leading-6"
      />

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary" className="font-mono tabular-nums">
          {codeCount} {codeCount === 1 ? 'manual link' : 'manual links'}
        </Badge>
        <span>Use this on its own or alongside a CSV upload.</span>
      </div>

      {skippedCount > 0 ? (
        <p role="status" className="text-xs text-destructive">
          Ignoring {skippedCount} invalid{' '}
          {skippedCount === 1 ? 'line' : 'lines'}.
        </p>
      ) : null}
    </div>
  )
}
