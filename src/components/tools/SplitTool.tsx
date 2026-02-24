"use client";

import { useState } from "react";
import { DropZone } from "@/components/ui/DropZone";
import { Btn } from "@/components/ui/Btn";
import type { PDFPage } from "pdf-lib";
import {
  DLRow,
  PageThumb,
  Panel,
  SL,
  type DownloadResult,
} from "@/components/ui/index";
import { Icon } from "@/components/ui/Icon";
import {
  loadPDFFile,
  renderAllThumbs,
  getPDFLib,
  createPDFBlobURL,
} from "@/lib/pdf-utils";
import { TOOL_PALETTE } from "@/lib/constants";

const COLOR = "#f59e0b";

type Mode = "select" | "range" | "every";

interface Page {
  id: string;
  num: number;
}

interface Group {
  id: string;
  pages: Page[];
  label: string;
}

type ToastType = "success" | "error" | "info" | "warning";

export function SplitTool({
  toast,
}: {
  toast: (msg: string, type?: ToastType) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set<string>());
  const [groups, setGroups] = useState<Group[]>([]);
  const [mode, setMode] = useState<Mode>("select");
  const [rangeStr, setRangeStr] = useState<string>("");
  const [everyN, setEveryN] = useState<number>(2);
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
          id: `p${i}`,
          num: i + 1,
        }))
      );
      setThumbs(ts);
      setSelected(new Set<string>());
      setGroups([]);
      setResults([]);

      toast(`Loaded ${count} pages`, "success");
    } catch {
      toast("Failed to load PDF", "error");
    }
  };

  const togglePage = (id: string) => {
    setSelected((prev) => {
      const s = new Set<string>(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const addGroup = () => {
    if (selected.size === 0) return;

    const gp: Page[] = pages.filter((p) => selected.has(p.id));

    setGroups((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        pages: gp,
        label: `Part ${prev.length + 1}`,
      },
    ]);

    setSelected(new Set<string>());
  };

  const applyRange = () => {
    const parts = rangeStr.split(",");

    const ng: Group[] = parts
      .map((part, i): Group | null => {
        const p = part.trim();
        if (!p) return null;

        let gp: Page[] = [];

        if (p.includes("-")) {
          const [aStr, bStr] = p.split("-");
          const a = Number(aStr) - 1;
          const b = Number(bStr) - 1;

          if (!isNaN(a) && !isNaN(b)) {
            gp = pages.slice(
              Math.max(0, a),
              Math.min(pages.length, b + 1)
            );
          }
        } else {
          const n = Number(p) - 1;
          if (!isNaN(n) && n >= 0 && n < pages.length) {
            gp = [pages[n]];
          }
        }

        if (gp.length === 0) return null;

        return {
          id: `${Date.now()}-${i}`,
          pages: gp,
          label: `Part ${i + 1}`,
        };
      })
      .filter((g): g is Group => g !== null);

    setGroups(ng);
    toast(`Created ${ng.length} groups`, "success");
  };

  const applyEvery = () => {
    if (everyN <= 0) return;

    const ng: Group[] = [];

    for (let i = 0; i < pages.length; i += everyN) {
      ng.push({
        id: `${Date.now()}-${i}`,
        pages: pages.slice(i, i + everyN),
        label: `Part ${ng.length + 1}`,
      });
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

    let groupIdxs: number[][] = [];

    if (groups.length > 0) {
      groupIdxs = groups.map((g) =>
        g.pages
          .map((p) => p.num - 1)
          .filter((i) => i >= 0 && i < total)
      );
    } else if (selected.size > 0) {
      const idxs = Array.from(selected)
        .map((id) =>
          pages.findIndex((p) => p.id === id)
        )
        .filter((i) => i >= 0 && i < total);

      groupIdxs = [idxs];
    } else {
      groupIdxs = [
        Array.from({ length: total }, (_, i) => i),
      ];
    }

    const urls: DownloadResult[] = [];

    for (let gi = 0; gi < groupIdxs.length; gi++) {
      const idxs = groupIdxs[gi];
      if (idxs.length === 0) continue;

      const nd = await PDFDocument.create();
      const cp = await nd.copyPages(src, idxs);

cp.forEach((page: PDFPage) => nd.addPage(page));
      const bytes = await nd.save();
      const url = createPDFBlobURL(bytes);

      urls.push({
        url,
        name: `split_part${gi + 1}.pdf`,
        size: bytes.length,
      });
    }

    setResults(urls);
    toast(
      `Created ${urls.length} PDF file${urls.length !== 1 ? "s" : ""}`,
      "success"
    );
  };

  const groupColors: Record<string, string> = {};

  groups.forEach((g, gi) => {
    const c =
      TOOL_PALETTE[gi % TOOL_PALETTE.length] ?? COLOR;
    g.pages.forEach((p) => {
      groupColors[p.id] = c;
    });
  });

  const ModeBtn = ({
    id,
    label,
  }: {
    id: Mode;
    label: string;
  }) => (
    <button
      onClick={() => setMode(id)}
      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border"
      style={{
        borderColor: mode === id ? COLOR : "var(--border2)",
        background:
          mode === id ? `${COLOR}15` : "transparent",
        color:
          mode === id ? COLOR : "var(--text2)",
        fontFamily: "var(--font-display)",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* UI unchanged below */}
      <DropZone onFiles={loadFile} accept=".pdf">
        <div className="text-center">
          <div className="text-5xl mb-3">✂️</div>
          <h3 className="text-xl font-bold mb-1">
            Split PDF
          </h3>
        </div>
      </DropZone>

      <DLRow
        results={results}
        onReset={() => {
          setFile(null);
          setPages([]);
          setThumbs([]);
          setGroups([]);
          setSelected(new Set<string>());
          setResults([]);
        }}
        onProcess={doSplit}
        disabled={!file}
        label="Split & Download"
        color={COLOR}
      />
    </div>
  );
}