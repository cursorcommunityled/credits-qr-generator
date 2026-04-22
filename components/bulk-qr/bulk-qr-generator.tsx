'use client'

import { useMemo, useRef, useState } from 'react'
import { QrCode as QrCodeIcon, Sparkles } from 'lucide-react'
import { CardCustomizer } from './card-customizer'
import { CardPreview, type CardFace } from './card-preview'
import { CsvUploader } from './csv-uploader'
import { DownloadActions } from './download-actions'
import { ExportStage, type ExportStageHandle } from './export-stage'
import { CodesList } from './codes-list'
import { CursorLogo } from './cursor-logo'
import { ManualLinksInput } from './manual-links-input'
import { parseManualRedeemLinks } from '@/lib/bulk-qr/csv-parser'
import type { CardConfig, RedeemCode } from '@/lib/bulk-qr/types'

const DEFAULT_CONFIG: CardConfig = {
  theme: 'dark',
  qrStyle: 'dots',
  eventName: '',
  locale: 'en',
}

export function BulkQrGenerator() {
  const [csvCodes, setCsvCodes] = useState<RedeemCode[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [manualLinks, setManualLinks] = useState('')
  const [config, setConfig] = useState<CardConfig>(DEFAULT_CONFIG)
  const [previewFace, setPreviewFace] = useState<CardFace>('front')
  const stageRef = useRef<ExportStageHandle | null>(null)

  const manualInput = useMemo(
    () => parseManualRedeemLinks(manualLinks),
    [manualLinks],
  )
  const codes = useMemo(
    () => [...csvCodes, ...manualInput.codes],
    [csvCodes, manualInput.codes],
  )

  const stats = useMemo(
    () => ({
      count: codes.length,
      ready: codes.length > 0,
      csvCount: csvCodes.length,
      manualCount: manualInput.codes.length,
    }),
    [codes.length, csvCodes.length, manualInput.codes.length],
  )

  function handleCodesParsed(parsed: RedeemCode[], name: string) {
    setCsvCodes(parsed)
    setFileName(name)
  }

  function handleReset() {
    setCsvCodes([])
    setFileName(null)
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:py-6 lg:px-8">
      <header className="flex shrink-0 flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
            <CursorLogo className="h-4 w-4" />
          </div>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Ambassador Program
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Bulk QR generator
          </h1>
          <p className="max-w-xl text-pretty text-sm text-muted-foreground">
            Upload a CSV and/or add redeem links manually, tune the card
            styling, and export print-ready QR cards for your next Cursor
            meetup.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:overflow-hidden">
        <aside className="flex flex-col gap-6 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pr-2 lg:[scrollbar-gutter:stable]">
          <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
            <SectionHeading
              icon={<QrCodeIcon className="h-3.5 w-3.5" aria-hidden="true" />}
              label="1. Add codes"
            />
            <CsvUploader
              fileName={fileName}
              codeCount={csvCodes.length}
              onCodesParsed={handleCodesParsed}
              onReset={handleReset}
            />
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Optional
                </span>
              </div>
            </div>
            <ManualLinksInput
              value={manualLinks}
              codeCount={manualInput.codes.length}
              skippedCount={manualInput.skipped}
              onChange={setManualLinks}
            />
            <p className="text-[11px] text-muted-foreground">
              {stats.ready
                ? `Using ${stats.count} total ${stats.count === 1 ? 'link' : 'links'} (${describeCodeSources(stats.csvCount, stats.manualCount)}).`
                : 'Upload a CSV, paste links, or combine both before exporting.'}
            </p>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
            <SectionHeading
              icon={<Sparkles className="h-3.5 w-3.5" aria-hidden="true" />}
              label="2. Customize"
            />
            <CardCustomizer
              config={config}
              onChange={setConfig}
              onEventNameFocus={() => setPreviewFace('back')}
            />
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
            <SectionHeading label="3. Export" />
            <DownloadActions
              codes={codes}
              config={config}
              getFrontNode={(id) => stageRef.current?.getFrontNode(id) ?? null}
              getBackNode={() => stageRef.current?.getBackNode() ?? null}
            />
            {stats.ready ? (
              <p className="text-[11px] text-muted-foreground">
                ZIP contains a <span className="font-mono">fronts/</span> folder
                with one PNG per code, plus a single{' '}
                <span className="font-mono">back.png</span>.
              </p>
            ) : null}
          </section>
        </aside>

        <div className="flex flex-col gap-6 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pr-2 lg:[scrollbar-gutter:stable]">
          <div className="lg:sticky lg:top-0 lg:z-10 lg:bg-background lg:pb-6">
            <CardPreview
              codes={codes}
              config={config}
              face={previewFace}
              onFaceChange={setPreviewFace}
            />
          </div>
          {stats.ready ? <CodesList codes={codes} /> : null}
        </div>
      </div>

      <ExportStage ref={stageRef} codes={codes} config={config} />
    </div>
  )
}

function SectionHeading({
  icon,
  label,
}: {
  icon?: React.ReactNode
  label: string
}) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
      {icon ? (
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
          {icon}
        </span>
      ) : null}
      {label}
    </div>
  )
}

function describeCodeSources(csvCount: number, manualCount: number) {
  if (csvCount > 0 && manualCount > 0) {
    return `${csvCount} from CSV, ${manualCount} manual`
  }

  if (csvCount > 0) {
    return `${csvCount} from CSV`
  }

  if (manualCount > 0) {
    return `${manualCount} manual`
  }

  return '0'
}
