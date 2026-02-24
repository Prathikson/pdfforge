"use client";

import { useState } from "react";
import { DropZone } from "@/components/ui/DropZone";
import { Icon } from "@/components/ui/Icon";
import { DLRow, Panel, SL, type DownloadResult } from "@/components/ui/index";
import { useDragReorder } from "@/hooks";
import { loadPDFFile, renderAllThumbs, getPDFLib, createPDFBlobURL, formatBytes } from "@/lib/pdf-utils";

interface PDFDoc {
  id: string;
  file: File;
  name: string;
  count: number;
  thumbs: string[];
}

const COLOR = "#7c6eff";

export function MergeTool({ toast }: { toast: (msg: string, type?: any) => void }) {
  const [docs, setDocs] = useState<PDFDoc[]>([]);
  const [results, setResults] = useState<DownloadResult[]>([]);
  const { dragIdx, overIdx, handleDragStart, handleDragOver, handleDrop, handleDragEnd } =
    useDragReorder(docs, setDocs);

  const addFiles = async (files: File[]) => {
    const pdfs = files.filter((f) => f.name.endsWith(".pdf") || f.type === "application/pdf");
    for (const f of pdfs) {
      toast(`Loading ${f.name}…`, "info");
      try {
        const { pdf, count } = await loadPDFFile(f);
        const thumbs = await renderAllThumbs(pdf, count, 0.3);
        setDocs((p) => [
          ...p,
          { id: `${Date.now()}-${Math.random()}`, file: f, name: f.name, count, thumbs },
        ]);
        toast(`${f.name} — ${count} page${count !== 1 ? "s" : ""}`, "success");
      } catch {
        toast(`Failed to load ${f.name}`, "error");
      }
    }
    setResults([]);
  };

  const removeDoc = (id: string) => setDocs((p) => p.filter((d) => d.id !== id));

  const doMerge = async () => {
    if (!docs.length) return;
    const { PDFDocument } = await getPDFLib();
    const merged = await PDFDocument.create();
    for (const doc of docs) {
      const ab = await doc.file.arrayBuffer();
      const src = await PDFDocument.load(ab);
      const pages = await merged.copyPages(src, src.getPageIndices());
      pages.forEach((p: any) => merged.addPage(p));
    }
    const bytes = await merged.save();
    const url = createPDFBlobURL(bytes);
    setResults([{ url, name: "merged.pdf", size: bytes.length }]);
    toast(`Merged ${docs.length} PDFs · ${formatBytes(bytes.length)}`, "success");
  };

  const totalPages = docs.reduce((s, d) => s + d.count, 0);

  return (
    <div className="flex flex-col gap-5">
      {docs.length === 0 ? (
        <DropZone onFiles={addFiles} accept=".pdf" multiple>
          <div className="text-center">
            <div className="text-5xl mb-3">🔗</div>
            <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>
              Merge PDFs
            </h3>
            <p className="text-sm" style={{ color: "var(--text2)" }}>
              Drop multiple PDFs · Combine in any order
            </p>
          </div>
        </DropZone>
      ) : (
        <>
          {/* File list */}
          <div>
            <SL>Files — drag to reorder</SL>
            <div className="flex flex-col gap-2">
              {docs.map((doc, i) => (
                <div
                  key={doc.id}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDrop={(e) => handleDrop(e, i)}
                  onDragEnd={handleDragEnd}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150"
                  style={{
                    background: "var(--surface)",
                    border: `1px solid ${overIdx === i && dragIdx !== i ? COLOR : "var(--border)"}`,
                    opacity: dragIdx === i ? 0.4 : 1,
                    cursor: "grab",
                    transform: dragIdx === i ? "scale(0.99)" : "scale(1)",
                  }}
                >
                  <Icon name="drag" size={16} color="var(--text3)" />

                  {/* Mini thumb strip */}
                  <div className="flex gap-1 overflow-hidden" style={{ maxWidth: 140 }}>
                    {doc.thumbs.slice(0, 4).map((t, pi) => (
                      <img
                        key={pi}
                        src={t}
                        className="object-cover rounded flex-shrink-0"
                        style={{ width: 24, height: 32, border: "1px solid var(--border2)" }}
                        alt=""
                      />
                    ))}
                    {doc.thumbs.length > 4 && (
                      <div
                        className="flex items-center justify-center rounded flex-shrink-0 text-xs"
                        style={{
                          width: 24,
                          height: 32,
                          background: "var(--surface3)",
                          border: "1px solid var(--border2)",
                          color: "var(--text3)",
                          fontFamily: "var(--font-mono)",
                          fontSize: 8,
                        }}
                      >
                        +{doc.thumbs.length - 4}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>
                      {doc.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text3)", fontFamily: "var(--font-mono)" }}>
                      {doc.count} pages · {formatBytes(doc.file.size)}
                    </p>
                  </div>

                  <span
                    className="text-xs flex-shrink-0"
                    style={{ color: COLOR, fontFamily: "var(--font-mono)", fontWeight: 700 }}
                  >
                    #{i + 1}
                  </span>

                  <button
                    onClick={() => removeDoc(doc.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--red-dim)", border: "none", cursor: "pointer" }}
                  >
                    <Icon name="x" size={12} color="var(--red)" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preview strip */}
          {totalPages > 0 && (
            <div>
              <SL>Output preview — {totalPages} total pages</SL>
              <Panel>
                <div className="flex gap-4 flex-wrap">
                  {docs.map((doc, di) => (
                    <div key={doc.id} className="flex items-start gap-3">
                      {di > 0 && (
                        <div
                          className="self-center"
                          style={{ width: 1, height: 80, background: `${COLOR}25`, flexShrink: 0 }}
                        />
                      )}
                      <div>
                        <p
                          className="text-xs mb-2 font-bold truncate"
                          style={{ color: COLOR, fontFamily: "var(--font-mono)", maxWidth: 80 }}
                        >
                          {doc.name.replace(".pdf", "").slice(0, 12)}
                        </p>
                        <div className="flex gap-1.5">
                          {doc.thumbs.map((t, pi) => (
                            <img
                              key={pi}
                              src={t}
                              className="object-cover rounded-lg flex-shrink-0"
                              style={{
                                width: 52,
                                height: 68,
                                border: "1.5px solid var(--border2)",
                              }}
                              alt=""
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add more */}
                  <label className="cursor-pointer self-center">
                    <div
                      className="flex flex-col items-center justify-center gap-1.5 rounded-xl"
                      style={{
                        width: 52,
                        height: 68,
                        border: "2px dashed var(--border2)",
                        color: "var(--text3)",
                      }}
                    >
                      <Icon name="plus" size={16} color="var(--text3)" />
                      <span style={{ fontSize: 7, fontFamily: "var(--font-mono)" }}>ADD</span>
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      className="hidden"
                      onChange={(e) => { if (e.target.files) addFiles([...e.target.files]); e.target.value = ""; }}
                    />
                  </label>
                </div>
              </Panel>
            </div>
          )}

          <DLRow
            results={results}
            onReset={() => { setDocs([]); setResults([]); }}
            onProcess={doMerge}
            disabled={docs.length < 1}
            label={`Merge ${docs.length} PDF${docs.length !== 1 ? "s" : ""}`}
            color={COLOR}
          />
        </>
      )}
    </div>
  );
}
