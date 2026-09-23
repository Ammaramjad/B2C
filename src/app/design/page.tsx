"use client";

import { Btn, Chip, Empty, Field, Stat, Status, Surface } from "@/components/ui";

export default function DesignPage() {
  return (
    <div className="space-y-12">
      <header>
        <div className="label">DELIVERABLE 11</div>
        <h1 className="display text-5xl">AI Mobility 2030</h1>
        <p className="mt-2 max-w-xl text-[var(--muted)]">Design-prototype component gallery. Toggle theme in the header.</p>
      </header>
      <section className="space-y-3">
        <h2 className="display text-2xl">Buttons</h2>
        <div className="flex flex-wrap gap-2">
          <Btn>Primary</Btn>
          <Btn kind="ghost">Ghost</Btn>
          <Btn kind="ai">Ask AI</Btn>
          <Btn kind="danger">SOS</Btn>
          <Btn disabled>Disabled</Btn>
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="display text-2xl">Status</h2>
        <div className="flex flex-wrap gap-2">
          <Status kind="assigned">assigned</Status>
          <Status kind="active">active</Status>
          <Status kind="completed">completed</Status>
          <Status kind="cancelled">cancelled</Status>
          <Chip tone="ai">AI</Chip>
          <Chip tone="live">LIVE</Chip>
        </div>
      </section>
      <section className="grid gap-8 sm:grid-cols-3">
        <Stat k="GMV" v="NT$18.4M" />
        <Stat k="ETA" v="9 min" />
        <Stat k="OTP" v="4821" />
      </section>
      <Field label="Location">
        <input defaultValue="Taipei 101" />
      </Field>
      <Surface>
        <p>Surface — use sparingly. Prefer space and type.</p>
      </Surface>
      <Empty title="No drivers nearby" body="We will keep looking, or switch to scheduled airport transfer." />
    </div>
  );
}
