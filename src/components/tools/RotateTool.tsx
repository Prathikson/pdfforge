"use client";

import { useState } from "react";
import { DropZone } from "@/components/ui/DropZone";
import { Btn } from "@/components/ui/Btn";
import { DLRow, Panel, SL, type DownloadResult } from "@/components/ui/index";
import { Icon } from "@/components/ui/Icon";
import {
  loadPDFFile,
  renderAllThumbs,
  getPDFLib,
  createPDFBlobURL,
} from "@/lib/pdf-utils";

const COLOR = "#10b981";

interface Page {
  id: string;
  num: number;
}

type ToastType = "success" | "error" | "info" | "warning";

export function RotateTool({
  toast,
}: {
  toast: (msg: string, type?: ToastType) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rotations, setRotations] = useState<Record<string, number>>({});
  const [results, setResults] = useState<DownloadResult[]>([]);

  const loadFile = async (files: File[]) => {
    const f: File | undefined = files.find(
      (file) =>
        file.name.toLowerCase().endsWith(".pdf") ||
        file.type === "application/pdf"
    );

    if (!f) return;

    toast("Loading PDF…", "info");

    try {
      const { pdf, count } = await loadPDFFile(f);
      const ts: string[] = await renderAllThumbs(pdf, count, 0.3);

      setFile(f);
      setPages(
        Array.from({ length: count }, (_, i): Page => ({
          id: `r${i}`,
          num: i + 1,
        }))
      );
      setThumbs(ts);
      setRotations({});
      setSelected(new Set<string>());
      setResults([]);

      toast(`Loaded ${count} pages`, "success");
    } catch {
      toast("Failed to load PDF", "error");
    }
  };

  const togglePage = (id: string) => {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const rotate = (deg: number) => {
    const targets: string[] =
      selected.size > 0
        ? Array.from(selected)
        : pages.map((p) => p.id);

    setRotations((prev) => {
      const next: Record<string, number> = { ...prev };

      targets.forEach((id) => {
        const current = next[id] ?? 0;
        next[id] = (current + deg + 360) % 360;
      });

      return next;
    });
  };

  const doRotate = async () => {
    if (!file) return;

    const { PDFDocument, degrees } = await getPDFLib();
    const ab = await file.arrayBuffer();
    const doc = await PDFDocument.load(ab);
    const total = doc.getPageCount();

    pages.forEach((p, i) => {
      if (i < total && rotations[p.id] !== undefined) {
        const page = doc.getPage(i);
        const cur = page.getRotation().angle;
        const extra = rotations[p.id] ?? 0;
        page.setRotation(degrees((cur + extra) % 360));
      }
    });

    const bytes = await doc.save();
    const url = createPDFBlobURL(bytes);

    setResults([
      {
        url,
        name: `rotated_${file.name}`,
        size: bytes.length,
      },
    ]);

    toast("Rotation applied!", "success");
  };

  const rotatedCount = Object.keys(rotations).length;

  return (
    <div className="flex flex-col gap-5">
      {!file ? (
        <DropZone onFiles={loadFile} accept=".pdf">
          <div className="text-center">
            <div className="text-5xl mb-3">🔄</div>
            <h3
              className="text-xl font-bold mb-1"
              style={{
                color: "var(--text)",
                fontFamily: "var(--font-display)",
              }}
            >
              Rotate Pages
            </h3>
            <p
              className="text-sm"
              style={{ color: "var(--text2)" }}
            >
              Click pages to select · Live rotation preview
            </p>
          </div>
        </DropZone>
      ) : (
        <>
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <span
                className="text-xs"
                style={{
                  color: "var(--text3)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {selected.size > 0
                  ? `${selected.size} selected:`
                  : "All pages:"}
              </span>

              {[
                { l: "↩ 90° CW", d: 90 },
                { l: "↪ 90° CCW", d: 270 },
                { l: "↔ 180°", d: 180 },
              ].map(({ l, d }) => (
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
              <Btn
                size="sm"
                variant="outline"
                onClick={() =>
                  selected.size > 0
                    ? setSelected(new Set<string>())
                    : setSelected(
                        new Set<string>(pages.map((p) => p.id))
                      )
                }
              >
                {selected.size > 0
                  ? "Deselect"
                  : "Select All"}
              </Btn>

              {rotatedCount > 0 && (
                <Btn
                  size="sm"
                  variant="outline"
                  onClick={() => setRotations({})}
                >
                  Reset
                </Btn>
              )}
            </div>
          </div>

          <DLRow
            results={results}
            onReset={() => {
              setFile(null);
              setPages([]);
              setThumbs([]);
              setRotations({});
              setResults([]);
            }}
            onProcess={doRotate}
            disabled={!file || rotatedCount === 0}
            label="Download Rotated PDF"
            color={COLOR}
          />
        </>
      )}
    </div>
  );
}