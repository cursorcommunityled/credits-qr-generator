"use client"

import { Moon, Sun, Grid3x3, Dot } from "lucide-react"
import type { CardConfig, CardTheme, QrStyle } from "@/lib/bulk-qr/types"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface CardCustomizerProps {
  config: CardConfig
  onChange: (next: CardConfig) => void
}

export function CardCustomizer({ config, onChange }: CardCustomizerProps) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="theme">Theme</FieldLabel>
        <ToggleGroup
          id="theme"
          type="single"
          value={config.theme}
          onValueChange={(value) => {
            if (!value) return
            onChange({ ...config, theme: value as CardTheme })
          }}
          variant="outline"
          className="w-full"
        >
          <ToggleGroupItem value="light" aria-label="Light theme" className="flex-1 gap-2">
            <Sun className="h-4 w-4" aria-hidden="true" />
            Light
          </ToggleGroupItem>
          <ToggleGroupItem value="dark" aria-label="Dark theme" className="flex-1 gap-2">
            <Moon className="h-4 w-4" aria-hidden="true" />
            Dark
          </ToggleGroupItem>
        </ToggleGroup>
      </Field>

      <Field>
        <FieldLabel htmlFor="qr-style">QR style</FieldLabel>
        <ToggleGroup
          id="qr-style"
          type="single"
          value={config.qrStyle}
          onValueChange={(value) => {
            if (!value) return
            onChange({ ...config, qrStyle: value as QrStyle })
          }}
          variant="outline"
          className="w-full"
        >
          <ToggleGroupItem value="square" aria-label="Pixelated" className="flex-1 gap-2">
            <Grid3x3 className="h-4 w-4" aria-hidden="true" />
            Pixelated
          </ToggleGroupItem>
          <ToggleGroupItem value="dots" aria-label="Dotted" className="flex-1 gap-2">
            <Dot className="h-4 w-4" aria-hidden="true" />
            Dotted
          </ToggleGroupItem>
        </ToggleGroup>
      </Field>

      <Field>
        <FieldLabel htmlFor="event-name">Event or city name</FieldLabel>
        <Input
          id="event-name"
          placeholder="e.g. Cursor Meetup Lisbon"
          maxLength={48}
          value={config.eventName}
          onChange={(event) => onChange({ ...config, eventName: event.target.value })}
        />
        <FieldDescription>
          Appears on the back of every card. Leave empty to hide it.
        </FieldDescription>
      </Field>
    </FieldGroup>
  )
}
