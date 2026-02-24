"use client";

import { useState, useRef } from "react";
import { TOOLS } from "@/lib/constants";
import { Icon } from "@/components/ui/Icon";
import { MergeTool } from "@/components/tools/MergeTool";
import { SplitTool } from "@/components/tools/SplitTool";
import { RotateTool } from "@/components/tools/RotateTool";
import {
  ImageToPDFTool,
  CompressTool,
  ProtectTool,
  UnlockTool,
} from "@/components/tools/UtilityTools";
import {
  WatermarkTool,
  ReorderTool,
  GrayscaleTool,
  MetaTool,
  PDF2ImgTool,
} from "@/components/tools/AdvancedTools";

interface ToolWorkspaceProps {
  toast: (msg: string, type?: any) => void;
}

export function ToolWorkspace({ toast }: ToolWorkspaceProps) {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const workRef = useRef<HTMLDivElement>(null);

  const openTool = (id: string) => {
    setActiveTool(id);
    setTimeout(() => {
      workRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const activeCfg = TOOLS.find((t) => t.id === activeTool);

  const renderTool = () => {
    const props = { toast };
    switch (activeTool) {
      case "merge": return <MergeTool {...props} />;
      case "split": return <SplitTool {...props} />;
      case "rotate": return <RotateTool {...props} />;
      case "img2pdf": return <ImageToPDFTool {...props} />;
      case "compress": return <CompressTool {...props} />;
      case "protect": return <ProtectTool {...props} />;
      case "unlock": return <UnlockTool {...props} />;
      case "watermark": return <WatermarkTool {...props} />;
      case "reorder": return <ReorderTool {...props} />;
      case "grayscale": return <GrayscaleTool {...props} />;
      case "meta": return <MetaTool {...props} />;
      case "pdf2img": return <PDF2ImgTool {...props} />;
      default: return null;
    }
  };

  return (
    <section
      id="tools"
      className="py-20 px-5"
      style={{ maxWidth: 1100, margin: "0 auto" }}
    >
      {/* Section header */}
      <div className="mb-10">
        <p
          className="text-xs font-bold mb-2.5 tracking-widest"
          style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", letterSpacing: "0.2em" }}
        >
          // 12 TOOLS
        </p>
        <h2
          className="mb-3 leading-tight"
          style={{
            fontSize: "clamp(1.8rem, 4vw, 3rem)",
            fontWeight: 800,
            color: "var(--text)",
            fontFamily: "var(--font-display)",
            letterSpacing: "-0.03em",
          }}
        >
          Every PDF need,{" "}
          <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 300 }}>
            fully visual.
          </span>
        </h2>
        <p className="text-sm" style={{ color: "var(--text3)", fontFamily: "var(--font-display)" }}>
          Click any tool · Real PDF thumbnails · No auto-download
        </p>
      </div>

      {/* Tool grid */}
      <div
        className="grid gap-2.5 mb-10"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}
      >
        {TOOLS.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => openTool(tool.id)}
              className="relative text-left p-4 rounded-2xl border transition-all duration-200 overflow-hidden group"
              style={{
                background: isActive ? `${tool.color}0e` : "var(--surface)",
                border: `1.5px solid ${isActive ? tool.color : "var(--border)"}`,
                cursor: "pointer",
              }}
            >
              {/* Active top bar */}
              {isActive && (
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                  style={{ background: tool.color }}
                />
              )}

              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-2xl"
                style={{ background: `${tool.color}05` }}
              />

              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${tool.color}18` }}
                >
                  <Icon name={tool.icon} size={17} color={tool.color} />
                </div>
                {tool.badge && (
                  <span
                    className="text-white px-1.5 py-0.5 rounded font-bold"
                    style={{
                      fontSize: 7,
                      background: tool.color,
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {tool.badge}
                  </span>
                )}
              </div>

              <p
                className="text-sm font-bold leading-tight"
                style={{
                  color: isActive ? tool.color : "var(--text)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {tool.shortLabel}
              </p>
              <p
                className="text-xs mt-0.5 leading-snug"
                style={{ color: "var(--text3)", fontFamily: "var(--font-display)" }}
              >
                {tool.description}
              </p>

              {isActive && (
                <p
                  className="text-xs mt-1.5 font-bold"
                  style={{ color: tool.color, fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}
                >
                  ↓ OPEN
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Workspace */}
      <div ref={workRef} style={{ scrollMarginTop: 80 }}>
        {!activeTool ? (
          <div
            className="py-20 text-center rounded-3xl border-2 border-dashed"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border2)",
            }}
          >
            <div className="text-5xl mb-4 opacity-50">☝️</div>
            <h3
              className="text-lg font-bold mb-2"
              style={{ color: "var(--text2)", fontFamily: "var(--font-display)" }}
            >
              Select a tool above
            </h3>
            <p className="text-sm" style={{ color: "var(--text3)", fontFamily: "var(--font-mono)" }}>
              Drop files → Visualize → Download when ready
            </p>
          </div>
        ) : (
          <div
            className="rounded-3xl border overflow-hidden"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow)",
            }}
          >
            {/* Tool header */}
            <div
              className="flex items-center gap-4 px-6 py-4 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              {/* Color bar */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${activeCfg!.color}18` }}
              >
                <Icon name={activeCfg!.icon} size={20} color={activeCfg!.color} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className="text-base font-bold"
                    style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}
                  >
                    {activeCfg!.label}
                  </h3>
                  {activeCfg!.badge && (
                    <span
                      className="text-white px-2 py-0.5 rounded font-bold"
                      style={{ fontSize: 9, background: activeCfg!.color, fontFamily: "var(--font-mono)" }}
                    >
                      {activeCfg!.badge}
                    </span>
                  )}
                </div>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text3)", fontFamily: "var(--font-mono)" }}
                >
                  🔒 Files processed locally · Never uploaded · Auto-cleaned in 5 min
                </p>
              </div>

              <button
                onClick={() => setActiveTool(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center border transition-opacity hover:opacity-70 flex-shrink-0"
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                }}
              >
                <Icon name="x" size={14} color="var(--text3)" />
              </button>
            </div>

            {/* Accent border top */}
            <div className="h-px" style={{ background: `linear-gradient(90deg, ${activeCfg!.color}, transparent)` }} />

            {/* Tool body */}
            <div className="p-6">{renderTool()}</div>
          </div>
        )}
      </div>
    </section>
  );
}
