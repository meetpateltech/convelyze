"use client";
import React, { useCallback, useContext, useMemo, useState } from "react";
import Link from "next/link";
import { PromptContext } from "@/app/providers/PromptProvider";
import { parseTextToPrompts } from "@/lib/promptParser";
import { analyzePrompts } from "@/lib/promptAnalyzer";

export default function PromptsPage() {
  const { prompts: ctxPrompts, clearPrompts } = useContext(PromptContext);
  const [rawText, setRawText] = useState("");
  const [importedPrompts, setImportedPrompts] = useState<string[] | null>(null);
  const [minN, setMinN] = useState(1);
  const [maxN, setMaxN] = useState(2);
  const [minCount, setMinCount] = useState(2);
  const [removeStopwords, setRemoveStopwords] = useState(true);
  const [selectedN, setSelectedN] = useState<number>(2);
  const [topLimit, setTopLimit] = useState(50);
  const [templates, setTemplates] = useState<string[]>(() => {
    try { const raw = localStorage.getItem("cvx_prompt_templates"); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });

  const prompts = useMemo(() => {
    if (ctxPrompts && ctxPrompts.length) return ctxPrompts;
    if (importedPrompts && importedPrompts.length) return importedPrompts;
    if (!rawText) return [] as string[];
    return parseTextToPrompts(rawText);
  }, [ctxPrompts, importedPrompts, rawText]);

  const result = useMemo(() => analyzePrompts(prompts, {minN, maxN, minCount, removeStopwords}), [prompts, minN, maxN, minCount, removeStopwords]);

  function saveTemplate(phrase: string) {
    const t = [...templates, phrase];
    setTemplates(t);
    try { localStorage.setItem("cvx_prompt_templates", JSON.stringify(t)); } catch {}
  }

  const handleFileUpload = useCallback((file: File | null) => {
    if (!file) return;
    file.text().then(txt => {
      const extracted = parseTextToPrompts(txt);
      if (extracted.length) setImportedPrompts(extracted);
      else setRawText(txt);
    }).catch(()=>{/*ignore*/});
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Prompt-analys: återkommande fraser</h1>
          {ctxPrompts && ctxPrompts.length ? (
            <div className="text-sm text-green-400">Data från Dashboard är uppladdad — visar delade prompts</div>
          ) : (
            <div className="text-sm text-gray-500">Inga delade prompts. Importera eller klistra in.</div>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <Link href="/dashboard" className="px-3 py-1 rounded border">← Tillbaka till Dashboard</Link>
          <button className="px-3 py-1 rounded border" onClick={() => { clearPrompts(); setImportedPrompts(null); setRawText(""); }}>Rensa delad data</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium">Importera / Klistra in prompts / Ladda export (JSON)</label>
          <textarea className="w-full mt-1 p-2 rounded border" rows={6} value={rawText} onChange={(e) => setRawText(e.target.value)} placeholder="Klistra in export eller en lista på prompts (newline separated)" />
          <div className="flex gap-2 items-center mt-2">
            <input id="file" type="file" accept=".json,.txt" onChange={(e) => handleFileUpload(e.target.files?.[0] ?? null)} />
            <button className="px-3 py-1 rounded bg-gray-100 border" onClick={() => { setImportedPrompts(null); setRawText(""); }}>Rensa</button>
          </div>

          <div className="mt-3 bg-white p-3 rounded border">
            <div className="flex gap-2 items-center">
              <label className="text-sm">N-gram range</label>
              <input type="number" min={1} max={3} value={minN} onChange={(e) => setMinN(Number(e.target.value))} className="w-16 p-1 border rounded" />
              <span>-</span>
              <input type="number" min={1} max={5} value={maxN} onChange={(e) => setMaxN(Number(e.target.value))} className="w-16 p-1 border rounded" />
              <label className="ml-4 flex items-center text-sm"><input type="checkbox" checked={removeStopwords} onChange={(e) => setRemoveStopwords(e.target.checked)} className="mr-1" /> Ta bort stopwords (svenska)</label>
            </div>
            <div className="mt-2 flex gap-2 items-center">
              <label className="text-sm">Min count</label>
              <input type="number" value={minCount} onChange={(e) => setMinCount(Number(e.target.value))} className="w-20 p-1 border rounded" />
              <label className="ml-4 text-sm">Visa top</label>
              <input type="number" value={topLimit} onChange={(e) => setTopLimit(Number(e.target.value))} className="w-24 p-1 border rounded" />
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <div className="bg-white p-3 rounded border">
            <h3 className="font-medium">Sparade mallar</h3>
            <div className="mt-2 flex flex-col gap-2">
              {templates.length === 0 ? <div className="text-sm text-gray-500">Inga mallar sparade</div> : templates.map((t, i) => (
                <div key={i} className="p-2 border rounded bg-gray-50 text-sm">{t}</div>
              ))}
            </div>
            <div className="mt-3">
              <button className="px-3 py-1 rounded bg-sky-600 text-white" onClick={() => { const sample = prompts[0] ?? ''; if (sample) { const t = [...templates, sample]; setTemplates(t); localStorage.setItem("cvx_prompt_templates", JSON.stringify(t)); } }}>Spara första prompt som mall</button>
            </div>
          </div>

          <div className="mt-3 bg-white p-3 rounded border">
            <h3 className="font-medium">Hjälp</h3>
            <div className="text-sm text-gray-600 mt-2">Tips: importera din ChatGPT-export eller klistra in prompts. Ställ min-count till 2 eller 3 för att minska brus.</div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">Resultat ({selectedN}-gram)</h2>
        <div className="mt-3 border rounded bg-white">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Fras</th>
                <th className="p-2">Antal</th>
                <th className="p-2">Relativ</th>
                <th className="p-2">Exempel</th>
                <th className="p-2">Åtgärd</th>
              </tr>
            </thead>
            <tbody>
              {(result.ngrams[selectedN] ?? []).slice(0, topLimit).map((row, idx) => (
                <tr key={row.phrase} className="border-t">
                  <td className="p-2 align-top">{idx+1}</td>
                  <td className="p-2 align-top break-words">{row.phrase}</td>
                  <td className="p-2 align-top">{row.count}</td>
                  <td className="p-2 align-top text-sm text-gray-500">{((row.count / Math.max(1, result.totalPrompts)) * 100).toFixed(1)}%</td>
                  <td className="p-2 align-top text-sm text-gray-700">{row.examples.join(" • ")}</td>
                  <td className="p-2 align-top">
                    <div className="flex gap-2">
                      <button className="px-2 py-1 rounded border text-sm" onClick={() => { const t = [...templates, row.phrase]; setTemplates(t); localStorage.setItem("cvx_prompt_templates", JSON.stringify(t)); }}>Spara som mall</button>
                      <button className="px-2 py-1 rounded border text-sm" onClick={() => navigator.clipboard?.writeText(row.phrase)}>Kopiera</button>
                    </div>
                  </td>
                </tr>
              ))}
              {((result.ngrams[selectedN] ?? []).length === 0) && (
                <tr><td className="p-4" colSpan={6}>Inga fraser matchar dina filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
