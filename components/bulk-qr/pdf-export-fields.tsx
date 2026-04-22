"use client"

import { useId } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  CUSTOM_PAPER_ID,
  PAPER_SIZES,
  PDF_FIELD_LIMITS,
  type PaperOrientation,
  type PdfExportSettings,
} from "@/lib/bulk-qr/pdf"

interface PdfExportFieldsProps {
  settings: PdfExportSettings
  onChange: (next: PdfExportSettings) => void
  disabled?: boolean
}

/**
 * Controlled form fields that drive a {@link PdfExportSettings} object. Kept
 * purely presentational — no layout math lives here, so the dialog can decide
 * when (and how) to recompute the preview.
 */
export function PdfExportFields({
  settings,
  onChange,
  disabled,
}: PdfExportFieldsProps) {
  const paperId = useId()
  const widthId = useId()
  const heightId = useId()
  const marginId = useId()
  const gapId = useId()
  const cardId = useId()

  function patch(partial: Partial<PdfExportSettings>) {
    onChange({ ...settings, ...partial })
  }

  const isCustom = settings.paperId === CUSTOM_PAPER_ID

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={paperId}>Paper size</Label>
        <Select
          value={settings.paperId}
          onValueChange={(value) => patch({ paperId: value })}
          disabled={disabled}
        >
          <SelectTrigger id={paperId} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAPER_SIZES.map((paper) => (
              <SelectItem key={paper.id} value={paper.id}>
                {paper.label}
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM_PAPER_ID}>Custom size…</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isCustom ? (
        <div className="grid grid-cols-2 gap-3">
          <NumericField
            id={widthId}
            label="Width (mm)"
            value={settings.customWidthMm}
            min={PDF_FIELD_LIMITS.paperMin}
            max={PDF_FIELD_LIMITS.paperMax}
            step={1}
            disabled={disabled}
            onChange={(value) => patch({ customWidthMm: value })}
          />
          <NumericField
            id={heightId}
            label="Height (mm)"
            value={settings.customHeightMm}
            min={PDF_FIELD_LIMITS.paperMin}
            max={PDF_FIELD_LIMITS.paperMax}
            step={1}
            disabled={disabled}
            onChange={(value) => patch({ customHeightMm: value })}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label>Orientation</Label>
        <ToggleGroup
          type="single"
          variant="outline"
          value={settings.orientation}
          onValueChange={(value) => {
            if (!value) return
            patch({ orientation: value as PaperOrientation })
          }}
          disabled={disabled}
          className="w-full"
        >
          <ToggleGroupItem value="portrait" className="flex-1">
            Portrait
          </ToggleGroupItem>
          <ToggleGroupItem value="landscape" className="flex-1">
            Landscape
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NumericField
          id={marginId}
          label="Page margin (mm)"
          value={settings.marginMm}
          min={PDF_FIELD_LIMITS.marginMin}
          max={PDF_FIELD_LIMITS.marginMax}
          step={1}
          disabled={disabled}
          onChange={(value) => patch({ marginMm: value })}
        />
        <NumericField
          id={gapId}
          label="Trim gap (mm)"
          value={settings.gapMm}
          min={PDF_FIELD_LIMITS.gapMin}
          max={PDF_FIELD_LIMITS.gapMax}
          step={1}
          disabled={disabled}
          onChange={(value) => patch({ gapMm: value })}
        />
      </div>

      <NumericField
        id={cardId}
        label="Card width (mm)"
        description="Card height is set automatically to keep the design proportional."
        value={settings.cardWidthMm}
        min={PDF_FIELD_LIMITS.cardWidthMin}
        max={PDF_FIELD_LIMITS.cardWidthMax}
        step={1}
        disabled={disabled}
        onChange={(value) => patch({ cardWidthMm: value })}
      />
    </div>
  )
}

interface NumericFieldProps {
  id: string
  label: string
  description?: string
  value: number
  min: number
  max: number
  step: number
  disabled?: boolean
  onChange: (value: number) => void
}

function NumericField({
  id,
  label,
  description,
  value,
  min,
  max,
  step,
  disabled,
  onChange,
}: NumericFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : ""}
        disabled={disabled}
        onChange={(event) => {
          const raw = event.target.value
          if (raw === "") {
            onChange(0)
            return
          }
          const parsed = Number.parseFloat(raw)
          if (Number.isNaN(parsed)) return
          onChange(clamp(parsed, min, max))
        }}
      />
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min
  if (value > max) return max
  return value
}
