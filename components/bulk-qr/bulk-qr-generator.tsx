"use client"

import { useMemo, useRef, useState } from "react"
import { QrCode as QrCodeIcon, Sparkles } from "lucide-react"
import { CardCustomizer } from "./card-customizer"
import { CardPreview } from "./card-preview"
import { CsvUploader } from "./csv-uploader"
import { DownloadActions } from "./download-actions"
import { ExportStage, type ExportStageHandle } from "./export-stage"
import { CodesList } from "./codes-list"
import { CursorLogo } from "./cursor-logo"
import type { CardConfig, RedeemCode } from "@/lib/bulk-qr/types"

const DEFAULT_CONFIG: CardConfig = {
  theme: "dark",
  qrStyle: "dots",
  eventName: "",
}

export function BulkQrGenerator() {
  const [codes, setCodes] = useState<RedeemCode[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [config, setConfig] = useState<CardConfig>(DEFAULT_CONFIG)
  const stageRef = useRef<ExportStageHandle | null>(null)

  const stats = useMemo(
    () => ({
      count: codes.length,
      ready: codes.length > 0,
    }),
    [codes.length],
  )

  function handleCodesParsed(parsed: RedeemCode[], name: string) {
    setCodes(parsed)
    setFileName(name)
  }

  function handleReset() {
    setCodes([])
    setFileName(null)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3">
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
            Upload a CSV of redeem links, tune the card styling, and export
            print-ready QR cards for your next Cursor meetup.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <aside className="flex flex-col gap-6">
          <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
            <SectionHeading
              icon={<QrCodeIcon className="h-3.5 w-3.5" aria-hidden="true" />}
              label="1. Import codes"
            />
            <CsvUploader
              fileName={fileName}
              codeCount={codes.length}
              onCodesParsed={handleCodesParsed}
              onReset={handleReset}
            />
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
            <SectionHeading
              icon={<Sparkles className="h-3.5 w-3.5" aria-hidden="true" />}
              label="2. Customize"
            />
            <CardCustomizer config={config} onChange={setConfig} />
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
                ZIP contains a <span className="font-mono">fronts/</span> folder with
                one PNG per code, plus a single{" "}
                <span className="font-mono">back.png</span>.
              </p>
            ) : null}
          </section>
        </aside>

        <div className="flex flex-col gap-6">
          <CardPreview codes={codes} config={config} />
          {stats.ready ? <CodesList codes={codes} /> : null}
        </div>
      </div>

      <ExportStage ref={stageRef} codes={codes} config={config} />
    </div>
  )
}

function SectionHeading({ icon, label }: { icon?: React.ReactNode; label: string }) {
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
