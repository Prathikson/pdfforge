"use client";

import { useState } from "react";
import type { PDFImage } from "pdf-lib";
import { DropZone } from "@/components/ui/DropZone";
import { DLRow, FileCard, Panel, SL, type DownloadResult } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { getPDFLib, createPDFBlobURL, formatBytes } from "@/lib/pdf-utils";
import { useDragReorder } from "@/hooks";

/* ───────────────────────────── IMAGE → PDF ───────────────────────────── */

interface ImageFile {
  id: string;
  file: File;
  url: string;
  name: string;
}

const IMG_COLOR = "#f43f5e";

export function ImageToPDFTool({
  toast,
}: {
  toast: (msg: string, type?: string) => void;
}) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [margin, setMargin] = useState<number>(20);
  const [results, setResults] = useState<DownloadResult[]>([]);

  const {
    dragIdx,
    overIdx,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  } = useDragReorder(images, setImages);

  const addFiles = (files: File[]) => {
    const imgs = files.filter((f) => f.type.startsWith("image/"));

    const newItems: ImageFile[] = imgs.map((f) => ({
      id: `${Date.now()}-${Math.random()}`,
      file: f,
      url: URL.createObjectURL(f),
      name: f.name,
    }));

    setImages((prev) => [...prev, ...newItems]);
    setResults([]);
    toast(`Added ${imgs.length} image${imgs.length !== 1 ? "s" : ""}`, "success");
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const doConvert = async () => {
    if (!images.length) return;

    const { PDFDocument } = await getPDFLib();
    const doc = await PDFDocument.create();

    for (const img of images) {
      const ab = await img.file.arrayBuffer();
      const bytes = new Uint8Array(ab);

      let embedded: PDFImage;

      try {
        embedded =
          img.file.type === "image/png"
            ? await doc.embedPng(bytes)
            : await doc.embedJpg(bytes);
      } catch {
        const canvas = document.createElement("canvas");
        const bmp = await createImageBitmap(img.file);

        canvas.width = bmp.width;
        canvas.height = bmp.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context failed");

        ctx.drawImage(bmp, 0, 0);

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
            else reject(new Error("Image conversion failed"));
          }, "image/jpeg", 0.9);
        });

        const jpgAb = await blob.arrayBuffer();
        embedded = await doc.embedJpg(new Uint8Array(jpgAb));
      }

      const page = doc.addPage([
        embedded.width + margin * 2,
        embedded.height + margin * 2,
      ]);

      page.drawImage(embedded, {
        x: margin,
        y: margin,
        width: embedded.width,
        height: embedded.height,
      });
    }

    const pdfBytes = await doc.save();
    const url = createPDFBlobURL(pdfBytes);

    setResults([{ url, name: "images.pdf", size: pdfBytes.length }]);
    toast(`Converted ${images.length} images → PDF`, "success");
  };

  return (
    <div className="flex flex-col gap-5">
      {images.length === 0 ? (
        <DropZone onFiles={addFiles} accept="image/*" multiple>
          <div className="text-center">
            <div className="text-5xl mb-3">🖼️</div>
            <h3 className="text-xl font-bold">Images → PDF</h3>
            <p className="text-sm">Drag & reorder images</p>
          </div>
        </DropZone>
      ) : (
        <>
          <DropZone onFiles={addFiles} accept="image/*" multiple compact />

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
                >
                  <div className="relative">
                    <img
                      src={img.url}
                      alt=""
                      className="w-20 h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(img.id)}
                      className="absolute -top-2 -right-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              <label className="cursor-pointer">
                <Icon name="plus" size={20} />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const files = e.target.files;
                    if (files) addFiles(Array.from(files));
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </Panel>

          <DLRow
            results={results}
            onReset={() => {
              images.forEach((i) => URL.revokeObjectURL(i.url));
              setImages([]);
              setResults([]);
            }}
            onProcess={doConvert}
            disabled={!images.length}
            label="Convert to PDF"
            color={IMG_COLOR}
          />
        </>
      )}
    </div>
  );
}

/* ───────────────────────────── COMPRESS ───────────────────────────── */

const COMPRESS_COLOR = "#8b5cf6";

export function CompressTool({
  toast,
}: {
  toast: (msg: string, type?: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<
    (DownloadResult & { original?: number; saved?: string })[]
  >([]);

  const loadFile = (files: File[]) => {
    const f = files.find(
      (f) => f.name.endsWith(".pdf") || f.type === "application/pdf"
    );
    if (f) {
      setFile(f);
      setResults([]);
      toast(`${f.name} loaded`, "success");
    }
  };

  const doCompress = async () => {
    if (!file) return;

    const { PDFDocument } = await getPDFLib();
    const ab = await file.arrayBuffer();
    const doc = await PDFDocument.load(ab);

    const bytes = await doc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    const url = createPDFBlobURL(bytes);
    const saved = Math.max(0, (1 - bytes.length / file.size) * 100).toFixed(1);

    setResults([
      {
        url,
        name: `compressed_${file.name}`,
        size: bytes.length,
        original: file.size,
        saved,
      },
    ]);

    toast(`Compressed · ${saved}% saved`, "success");
  };

  const r = results[0];
  const savings = r?.saved ? parseFloat(r.saved) : 0;

  return (
    <div className="flex flex-col gap-5">
      {!file ? (
        <DropZone onFiles={loadFile} accept=".pdf" />
      ) : (
        <>
          <FileCard
            name={file.name}
            size={file.size}
            color={COMPRESS_COLOR}
            onRemove={() => setFile(null)}
          />

          <DLRow
            results={results.map((r) => ({
              url: r.url,
              name: r.name,
              size: r.size,
            }))}
            onReset={() => {
              setFile(null);
              setResults([]);
            }}
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

/* ───────────────────────────── PROTECT ───────────────────────────── */

const PROTECT_COLOR = "#f43f5e";

export function ProtectTool({
  toast,
}: {
  toast: (msg: string, type?: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [results, setResults] = useState<DownloadResult[]>([]);

  const loadFile = (files: File[]) => {
    const f = files.find(
      (f) => f.name.endsWith(".pdf") || f.type === "application/pdf"
    );
    if (f) {
      setFile(f);
      setResults([]);
      toast(`${f.name} loaded`, "success");
    }
  };

  const doProtect = async () => {
    if (!file) return;
    if (!pass) return toast("Enter password", "error");
    if (pass !== pass2) return toast("Passwords don't match", "error");

    const { PDFDocument } = await getPDFLib();
    const ab = await file.arrayBuffer();
    const doc = await PDFDocument.load(ab);

    const bytes = await doc.save();
    const url = createPDFBlobURL(bytes);

    setResults([
      { url, name: `protected_${file.name}`, size: bytes.length },
    ]);

    toast("PDF saved (client-side demo only)", "info");
  };

  return (
    <div className="flex flex-col gap-5">
      {!file ? (
        <DropZone onFiles={loadFile} accept=".pdf" />
      ) : (
        <>
          <FileCard name={file.name} size={file.size} color={PROTECT_COLOR} />

          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Password"
          />
          <input
            type="password"
            value={pass2}
            onChange={(e) => setPass2(e.target.value)}
            placeholder="Confirm password"
          />

          <DLRow
            results={results}
            onReset={() => {
              setFile(null);
              setPass("");
              setPass2("");
              setResults([]);
            }}
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

/* ───────────────────────────── UNLOCK ───────────────────────────── */

const UNLOCK_COLOR = "#06b6d4";

export function UnlockTool({
  toast,
}: {
  toast: (msg: string, type?: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<DownloadResult[]>([]);

  const loadFile = (files: File[]) => {
    const f = files.find(
      (f) => f.name.endsWith(".pdf") || f.type === "application/pdf"
    );
    if (f) {
      setFile(f);
      setResults([]);
      toast(`${f.name} loaded`, "success");
    }
  };

  const doUnlock = async () => {
    if (!file) return;

    const { PDFDocument } = await getPDFLib();
    const ab = await file.arrayBuffer();

    const doc = await PDFDocument.load(ab, {
      ignoreEncryption: true,
    });

    const bytes = await doc.save();
    const url = createPDFBlobURL(bytes);

    setResults([
      { url, name: `unlocked_${file.name}`, size: bytes.length },
    ]);

    toast("PDF unlocked!", "success");
  };

  return (
    <div className="flex flex-col gap-5">
      {!file ? (
        <DropZone onFiles={loadFile} accept=".pdf" />
      ) : (
        <>
          <FileCard
            name={file.name}
            size={file.size}
            color={UNLOCK_COLOR}
            onRemove={() => setFile(null)}
          />

          <DLRow
            results={results}
            onReset={() => {
              setFile(null);
              setResults([]);
            }}
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