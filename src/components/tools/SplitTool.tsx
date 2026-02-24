"use client";

import { useState } from "react";
import { DropZone } from "@/components/ui/DropZone";
import { Btn } from "@/components/ui/Btn";
import { DLRow, PageThumb, Panel, SL, type DownloadResult } from "@/components/ui/index";
import { Icon } from "@/components/ui/Icon";
import { loadPDFFile, renderAllThumbs, getPDFLib, createPDFBlobURL } from "@/lib/pdf-utils";
import { TOOL_PALETTE } from "@/lib/constants";

const COLOR = "#f59e0b";
type Mode = "select" | "range" | "every";

interface Page { id: string; num: number; }
interface Group { id: string; pages: Page[]; label: string; }

export function SplitTool({ toast }: { toast: (msg: string, type?: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [groups, setGroups] = useState<Group[]>([]);
  const [mode, setMode] = useState<Mode>("select");
  const [rangeStr, setRangeStr] = useState("");
  const [everyN, setEveryN] = useState(2);
  const [results, setResults] = useState<DownloadResult[]>([]);

  const loadFile = async (files: File[]) => {
    const f = files.find((f) => f.name.endsWith(".pdf") || f.type === "application/pdf");
    if (!f) return;
    toast("Loading PDF…", "info");
    try {
      const { pdf, count } = await loadPDFFile(f);
      const ts = await renderAllThumbs(pdf, count, 0.3);
      setFile(f);
      setPages(Array.from({ length: count }, (_, i) => ({ id: `p${i}`, num: i + 1 })));
      setThumbs(ts);
      setSelected(new Set()); setGroups([]); setResults([]);
      toast(`Loaded ${count} pages`, "success");
    } catch { toast("Failed to load PDF", "error"); }
  };

  const togglePage = (id: string) =>
    setSelected((p) => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const addGroup = () => {
    if (!selected.size) return;
    const gp = pages.filter((p) => selected.has(p.id));
    setGroups((prev) => [...prev, { id: `${Date.now()}`, pages: gp, label: `Part ${prev.length + 1}` }]);
    setSelected(new Set());
  };

  const applyRange = () => {
    const ng = rangeStr.split(",").map((part, i) => {
      const p = part.trim();
      let gp: Page[];
      if (p.includes("-")) {
        const [a, b] = p.split("-").map((n) => parseInt(n) - 1);
        gp = pages.slice(Math.max(0, a), Math.min(pages.length, b + 1));
      } else {
        const n = parseInt(p) - 1;
        gp = n >= 0 && n < pages.length ? [pages[n]] : [];
      }
      return { id: `${Date.now()}-${i}`, pages: gp, label: `Part ${i + 1}` };
    }).filter((g) => g.pages.length > 0);
    setGroups(ng);
    toast(`Created ${ng.length} groups`, "success");
  };

  const applyEvery = () => {
    const ng: Group[] = [];
    for (let i = 0; i < pages.length; i += everyN) {
      ng.push({ id: `${Date.now()}-${i}`, pages: pages.slice(i, i + everyN), label: `Part ${ng.length + 1}` });
    }
    setGroups(ng);
    toast(`Split into ${ng.length} groups`, "success");
  };

  const doSplit = async () => {
    if (!file) return;
    const { PDFDocument } = await getPDFLib();
    const ab = await file.arrayBuffer();
    const src = await PDFDocument.load(ab);
    const total = src.getPageCount();

    const groupIdxs: number[][] =
      groups.length > 0
        ? groups.map((g) => g.pages.map((p) => p.num - 1).filter((i) => i < total))
        : selected.size > 0
        ? [[...selected].map((id) => pages.findIndex((p) => p.id === id)).filter((i) => i >= 0 && i < total)]
        : [[...Array(total).keys()]];

    const urls: DownloadResult[] = [];
    for (let gi = 0; gi < groupIdxs.length; gi++) {
      const idxs = groupIdxs[gi];
      if (!idxs.length) continue;
      const nd = await PDFDocument.create();
      const cp = await nd.copyPages(src, idxs);
      cp.forEach((p: any) => nd.addPage(p));
      const bytes = await nd.save();
      const url = createPDFBlobURL(bytes);
      urls.push({ url, name: `split_part${gi + 1}.pdf`, size: bytes.length });
    }
    setResults(urls);
    toast(`Created ${urls.length} PDF file${urls.length !== 1 ? "s" : ""}`, "success");
  };

  const groupColors: Record<string, string> = {};
  groups.forEach((g, gi) =>
    g.pages.forEach((p) => { groupColors[p.id] = TOOL_PALETTE[gi % TOOL_PALETTE.length]; })
  );

  const ModeBtn = ({ id, label }: { id: Mode; label: string }) => (
    <button
      onClick={() => setMode(id)}
      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border"
      style={{
        borderColor: mode === id ? COLOR : "var(--border2)",
        background: mode === id ? `${COLOR}15` : "transparent",
        color: mode === id ? COLOR : "var(--text2)",
        fontFamily: "var(--font-display)",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-5">
      {!file ? (
        <DropZone onFiles={loadFile} accept=".pdf">
          <div className="text-center">
            <div className="text-5xl mb-3">✂️</div>
            <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>Split PDF</h3>
            <p className="text-sm" style={{ color: "var(--text2)" }}>Select pages visually · Range · Every N pages</p>
          </div>
        </DropZone>
      ) : (
        <>
          {/* Mode bar */}
          <div className="flex items-center gap-2 flex-wrap justify-between">
            <div className="flex gap-1.5">
              <ModeBtn id="select" label="✋ Select" />
              <ModeBtn id="range" label="📐 Range" />
              <ModeBtn id="every" label="🔢 Every N" />
            </div>
            <div className="flex gap-1.5">
              <Btn size="sm" variant="outline" onClick={() => setSelected(new Set(pages.map((p) => p.id)))}>All</Btn>
              <Btn size="sm" variant="outline" onClick={() => setSelected(new Set())}>None</Btn>
            </div>
          </div>

          {mode === "range" && (
            <div className="flex gap-2">
              <input
                value={rangeStr}
                onChange={(e) => setRangeStr(e.target.value)}
                placeholder="e.g. 1-3, 5, 7-10"
                className="flex-1 px-3.5 py-2.5 rounded-xl text-sm border"
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border2)",
                  color: "var(--text)",
                  fontFamily: "var(--font-mono)",
                  outline: "none",
                }}
              />
              <Btn onClick={applyRange} color={COLOR}>Apply</Btn>
            </div>
          )}

          {mode === "every" && (
            <div className="flex items-center gap-3">
              <span className="text-sm" style={{ color: "var(--text2)", fontFamily: "var(--font-display)" }}>Split every</span>
              <input
                type="number"
                value={everyN}
                min={1}
                max={pages.length}
                onChange={(e) => setEveryN(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-3 py-2 rounded-xl text-center border text-sm"
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border2)",
                  color: "var(--text)",
                  fontFamily: "var(--font-mono)",
                  outline: "none",
                }}
              />
              <span className="text-sm" style={{ color: "var(--text2)", fontFamily: "var(--font-display)" }}>pages</span>
              <Btn onClick={applyEvery} color={COLOR}>Apply</Btn>
            </div>
          )}

          {/* Page grid */}
          <div>
            <SL>{file.name} · {pages.length} pages · click to select</SL>
            <Panel>
              <div className="flex flex-wrap gap-3">
                {pages.map((p, i) => (
                  <PageThumb
                    key={p.id}
                    dataUrl={thumbs[i] ?? null}
                    pageNum={p.num}
                    selected={selected.has(p.id)}
                    onClick={mode === "select" ? () => togglePage(p.id) : undefined}
                    color={groupColors[p.id] ?? COLOR}
                    small
                  />
                ))}
              </div>
            </Panel>
          </div>

          {mode === "select" && selected.size > 0 && (
            <button
              onClick={addGroup}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed text-sm font-bold transition-opacity hover:opacity-80"
              style={{ color: COLOR, borderColor: COLOR, background: `${COLOR}08`, cursor: "pointer", fontFamily: "var(--font-display)" }}
            >
              <Icon name="plus" size={14} color={COLOR} />
              Group {selected.size} selected page{selected.size !== 1 ? "s" : ""} → Part {groups.length + 1}
            </button>
          )}

          {groups.length > 0 && (
            <div>
              <SL>Output — {groups.length} file{groups.length !== 1 ? "s" : ""} will be created</SL>
              <div className="flex flex-col gap-2">
                {groups.map((g, gi) => {
                  const c = TOOL_PALETTE[gi % TOOL_PALETTE.length];
                  return (
                    <div
                      key={g.id}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border"
                      style={{ background: `${c}06`, border: `1px solid ${c}25` }}
                    >
                      <span className="text-xs font-bold flex-shrink-0" style={{ color: c, fontFamily: "var(--font-mono)", minWidth: 48 }}>
                        Part {gi + 1}
                      </span>
                      <div className="flex gap-1 flex-1 overflow-x-auto flex-wrap">
                        {g.pages.map((p) => (
                          <div key={p.id} className="flex items-center gap-1">
                            {thumbs[p.num - 1] && (
                              <img src={thumbs[p.num - 1]} className="object-cover rounded" style={{ width: 18, height: 24, border: `1px solid ${c}40` }} alt="" />
                            )}
                            <span className="text-xs px-1 rounded" style={{ background: `${c}20`, color: c, fontFamily: "var(--font-mono)", fontWeight: 700 }}>P{p.num}</span>
                          </div>
                        ))}
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: "var(--text3)", fontFamily: "var(--font-mono)" }}>{g.pages.length}pg</span>
                      <button
                        onClick={() => setGroups((p) => p.filter((gg) => gg.id !== g.id))}
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{ background: "var(--red-dim)", border: "none", cursor: "pointer" }}
                      >
                        <Icon name="x" size={11} color="var(--red)" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <DLRow
            results={results}
            onReset={() => { setFile(null); setPages([]); setThumbs([]); setGroups([]); setSelected(new Set()); setResults([]); }}
            onProcess={doSplit}
            disabled={!file || (groups.length === 0 && selected.size === 0)}
            label={groups.length > 0 ? `Download ${groups.length} Parts` : "Split & Download"}
            color={COLOR}
          />
        </>
      )}
    </div>
  );
}
