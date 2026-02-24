"use client";

import { useState, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  compact?: boolean;
  children?: ReactNode;
  className?: string;
}

export function DropZone({
  onFiles,
  accept = ".pdf",
  multiple = false,
  compact = false,
  children,
  className = "",
}: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (rawFiles: FileList | null) => {
    if (!rawFiles) return;
    onFiles([...rawFiles]);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); onFiles([...e.dataTransfer.files]); }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      className={[
        "relative cursor-pointer transition-all duration-200 select-none",
        "border-2 border-dashed rounded-2xl",
        "flex flex-col items-center justify-center",
        compact ? "py-3 px-4 flex-row gap-3 rounded-xl" : "py-14 px-8 gap-4",
        dragging
          ? "border-[var(--accent)] bg-[var(--accent-dim)] scale-[1.01]"
          : "border-[var(--border2)] hover:border-[var(--accent)]/50 hover:bg-[var(--surface2)]/50",
        className,
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
      />

      {children ? (
        children
      ) : compact ? (
        <>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--accent-dim)" }}
          >
            <Icon name="plus" size={16} color="var(--accent)" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>
              {dragging ? "Drop files!" : "Add more files"}
            </p>
            <p className="text-xs" style={{ color: "var(--text3)", fontFamily: "var(--font-mono)" }}>
              {accept.replace(/\./g, "").toUpperCase()}
            </p>
          </div>
        </>
      ) : (
        <>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-200"
            style={{
              background: dragging ? "var(--accent-dim)" : "var(--surface2)",
              transform: dragging ? "scale(1.1) rotate(-3deg)" : "scale(1)",
            }}
          >
            <Icon
              name={dragging ? "down" : "upload"}
              size={28}
              color={dragging ? "var(--accent)" : "var(--text3)"}
            />
          </div>
          <div className="text-center">
            <p
              className="text-lg font-bold mb-1"
              style={{ color: dragging ? "var(--accent)" : "var(--text)", fontFamily: "var(--font-display)" }}
            >
              {dragging ? "Drop it here" : "Drop files here"}
            </p>
            <p className="text-sm" style={{ color: "var(--text3)" }}>
              or click to browse ·{" "}
              <span style={{ fontFamily: "var(--font-mono)" }}>
                {accept.replace(/\./g, "").toUpperCase()}
              </span>
            </p>
          </div>
        </>
      )}

      {/* Glow effect when dragging */}
      {dragging && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: "0 0 0 3px var(--accent-glow)" }}
        />
      )}
    </div>
  );
}
