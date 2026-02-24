"use client";

import { useState } from "react";
import { DropZone } from "@/components/ui/DropZone";
import { Btn } from "@/components/ui/Btn";
import { DLRow, Panel, SL, type DownloadResult } from "@/components/ui/index";
import { Icon } from "@/components/ui/Icon";
import { loadPDFFile, renderAllThumbs, getPDFLib, createPDFBlobURL } from "@/lib/pdf-utils";

const COLOR = "#10b981";
interface Page { id: string; num: number; }

export function RotateTool({ toast }: { toast: (msg: string, type?: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rotations, setRotations] = useState<Record<string, number>>({});
  const [results, setResults] = useState<DownloadResult[]>([]);

  const loadFile = async (files: File[]) => {
    const f = files.find((f) => f.name.endsWith(".pdf") || f.type === "application/pdf");
    if (!f) return;
    toast("Loading PDF…", "info");
    try {
      const { pdf, count } = await loadPDFFile(f);
      const ts = await renderAllThumbs(pdf, count, 0.3);
      setFile(f);
      setPages(Array.from({ length: count }, (_, i) => ({ id: `r${i}`, num: i + 1 })));
      setThumbs(ts);
      setRotations({}); setSelected(new Set()); setResults([]);
      toast(`Loaded ${count} pages`, "success");
    } catch { toast("Failed to load PDF", "error"); }
  };

  const togglePage = (id: string) =>
    setSelected((p) => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const rotate = (deg: number) => {
    const targets = selected.size > 0 ? [...selected] : pages.map((p) => p.id);
    setRotations((prev) => {
      const n = { ...prev };
      targets.forEach((id) => { n[id] = ((n[id] ?? 0) + deg + 360) % 360; });
      return n;
    });
  };

  const doRotate = async () => {
    if (!file) return;
    const { PDFDocument, degrees } = await getPDFLib();
    const ab = await file.arrayBuffer();
    const doc = await PDFDocument.load(ab);
    const total = doc.getPageCount();
    pages.forEach((p, i) => {
      if (i < total && rotations[p.id]) {
        const page = doc.getPage(i);
        const cur = page.getRotation().angle;
        page.setRotation(degrees((cur + (rotations[p.id] ?? 0)) % 360));
      }
    });
    const bytes = await doc.save();
    const url = createPDFBlobURL(bytes);
    setResults([{ url, name: `rotated_${file.name}`, size: bytes.length }]);
    toast("Rotation applied!", "success");
  };

  const rotatedCount = Object.keys(rotations).length;

  return (
    <div className="flex flex-col gap-5">
      {!file ? (
        <DropZone onFiles={loadFile} accept=".pdf">
          <div className="text-center">
            <div className="text-5xl mb-3">🔄</div>
            <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>Rotate Pages</h3>
            <p className="text-sm" style={{ color: "var(--text2)" }}>Click pages to select · Live rotation preview</p>
          </div>
        </DropZone>
      ) : (
        <>
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--text3)", fontFamily: "var(--font-mono)" }}>
                {selected.size > 0 ? `${selected.size} selected:` : "All pages:"}
              </span>
              {[{ l: "↩ 90° CW", d: 90 }, { l: "↪ 90° CCW", d: 270 }, { l: "↔ 180°", d: 180 }].map(({ l, d }) => (
                <button
                  key={d}
                  onClick={() => rotate(d)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-opacity hover:opacity-80"
                  style={{
                    color: COLOR,
                    borderColor: COLOR,
                    background: `${COLOR}10`,
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Btn size="sm" variant="outline" onClick={() =>
                selected.size > 0 ? setSelected(new Set()) : setSelected(new Set(pages.map((p) => p.id)))
              }>
                {selected.size > 0 ? "Deselect" : "Select All"}
              </Btn>
              {rotatedCount > 0 && (
                <Btn size="sm" variant="outline" onClick={() => setRotations({})}>Reset</Btn>
              )}
            </div>
          </div>

          <div>
            <SL>
              {rotatedCount > 0 ? `${rotatedCount} page${rotatedCount !== 1 ? "s" : ""} rotated` : "Click pages to select, then rotate"}
            </SL>
            <Panel>
              <div className="flex flex-wrap gap-3">
                {pages.map((p, i) => {
                  const deg = rotations[p.id] ?? 0;
                  const sel = selected.has(p.id);
                  return (
                    <div key={p.id} className="flex flex-col items-center gap-1.5">
                      <div
                        onClick={() => togglePage(p.id)}
                        className="relative overflow-hidden rounded-xl transition-all duration-150"
                        style={{
                          width: 64,
                          height: 84,
                          border: `2px solid ${sel ? COLOR : deg ? `${COLOR}50` : "var(--border2)"}`,
                          boxShadow: sel ? `0 0 0 3px ${COLOR}25` : "var(--card-shadow)",
                          cursor: "pointer",
                          background: "var(--surface3)",
                        }}
                      >
                        {thumbs[i] && (
                          <img
                            src={thumbs[i]}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                              transform: `rotate(${deg}deg)`,
                              transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                              transformOrigin: "center center",
                            }}
                            alt=""
                          />
                        )}
                        {sel && (
                          <div
                            className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: COLOR }}
                          >
                            <Icon name="check" size={9} color="#fff" />
                          </div>
                        )}
                        {deg !== 0 && (
                          <div
                            className="absolute bottom-1 left-1 text-white rounded px-1"
                            style={{ fontSize: 7, fontWeight: 700, background: COLOR, fontFamily: "var(--font-mono)" }}
                          >
                            {deg}°
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          style={{
                            fontSize: 9,
                            color: deg ? COLOR : "var(--text3)",
                            fontFamily: "var(--font-mono)",
                            fontWeight: deg ? 700 : 400,
                          }}
                        >
                          P{p.num}
                        </span>
                        {deg !== 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRotations((r) => { const n = { ...r }; delete n[p.id]; return n; });
                            }}
                            className="w-3 h-3 rounded-full flex items-center justify-center"
                            style={{ background: "var(--red-dim)", border: "none", cursor: "pointer", fontSize: 7, color: "var(--red)" }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>

          {rotatedCount > 0 && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{ background: `${COLOR}08`, border: `1px solid ${COLOR}20`, color: "var(--text2)", lineHeight: 1.75 }}
            >
              {pages.filter((p) => rotations[p.id]).map((p) => `P${p.num}: ${rotations[p.id]}°`).join(" · ")}
            </div>
          )}

          <DLRow
            results={results}
            onReset={() => { setFile(null); setPages([]); setThumbs([]); setRotations({}); setResults([]); }}
            onProcess={doRotate}
            disabled={!file || !rotatedCount}
            label="Download Rotated PDF"
            color={COLOR}
          />
        </>
      )}
    </div>
  );
}
