'use client'

import { Moon, Sun, Grid3x3, Dot, Languages } from 'lucide-react'
import type { CardConfig, CardTheme, QrStyle } from '@/lib/bulk-qr/types'
import { CARD_LOCALE_OPTIONS, type CardLocale } from '@/lib/bulk-qr/i18n'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface CardCustomizerProps {
  config: CardConfig
  onChange: (next: CardConfig) => void
  /**
   * Fired when the user focuses the event-name field. Used by the parent to
   * automatically flip the card preview to the back, since that's where the
   * event name appears.
   */
  onEventNameFocus?: () => void
}

export function CardCustomizer({
  config,
  onChange,
  onEventNameFocus,
}: CardCustomizerProps) {
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
          <ToggleGroupItem
            value="light"
            aria-label="Light theme"
            className="flex-1 gap-2"
          >
            <Sun className="h-4 w-4" aria-hidden="true" />
            Light
          </ToggleGroupItem>
          <ToggleGroupItem
            value="dark"
            aria-label="Dark theme"
            className="flex-1 gap-2"
          >
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
          <ToggleGroupItem
            value="square"
            aria-label="Pixelated"
            className="flex-1 gap-2"
          >
            <Grid3x3 className="h-4 w-4" aria-hidden="true" />
            Pixelated
          </ToggleGroupItem>
          <ToggleGroupItem
            value="dots"
            aria-label="Dotted"
            className="flex-1 gap-2"
          >
            <Dot className="h-4 w-4" aria-hidden="true" />
            Dotted
          </ToggleGroupItem>
        </ToggleGroup>
      </Field>

      <Field>
        <FieldLabel htmlFor="locale">Language</FieldLabel>
        <ToggleGroup
          id="locale"
          type="single"
          value={config.locale}
          onValueChange={(value) => {
            if (!value) return
            onChange({ ...config, locale: value as CardLocale })
          }}
          variant="outline"
          className="w-full"
        >
          {CARD_LOCALE_OPTIONS.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              aria-label={option.ariaLabel}
              className="flex-1 gap-2"
            >
              <Languages className="h-4 w-4" aria-hidden="true" />
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <FieldDescription>
          Translates the redeem copy on the front of the card.
        </FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="event-name">Event or city name</FieldLabel>
        <Input
          id="event-name"
          placeholder="e.g. Cursor Meetup Lisbon"
          maxLength={48}
          value={config.eventName}
          onChange={(event) =>
            onChange({ ...config, eventName: event.target.value })
          }
          onFocus={onEventNameFocus}
        />
        <FieldDescription>
          Appears on the back of every card. Leave empty to hide it.
        </FieldDescription>
      </Field>
    </FieldGroup>
  )
}
