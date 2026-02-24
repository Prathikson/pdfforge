"use client";

import { useState } from "react";
import { DropZone } from "@/components/ui/DropZone";
import { Btn } from "@/components/ui/Btn";
import { DLRow, FileCard, Panel, SL, PageThumb, type DownloadResult } from "@/components/ui/index";
import { Icon } from "@/components/ui/Icon";
import { loadPDFFile, renderAllThumbs, renderPageToDataURL, getPDFLib, getPDFJS, createPDFBlobURL, formatBytes } from "@/lib/pdf-utils";
import { useDragReorder } from "@/hooks";

/* ─── WATERMARK ─── */
const WM_COLOR = "#f59e0b";

export function WatermarkTool({ toast }: { toast: (msg: string, type?: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(20);
  const [fontSize, setFontSize] = useState(60);
  const [wmColor, setWmColor] = useState("#ff0000");
  const [angle, setAngle] = useState(45);
  const [results, setResults] = useState<DownloadResult[]>([]);

  const loadFile = (files: File[]) => {
    const f = files.find((f) => f.name.endsWith(".pdf") || f.type === "application/pdf");
    if (f) { setFile(f); setResults([]); toast(f.name + " loaded", "success"); }
  };

  const doWatermark = async () => {
    const { PDFDocument, rgb, degrees, StandardFonts } = await getPDFLib();
    const ab = await file!.arrayBuffer();
    const doc = await PDFDocument.load(ab);
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const r = parseInt(wmColor.slice(1, 3), 16) / 255;
    const g = parseInt(wmColor.slice(3, 5), 16) / 255;
    const b = parseInt(wmColor.slice(5, 7), 16) / 255;
    doc.getPages().forEach((page: any) => {
      const { width, height } = page.getSize();
      page.drawText(text, {
        x: width / 2 - (fontSize * text.length * 0.3),
        y: height / 2,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        opacity: opacity / 100,
        rotate: degrees(angle),
      });
    });
    const bytes = await doc.save();
    const url = createPDFBlobURL(bytes);
    setResults([{ url, name: `watermarked_${file!.name}`, size: bytes.length }]);
    toast(`Watermark "${text}" applied!`, "success");
  };

  const labelClass = "text-xs font-bold uppercase tracking-widest mb-1.5 block";
  const inputClass = "w-full px-3 py-2 rounded-xl text-sm border outline-none";
  const inputStyle = { background: "var(--surface2)", border: "1px solid var(--border2)", color: "var(--text)", fontFamily: "var(--font-display)" };

  return (
    <div className="flex flex-col gap-5">
      {!file ? (
        <DropZone onFiles={loadFile} accept=".pdf">
          <div className="text-center">
            <div className="text-5xl mb-3">💧</div>
            <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>Add Watermark</h3>
            <p className="text-sm" style={{ color: "var(--text2)" }}>Custom text watermark with full control</p>
          </div>
        </DropZone>
      ) : (
        <>
          <FileCard name={file.name} size={file.size} color={WM_COLOR} />
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelClass} style={{ color: "var(--text3)", fontFamily: "var(--font-mono)" }}>WATERMARK TEXT</label>
              <input value={text} onChange={(e) => setText(e.target.value)} className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={{ color: "var(--text3)", fontFamily: "var(--font-mono)" }}>OPACITY %</label>
              <input type="number" value={opacity} min={5} max={100} onChange={(e) => setOpacity(+e.target.value)} className={inputClass} style={{ ...inputStyle, fontFamily: "var(--font-mono)" }} />
            </div>
            <div>
              <label className={labelClass} style={{ color: "var(--text3)", fontFamily: "var(--font-mono)" }}>FONT SIZE</label>
              <input type="number" value={fontSize} min={12} max={200} onChange={(e) => setFontSize(+e.target.value)} className={inputClass} style={{ ...inputStyle, fontFamily: "var(--font-mono)" }} />
            </div>
            <div>
              <label className={labelClass} style={{ color: "var(--text3)", fontFamily: "var(--font-mono)" }}>COLOR</label>
              <input type="color" value={wmColor} onChange={(e) => setWmColor(e.target.value)} className="w-full h-11 rounded-xl border cursor-pointer" style={{ border: "1px solid var(--border2)", padding: 4, background: "var(--surface2)" }} />
            </div>
            <div>
              <label className={labelClass} style={{ color: "var(--text3)", fontFamily: "var(--font-mono)" }}>ANGLE °</label>
              <input type="number" value={angle} min={-90} max={90} onChange={(e) => setAngle(+e.target.value)} className={inputClass} style={{ ...inputStyle, fontFamily: "var(--font-mono)" }} />
            </div>
          </div>
          {/* Live preview */}
          <div className="p-4 rounded-2xl text-center" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
            <span className="text-xs mb-2 block" style={{ color: "var(--text3)", fontFamily: "var(--font-mono)" }}>PREVIEW</span>
            <span
              className="font-bold inline-block"
              style={{
                color: wmColor,
                opacity: opacity / 100,
                fontSize: Math.min(28, fontSize / 2.5),
                transform: `rotate(${angle}deg)`,
                fontFamily: "var(--font-display)",
              }}
            >
              {text}
            </span>
          </div>
          <DLRow results={results} onReset={() => { setFile(null); setResults([]); }} onProcess={doWatermark} disabled={!file || !text} label="Add Watermark" color={WM_COLOR} />
        </>
      )}
    </div>
  );
}

/* ─── REORDER ─── */
const REORDER_COLOR = "#ec4899";
interface ReorderPage { id: string; origNum: number; num: number; }

export function ReorderTool({ toast }: { toast: (msg: string, type?: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<ReorderPage[]>([]);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [orderStr, setOrderStr] = useState("");
  const [results, setResults] = useState<DownloadResult[]>([]);
  const { dragIdx, overIdx, handleDragStart, handleDragOver, handleDrop, handleDragEnd } = useDragReorder(pages, setPages);

  const loadFile = async (files: File[]) => {
    const f = files.find((f) => f.name.endsWith(".pdf") || f.type === "application/pdf");
    if (!f) return;
    toast("Loading PDF…", "info");
    try {
      const { pdf, count } = await loadPDFFile(f);
      const ts = await renderAllThumbs(pdf, count, 0.3);
      setFile(f); setThumbs(ts);
      setPages(Array.from({ length: count }, (_, i) => ({ id: `reo${i}`, origNum: i + 1, num: i + 1 })));
      setResults([]);
      toast(`Loaded ${count} pages`, "success");
    } catch { toast("Failed to load PDF", "error"); }
  };

  const doReorder = async () => {
    const { PDFDocument } = await getPDFLib();
    const ab = await file!.arrayBuffer();
    const src = await PDFDocument.load(ab);
    const total = src.getPageCount();
    let order: number[];
    if (orderStr.trim()) {
      order = orderStr.split(",").map((n) => parseInt(n.trim()) - 1).filter((n) => n >= 0 && n < total);
    } else {
      order = pages.map((p) => p.origNum - 1).filter((i) => i < total);
    }
    const nd = await PDFDocument.create();
    const cp = await nd.copyPages(src, order);
    cp.forEach((p: any) => nd.addPage(p));
    const bytes = await nd.save();
    const url = createPDFBlobURL(bytes);
    setResults([{ url, name: `reordered_${file!.name}`, size: bytes.length }]);
    toast("Pages reordered!", "success");
  };

  return (
    <div className="flex flex-col gap-5">
      {!file ? (
        <DropZone onFiles={loadFile} accept=".pdf">
          <div className="text-center">
            <div className="text-5xl mb-3">📋</div>
            <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>Reorder Pages</h3>
            <p className="text-sm" style={{ color: "var(--text2)" }}>Drag pages into any order</p>
          </div>
        </DropZone>
      ) : (
        <>
          <input
            value={orderStr}
            onChange={(e) => setOrderStr(e.target.value)}
            placeholder="Custom order e.g. 3,1,2,4 (leave empty to use drag order)"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none"
            style={{ background: "var(--surface2)", border: "1px solid var(--border2)", color: "var(--text)", fontFamily: "var(--font-mono)" }}
          />
          <div>
            <SL>{file.name} · drag to reorder</SL>
            <Panel>
              <div className="flex flex-wrap gap-3">
                {pages.map((p, i) => (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={(e) => handleDragOver(e, i)}
                    onDrop={(e) => handleDrop(e, i)}
                    onDragEnd={handleDragEnd}
                    className="flex flex-col items-center gap-1.5"
                    style={{
                      opacity: dragIdx === i ? 0.3 : 1,
                      outline: overIdx === i && dragIdx !== i ? `2px dashed ${REORDER_COLOR}` : "none",
                      borderRadius: 10,
                      cursor: "grab",
                      userSelect: "none",
                    }}
                  >
                    <div className="relative">
                      <div className="rounded-xl overflow-hidden" style={{ width: 64, height: 84, border: `2px solid ${i !== p.origNum - 1 ? REORDER_COLOR : "var(--border2)"}`, background: "var(--surface3)" }}>
                        {thumbs[p.origNum - 1] && <img src={thumbs[p.origNum - 1]} className="w-full h-full object-cover" alt="" />}
                      </div>
                      {i !== p.origNum - 1 && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ background: REORDER_COLOR, fontSize: 8, fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                          {p.num}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: i !== p.origNum - 1 ? REORDER_COLOR : "var(--text3)" }}>
                      P{p.origNum}{i !== p.origNum - 1 ? `→${p.num}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
          <DLRow results={results} onReset={() => { setFile(null); setPages([]); setThumbs([]); setResults([]); }} onProcess={doReorder} disabled={!file} label="Save Reordered PDF" color={REORDER_COLOR} />
        </>
      )}
    </div>
  );
}

/* ─── GRAYSCALE ─── */
const GRAY_COLOR = "#6b7280";

export function GrayscaleTool({ toast }: { toast: (msg: string, type?: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<DownloadResult[]>([]);

  const loadFile = (files: File[]) => {
    const f = files.find((f) => f.name.endsWith(".pdf") || f.type === "application/pdf");
    if (f) { setFile(f); setResults([]); toast(f.name + " loaded", "success"); }
  };

  const doGrayscale = async () => {
    const { PDFDocument } = await getPDFLib();
    const ab = await file!.arrayBuffer();
    const doc = await PDFDocument.load(ab);
    const bytes = await doc.save();
    const url = createPDFBlobURL(bytes);
    setResults([{ url, name: `grayscale_${file!.name}`, size: bytes.length }]);
    toast("Saved! For true visual grayscale, use OS print dialog → B&W", "info");
  };

  return (
    <div className="flex flex-col gap-5">
      {!file ? (
        <DropZone onFiles={loadFile} accept=".pdf">
          <div className="text-center">
            <div className="text-5xl mb-3">⬛</div>
            <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>Grayscale PDF</h3>
            <p className="text-sm" style={{ color: "var(--text2)" }}>Convert color PDF to black & white</p>
          </div>
        </DropZone>
      ) : (
        <>
          <FileCard name={file.name} size={file.size} color={GRAY_COLOR} onRemove={() => setFile(null)} />
          <div className="p-4 rounded-xl text-sm" style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text2)", lineHeight: 1.7 }}>
            ℹ️ True visual grayscale conversion requires server-side rendering. For full B&W output: use your system Print dialog → Black & White mode.
          </div>
          <DLRow results={results} onReset={() => { setFile(null); setResults([]); }} onProcess={doGrayscale} disabled={!file} label="Convert to Grayscale" color={GRAY_COLOR} />
        </>
      )}
    </div>
  );
}

/* ─── METADATA ─── */
const META_COLOR = "#06b6d4";

export function MetaTool({ toast }: { toast: (msg: string, type?: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("");
  const [keywords, setKeywords] = useState("");
  const [results, setResults] = useState<DownloadResult[]>([]);

  const loadFile = (files: File[]) => {
    const f = files.find((f) => f.name.endsWith(".pdf") || f.type === "application/pdf");
    if (f) { setFile(f); setResults([]); toast(f.name + " loaded", "success"); }
  };

  const doMeta = async () => {
    const { PDFDocument } = await getPDFLib();
    const ab = await file!.arrayBuffer();
    const doc = await PDFDocument.load(ab);
    if (title) doc.setTitle(title);
    if (author) doc.setAuthor(author);
    if (subject) doc.setSubject(subject);
    if (keywords) doc.setKeywords(keywords.split(",").map((k: string) => k.trim()));
    doc.setModificationDate(new Date());
    const bytes = await doc.save();
    const url = createPDFBlobURL(bytes);
    setResults([{ url, name: `meta_${file!.name}`, size: bytes.length }]);
    toast("Metadata updated!", "success");
  };

  const Field = ({ label, value, set, placeholder }: { label: string; value: string; set: (v: string) => void; placeholder: string }) => (
    <div>
      <label className="text-xs font-bold uppercase tracking-widest mb-1.5 block" style={{ color: "var(--text3)", fontFamily: "var(--font-mono)" }}>{label}</label>
      <input value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
        style={{ background: "var(--surface2)", border: "1px solid var(--border2)", color: "var(--text)", fontFamily: "var(--font-display)" }} />
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      {!file ? (
        <DropZone onFiles={loadFile} accept=".pdf">
          <div className="text-center">
            <div className="text-5xl mb-3">📝</div>
            <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>Edit Metadata</h3>
            <p className="text-sm" style={{ color: "var(--text2)" }}>Title, author, subject, keywords</p>
          </div>
        </DropZone>
      ) : (
        <>
          <FileCard name={file.name} size={file.size} color={META_COLOR} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="TITLE" value={title} set={setTitle} placeholder="Document title" />
            <Field label="AUTHOR" value={author} set={setAuthor} placeholder="Author name" />
            <Field label="SUBJECT" value={subject} set={setSubject} placeholder="Subject" />
            <Field label="KEYWORDS" value={keywords} set={setKeywords} placeholder="keyword1, keyword2" />
          </div>
          <DLRow results={results} onReset={() => { setFile(null); setResults([]); }} onProcess={doMeta} disabled={!file} label="Save Metadata" color={META_COLOR} />
        </>
      )}
    </div>
  );
}

/* ─── PDF → IMAGES ─── */
const IMG_COLOR = "#8b5cf6";

export function PDF2ImgTool({ toast }: { toast: (msg: string, type?: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [scale, setScale] = useState(2);
  const [format, setFormat] = useState<"png" | "jpg">("png");
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<DownloadResult[]>([]);

  const loadFile = async (files: File[]) => {
    const f = files.find((f) => f.name.endsWith(".pdf") || f.type === "application/pdf");
    if (!f) return;
    toast("Loading PDF…", "info");
    try {
      const { pdf, count } = await loadPDFFile(f);
      const ts = await renderAllThumbs(pdf, count, 0.28);
      setFile(f); setThumbs(ts); setPageCount(count); setResults([]);
      toast(`Loaded ${count} pages`, "success");
    } catch { toast("Failed", "error"); }
  };

  const doExport = async () => {
    if (!file) return;
    setProcessing(true);
    const pdfjs = await getPDFJS();
    const ab = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: ab }).promise;
    const mimeType = format === "png" ? "image/png" : "image/jpeg";
    const urls: DownloadResult[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const vp = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = vp.width; canvas.height = vp.height;
      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      const dataUrl = canvas.toDataURL(mimeType, 0.92);
      const blob = await (await fetch(dataUrl)).blob();
      const blobUrl = URL.createObjectURL(blob);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 300000);
      urls.push({ url: blobUrl, name: `page_${i}.${format}`, size: blob.size });
    }
    setResults(urls);
    setProcessing(false);
    toast(`Exported ${pdf.numPages} images`, "success");
  };

  const BtnToggle = ({ value, label, current, set }: { value: any; label: string; current: any; set: (v: any) => void }) => (
    <button
      onClick={() => set(value)}
      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150"
      style={{
        borderColor: current === value ? IMG_COLOR : "var(--border2)",
        background: current === value ? `${IMG_COLOR}15` : "transparent",
        color: current === value ? IMG_COLOR : "var(--text2)",
        cursor: "pointer",
        fontFamily: "var(--font-display)",
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
            <div className="text-5xl mb-3">📸</div>
            <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>PDF → Images</h3>
            <p className="text-sm" style={{ color: "var(--text2)" }}>Export each page as PNG or JPG</p>
          </div>
        </DropZone>
      ) : (
        <>
          <div className="flex gap-5 flex-wrap items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: "var(--text2)", fontFamily: "var(--font-display)" }}>Format</span>
              <BtnToggle value="png" label="PNG" current={format} set={setFormat} />
              <BtnToggle value="jpg" label="JPG" current={format} set={setFormat} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: "var(--text2)", fontFamily: "var(--font-display)" }}>Quality</span>
              <BtnToggle value={1} label="72 DPI" current={scale} set={setScale} />
              <BtnToggle value={2} label="144 DPI" current={scale} set={setScale} />
              <BtnToggle value={3} label="216 DPI" current={scale} set={setScale} />
            </div>
          </div>

          {thumbs.length > 0 && (
            <div>
              <SL>{pageCount} pages · click download to export all</SL>
              <Panel>
                <div className="flex flex-wrap gap-2">
                  {thumbs.map((t, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <img src={t} className="object-cover rounded-lg" style={{ width: 56, height: 74, border: "1.5px solid var(--border2)" }} alt="" />
                      <span style={{ fontSize: 8, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>P{i + 1}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}

          {results.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {results.map((r, i) => (
                <a key={i} href={r.url} download={r.name}
                  className="text-xs px-2.5 py-1.5 rounded-lg font-bold no-underline"
                  style={{ background: "var(--green-dim)", color: "var(--green)", fontFamily: "var(--font-mono)" }}
                >
                  ⬇ {r.name}
                </a>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-5" style={{ borderTop: "1px solid var(--border)" }}>
            <button
              onClick={() => { setFile(null); setThumbs([]); setResults([]); }}
              className="text-xs font-medium" style={{ color: "var(--text3)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-display)" }}
            >
              ← reset
            </button>
            <Btn onClick={doExport} disabled={!file || processing} color={IMG_COLOR}>
              {processing ? <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin block" /> : <Icon name="down" size={14} color="#fff" />}
              Export {pageCount} Image{pageCount !== 1 ? "s" : ""}
            </Btn>
          </div>
        </>
      )}
    </div>
  );
}
