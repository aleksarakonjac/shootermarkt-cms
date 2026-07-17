"use client";

import { useField } from "@payloadcms/ui";
import type { NumberFieldClientProps } from "payload";
import { useEffect, useState } from "react";

type Entity = "shooter" | "competition";
type Result = { id: number; name?: string; firstName?: string; lastName?: string; clubName?: string; date?: string };

const apiUrl = process.env.NEXT_PUBLIC_SHOOTERMARKT_API_URL ?? "https://shootermarkt.vercel.app";

function labelFor(result: Result, entity: Entity) {
  if (entity === "shooter") return [result.firstName, result.lastName, result.clubName].filter(Boolean).join(" · ");
  const date = result.date ? new Intl.DateTimeFormat("sr-RS", { dateStyle: "medium" }).format(new Date(`${result.date}T00:00:00`)) : null;
  return [result.name, date].filter(Boolean).join(" · ");
}

export function EntityEmbedField({ entity, field, path }: NumberFieldClientProps & { entity: Entity }) {
  const { disabled, setValue, value } = useField<number | undefined>({ path });
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const entityLabel = entity === "shooter" ? "strelca" : "takmičenje";

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/api/cms/${entity === "shooter" ? "shooters" : "competitions"}-search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
        setResults(response.ok ? await response.json() as Result[] : []);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [entity, query]);

  return (
    <div className="field-type">
      <label className="field-label">{typeof field.label === "string" ? field.label : entityLabel}</label>
      <p className="field-description">Počni unos naziva; rezultati se učitavaju tek posle dva znaka.</p>
      {value && <p className="field-description">Izabrano: {selectedLabel || `ID ${value}`}</p>}
      <input className="text-input" disabled={disabled} onChange={(event) => setQuery(event.target.value)} placeholder={`Pretraži ${entityLabel}…`} value={query} />
      {query.trim().length >= 2 && (
        <div>
          {loading && <small>Pretraga…</small>}
          {!loading && results.map((result) => {
            const label = labelFor(result, entity);
            return <button className="btn btn--style-secondary btn--size-small mr-1 mb-1" key={result.id} onClick={() => { setValue(result.id); setSelectedLabel(label); setQuery(""); setResults([]); }} type="button">{label}</button>;
          })}
        </div>
      )}
      {value && <button className="btn btn--style-secondary btn--size-small" disabled={disabled} onClick={() => { setValue(undefined); setSelectedLabel(""); }} type="button">Ukloni izbor</button>}
    </div>
  );
}
