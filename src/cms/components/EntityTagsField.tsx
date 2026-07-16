"use client";

import { useField } from "@payloadcms/ui";
import type { ArrayFieldClientProps } from "payload";
import { useEffect, useState } from "react";

type TagType = "topic" | "competition" | "shooter" | "club" | "discipline";
type Tag = { id: string; type: TagType; label: string; refId?: number; disciplineCode?: string };
type Result = { id: number; name?: string; firstName?: string; lastName?: string; city?: string; date?: string; clubName?: string };

const apiUrl = process.env.NEXT_PUBLIC_SHOOTERMARKT_API_URL ?? "https://shootermarkt.vercel.app";
const entityEndpoints = { shooter: "shooters-search", competition: "competitions-search", club: "clubs-search" } as const;
const disciplines = ["ARM", "ARW", "APM", "APW", "R3PM", "R3PW"];

function resultLabel(result: Result, type: keyof typeof entityEndpoints) {
  if (type === "shooter") return [result.firstName, result.lastName, result.clubName].filter(Boolean).join(" · ");
  return [result.name, type === "competition" ? result.date : result.city].filter(Boolean).join(" · ");
}

export function EntityTagsField({ field, path }: ArrayFieldClientProps) {
  const { disabled, setValue, value } = useField<Tag[]>({ path });
  const tags = Array.isArray(value) ? value : [];
  const [type, setType] = useState<TagType>("topic");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!(type in entityEndpoints) || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const endpoint = entityEndpoints[type as keyof typeof entityEndpoints];
        const response = await fetch(`${apiUrl}/api/cms/${endpoint}?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
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
  }, [query, type]);

  function add(tag: Omit<Tag, "id">) {
    if (tags.some((item) => item.type === tag.type && item.refId === tag.refId && item.disciplineCode === tag.disciplineCode && item.label === tag.label)) return;
    setValue([...tags, { ...tag, id: crypto.randomUUID() }]);
    setQuery("");
    setResults([]);
  }

  return (
    <div className="field-type">
      <label className="field-label">{typeof field.label === "string" ? field.label : "Tagovi"}</label>
      <p className="field-description">Izaberi temu ili počni unos naziva; rezultati se učitavaju tek posle dva znaka.</p>
      <div className="flex gap-2 mb-2">
        <select className="select-input" disabled={disabled} onChange={(event) => { setType(event.target.value as TagType); setQuery(""); }} value={type}>
          <option value="topic">Tema</option>
          <option value="competition">Takmičenje</option>
          <option value="shooter">Strelac</option>
          <option value="club">Klub</option>
          <option value="discipline">Disciplina</option>
        </select>
        {type === "discipline" ? (
          <select className="select-input" disabled={disabled} onChange={(event) => add({ type, label: event.target.value, disciplineCode: event.target.value })} value="">
            <option value="">Dodaj disciplinu…</option>
            {disciplines.map((code) => <option key={code} value={code}>{code}</option>)}
          </select>
        ) : (
          <input className="text-input" disabled={disabled} onChange={(event) => setQuery(event.target.value)} placeholder={type === "topic" ? "Unesi temu" : "Pretraži…"} value={query} />
        )}
        {type === "topic" && <button className="btn btn--style-primary btn--size-small" disabled={disabled || !query.trim()} onClick={() => add({ type, label: query.trim() })} type="button">Dodaj</button>}
      </div>
      {type in entityEndpoints && query.trim().length >= 2 && (
        <div className="mb-2">
          {loading && <small>Pretraga…</small>}
          {!loading && results.map((result) => {
            const label = resultLabel(result, type as keyof typeof entityEndpoints);
            return <button className="btn btn--style-secondary btn--size-small mr-1 mb-1" key={result.id} onClick={() => add({ type: type as keyof typeof entityEndpoints, label, refId: result.id })} type="button">{label}</button>;
          })}
        </div>
      )}
      {tags.length > 0 && <div className="flex flex-wrap gap-1">{tags.map((tag) => <button className="btn btn--style-secondary btn--size-small" disabled={disabled} key={tag.id} onClick={() => setValue(tags.filter((item) => item.id !== tag.id))} type="button">{tag.label} ×</button>)}</div>}
    </div>
  );
}
