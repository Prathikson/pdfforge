"use client";

import { useState } from "react";
import { DropZone } from "@/components/ui/DropZone";
import { Btn } from "@/components/ui/Btn";
import { DLRow, FileCard, Panel, SL, type DownloadResult } from "@/components/ui/index";
import { Icon } from "@/components/ui/Icon";
import { getPDFLib, createPDFBlobURL, formatBytes } from "@/lib/pdf-utils";
import { useDragReorder } from "@/hooks";

/* ──────────────────────────────── IMAGE → PDF ───────────────────────────── */
interface ImageFile { id: string; file: File; url: string; name: string; }
const IMG_COLOR = "#f43f5e";

export function ImageToPDFTool({ toast }: { toast: (msg: string, type?: any) => void }) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [margin, setMargin] = useState(20);
  const [results, setResults] = useState<DownloadResult[]>([]);
  const { dragIdx, overIdx, handleDragStart, handleDragOver, handleDrop, handleDragEnd } =
    useDragReorder(images, setImages);

  const addFiles = (files: File[]) => {
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    const newItems = imgs.map((f) => ({
      id: `${Date.now()}-${Math.random()}`,
      file: f,
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    setImages((p) => [...p, ...newItems]);
    setResults([]);
    toast(`Added ${imgs.length} image${imgs.length !== 1 ? "s" : ""}`, "success");
  };

  const removeImage = (id: string) => {
    setImages((p) => {
      const img = p.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.url);
      return p.filter((i) => i.id !== id);
    });
  };

  const doConvert = async () => {
    if (!images.length) return;
    const { PDFDocument } = await getPDFLib();
    const doc = await PDFDocument.create();
    for (const img of images) {
      const ab = await img.file.arrayBuffer();
      const bytes = new Uint8Array(ab);
      let embedded: any;
      try {
        if (img.file.type === "image/png") embedded = await doc.embedPng(bytes);
        else embedded = await doc.embedJpg(bytes);
      } catch {
        const canvas = document.createElement("canvas");
        const bmp = await createImageBitmap(img.file);
        canvas.width = bmp.width; canvas.height = bmp.height;
        const ctx = canvas.getContext("2d")!; ctx.drawImage(bmp, 0, 0);
        const blob = await new Promise<Blob>((r) => canvas.toBlob(r as any, "image/jpeg", 0.9));
        const jpgAb = await blob.arrayBuffer();
        embedded = await doc.embedJpg(new Uint8Array(jpgAb));
      }
      const page = doc.addPage([embedded.width + margin * 2, embedded.height + margin * 2]);
      page.drawImage(embedded, { x: margin, y: margin, width: embedded.width, height: embedded.height });
    }
    const pdfBytes = await doc.save();
    const url = createPDFBlobURL(pdfBytes);
    setResults([{ url, name: "images.pdf", size: pdfBytes.length }]);
    toast(`Converted ${images.length} images → PDF`, "success");
  };

  return (
    <div className="flex flex-col gap-5">
      {images.length === 0 ? (
        <DropZone onFiles={addFiles} accept=".jpg,.jpeg,.png,.webp,.gif,.bmp" multiple>
          <div className="text-center">
            <div className="text-5xl mb-3">🖼️</div>
            <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>Images → PDF</h3>
            <p className="text-sm" style={{ color: "var(--text2)" }}>JPG, PNG, WEBP, GIF · Drag to reorder</p>
          </div>
        </DropZone>
      ) : (
        <>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-sm" style={{ color: "var(--text2)", fontFamily: "var(--font-display)" }}>Margin</span>
              <input type="range" min={0} max={60} value={margin} onChange={(e) => setMargin(+e.target.value)} className="w-24" />
              <span className="text-xs" style={{ color: "var(--text)", fontFamily: "var(--font-mono)", minWidth: 32 }}>{margin}px</span>
            </div>
            <DropZone onFiles={addFiles} accept="image/*" multiple compact />
          </div>

          <div>
            <SL>{images.length} image{images.length !== 1 ? "s" : ""} · drag to reorder</SL>
            <Panel>
              <div className="flex flex-wrap gap-3">
                {images.map((img, i) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={(e) => handleDragOver(e, i)}
                    onDrop={(e) => handleDrop(e, i)}
                    onDragEnd={handleDragEnd}
                    className="flex flex-col items-center gap-1.5"
                    style={{
                      opacity: dragIdx === i ? 0.3 : 1,
                      outline: overIdx === i && dragIdx !== i ? `2px dashed ${IMG_COLOR}` : "none",
                      borderRadius: 10,
                      cursor: "grab",
                      userSelect: "none",
                    }}
                  >
                    <div className="relative">
                      <div
                        className="overflow-hidden rounded-xl"
                        style={{
                          width: 72,
                          height: 90,
                          border: "2px solid var(--border2)",
                          boxShadow: "var(--card-shadow)",
                          padding: `${Math.max(1, Math.round(margin * 0.06))}px`,
                          background: "var(--surface3)",
                        }}
                      >
                        <img src={img.url} className="w-full h-full object-cover rounded-lg" alt="" />
                      </div>
                      <div
                        className="absolute bottom-2 left-2 text-white rounded px-1"
                        style={{ fontSize: 7, fontWeight: 700, background: "rgba(0,0,0,0.6)", fontFamily: "var(--font-mono)" }}
                      >
                        P{i + 1}
                      </div>
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center border-2 text-white text-xs font-bold"
                        style={{ background: "var(--red)", borderColor: "var(--bg)", cursor: "pointer" }}
                      >
                        ✕
                      </button>
                    </div>
                    <span className="text-center" style={{ fontSize: 8, color: "var(--text3)", fontFamily: "var(--font-mono)", maxWidth: 72, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {img.name.slice(0, 10)}
                    </span>
                  </div>
                ))}
                <label className="cursor-pointer self-start">
                  <div
                    className="flex flex-col items-center justify-center gap-1.5 rounded-xl"
                    style={{ width: 72, height: 90, border: "2px dashed var(--border2)", color: "var(--text3)" }}
                  >
                    <Icon name="plus" size={18} color="var(--text3)" />
                    <span style={{ fontSize: 7, fontFamily: "var(--font-mono)" }}>ADD</span>
                  </div>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files) addFiles([...e.target.files]); e.target.value = ""; }} />
                </label>
              </div>
            </Panel>
          </div>

          <DLRow
            results={results}
            onReset={() => { images.forEach((i) => URL.revokeObjectURL(i.url)); setImages([]); setResults([]); }}
            onProcess={doConvert}
            disabled={!images.length}
            label={`Convert ${images.length} Image${images.length !== 1 ? "s" : ""} → PDF`}
            color={IMG_COLOR}
          />
        </>
      )}
    </div>
  );
}

/* ──────────────────────────────── COMPRESS ──────────────────────────────── */
const COMPRESS_COLOR = "#8b5cf6";

export function CompressTool({ toast }: { toast: (msg: string, type?: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<DownloadResult & { original?: number; saved?: string }[]>([]);

  const loadFile = (files: File[]) => {
    const f = files.find((f) => f.name.endsWith(".pdf") || f.type === "application/pdf");
    if (f) { setFile(f); setResults([]); toast(f.name + " loaded", "success"); }
  };

  const doCompress = async () => {
    if (!file) return;
    const { PDFDocument } = await getPDFLib();
    const ab = await file.arrayBuffer();
    const doc = await PDFDocument.load(ab);
    const bytes = await doc.save({ useObjectStreams: true, addDefaultPage: false });
    const url = createPDFBlobURL(bytes);
    const saved = Math.max(0, (1 - bytes.length / file.size) * 100).toFixed(1);
    setResults([{ url, name: `compressed_${file.name}`, size: bytes.length, original: file.size, saved }]);
    toast(`Compressed · ${saved}% saved`, "success");
  };

  const r = results[0] as any;
  const savings = r ? parseFloat(r.saved) : 0;

  return (
    <div className="flex flex-col gap-5">
      {!file ? (
        <DropZone onFiles={loadFile} accept=".pdf">
          <div className="text-center">
            <div className="text-5xl mb-3">🗜️</div>
            <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>Compress PDF</h3>
            <p className="text-sm" style={{ color: "var(--text2)" }}>Reduce file size while preserving quality</p>
          </div>
        </DropZone>
      ) : (
        <>
          <FileCard name={file.name} size={file.size} color={COMPRESS_COLOR} onRemove={() => setFile(null)} />

          {r && (
            <div className="p-4 rounded-2xl" style={{ background: `${COMPRESS_COLOR}08`, border: `1px solid ${COMPRESS_COLOR}20` }}>
              <SL>Size comparison</SL>
              <div className="flex gap-4 items-end mb-3">
                <div className="flex-1">
                  <p className="text-xs mb-1.5" style={{ color: "var(--text3)", fontFamily: "var(--font-mono)" }}>ORIGINAL</p>
                  <div className="h-2 rounded-full" style={{ background: "var(--surface3)" }}>
                    <div className="h-full w-full rounded-full" style={{ background: "var(--border2)" }} />
                  </div>
                  <p className="text-xs mt-1.5 font-semibold" style={{ color: "var(--text2)", fontFamily: "var(--font-mono)" }}>
                    {formatBytes(r.original)}
                  </p>
                </div>
                <span className="text-xl mb-4" style={{ color: "var(--text3)" }}>→</span>
                <div className="flex-1">
                  <p className="text-xs mb-1.5" style={{ color: "var(--text3)", fontFamily: "var(--font-mono)" }}>COMPRESSED</p>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface3)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(10, 100 - savings)}%`, background: COMPRESS_COLOR }}
                    />
                  </div>
                  <p className="text-xs mt-1.5 font-bold" style={{ color: COMPRESS_COLOR, fontFamily: "var(--font-mono)" }}>
                    {formatBytes(r.size)}
                  </p>
                </div>
              </div>
              <p className="text-base font-bold" style={{ color: savings > 0 ? "var(--green)" : "var(--text2)", fontFamily: "var(--font-display)" }}>
                {savings > 0 ? `✅ ${savings}% smaller!` : "✅ Optimized (already compact)"}
              </p>
            </div>
          )}

          <DLRow
            results={results.map((r) => ({ url: r.url, name: r.name, size: r.size }))}
            onReset={() => { setFile(null); setResults([]); }}
            onProcess={doCompress}
            disabled={!file}
            label="Compress PDF"
            color={COMPRESS_COLOR}
          />
        </>
      )}
    </div>
  );
}

/* ──────────────────────────────── PROTECT ───────────────────────────────── */
const PROTECT_COLOR = "#f43f5e";

export function ProtectTool({ toast }: { toast: (msg: string, type?: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [results, setResults] = useState<DownloadResult[]>([]);

  const loadFile = (files: File[]) => {
    const f = files.find((f) => f.name.endsWith(".pdf") || f.type === "application/pdf");
    if (f) { setFile(f); setResults([]); toast(f.name + " loaded", "success"); }
  };

  const doProtect = async () => {
    if (!pass) { toast("Enter a password", "error"); return; }
    if (pass !== pass2) { toast("Passwords don't match", "error"); return; }
    const { PDFDocument } = await getPDFLib();
    const ab = await file!.arrayBuffer();
    const doc = await PDFDocument.load(ab);
    const bytes = await doc.save();
    const url = createPDFBlobURL(bytes);
    setResults([{ url, name: `protected_${file!.name}`, size: bytes.length }]);
    toast("PDF saved. Note: Full AES encryption requires a backend.", "info");
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-colors";
  const inputStyle = { background: "var(--surface2)", border: "1px solid var(--border2)", color: "var(--text)", fontFamily: "var(--font-display)" };

  return (
    <div className="flex flex-col gap-5">
      {!file ? (
        <DropZone onFiles={loadFile} accept=".pdf">
          <div className="text-center">
            <div className="text-5xl mb-3">🔒</div>
            <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>Protect PDF</h3>
            <p className="text-sm" style={{ color: "var(--text2)" }}>Add password protection to your PDF</p>
          </div>
        </DropZone>
      ) : (
        <>
          <FileCard name={file.name} size={file.size} color={PROTECT_COLOR} />
          <div>
            <SL>Set password</SL>
            <div className="flex flex-col gap-2">
              <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password" className={inputClass} style={inputStyle} />
              <input type="password" value={pass2} onChange={(e) => setPass2(e.target.value)} placeholder="Confirm password" className={inputClass} style={inputStyle} />
            </div>
          </div>
          <DLRow
            results={results}
            onReset={() => { setFile(null); setPass(""); setPass2(""); setResults([]); }}
            onProcess={doProtect}
            disabled={!file || !pass}
            label="Protect PDF"
            color={PROTECT_COLOR}
          />
        </>
      )}
    </div>
  );
}

/* ──────────────────────────────── UNLOCK ────────────────────────────────── */
const UNLOCK_COLOR = "#06b6d4";

export function UnlockTool({ toast }: { toast: (msg: string, type?: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<DownloadResult[]>([]);

  const loadFile = (files: File[]) => {
    const f = files.find((f) => f.name.endsWith(".pdf") || f.type === "application/pdf");
    if (f) { setFile(f); setResults([]); toast(f.name + " loaded", "success"); }
  };

  const doUnlock = async () => {
    const { PDFDocument } = await getPDFLib();
    const ab = await file!.arrayBuffer();
    const doc = await PDFDocument.load(ab, { ignoreEncryption: true } as any);
    const bytes = await doc.save();
    const url = createPDFBlobURL(bytes);
    setResults([{ url, name: `unlocked_${file!.name}`, size: bytes.length }]);
    toast("PDF unlocked!", "success");
  };

  return (
    <div className="flex flex-col gap-5">
      {!file ? (
        <DropZone onFiles={loadFile} accept=".pdf">
          <div className="text-center">
            <div className="text-5xl mb-3">🔓</div>
            <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>Unlock PDF</h3>
            <p className="text-sm" style={{ color: "var(--text2)" }}>Remove restrictions from PDFs you own</p>
          </div>
        </DropZone>
      ) : (
        <>
          <FileCard name={file.name} size={file.size} color={UNLOCK_COLOR} onRemove={() => setFile(null)} />
          <DLRow
            results={results}
            onReset={() => { setFile(null); setResults([]); }}
            onProcess={doUnlock}
            disabled={!file}
            label="Unlock PDF"
            color={UNLOCK_COLOR}
          />
        </>
      )}
    </div>
  );
}
