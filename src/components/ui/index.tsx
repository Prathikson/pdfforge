"use client";

import { type ReactNode } from "react";
import { Icon } from "./Icon";
import { Btn } from "./Btn";
import { useCleanupTimer } from "@/hooks";
import { formatBytes } from "@/lib/pdf-utils";

/* ── SectionLabel ── */
export function SL({ children }: { children: ReactNode }) {
  return (
    <p
      className="text-xs font-bold uppercase tracking-widest mb-2.5"
      style={{ color: "var(--text3)", fontFamily: "var(--font-mono)" }}
    >
      {children}
    </p>
  );
}

/* ── Panel ── */
export function Panel({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 overflow-x-auto ${className}`}
      style={{ background: "var(--surface2)", border: "1px solid var(--border)", ...style }}
    >
      {children}
    </div>
  );
}

/* ── PDF Page Thumbnail ── */
interface PageThumbProps {
  dataUrl: string | null;
  pageNum: number;
  selected?: boolean;
  onClick?: () => void;
  color: string;
  rotation?: number;
  small?: boolean;
  badge?: ReactNode;
}

export function PageThumb({
  dataUrl,
  pageNum,
  selected,
  onClick,
  color,
  rotation = 0,
  small,
  badge,
}: PageThumbProps) {
  const w = small ? 64 : 80;
  const h = small ? 84 : 104;

  return (
    <div
      className="flex flex-col items-center gap-1.5 flex-shrink-0 select-none"
      style={{ width: w }}
      onClick={onClick}
    >
      <div
        className="relative overflow-hidden transition-all duration-200"
        style={{
          width: w,
          height: h,
          borderRadius: 10,
          border: `2px solid ${selected ? color : "var(--border2)"}`,
          boxShadow: selected
            ? `0 0 0 3px ${color}25, var(--card-shadow)`
            : "var(--card-shadow)",
          cursor: onClick ? "pointer" : "default",
          background: "var(--surface3)",
        }}
      >
        {dataUrl ? (
          <img
            src={dataUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transform: `rotate(${rotation}deg)`,
              transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
              transformOrigin: "center center",
            }}
            alt={`Page ${pageNum}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="w-5 h-5 rounded-full border-2 animate-spin"
              style={{
                borderColor: "var(--border2)",
                borderTopColor: color,
              }}
            />
          </div>
        )}

        {/* Checkmark when selected */}
        {selected && (
          <div
            className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: color, boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}
          >
            <Icon name="check" size={9} color="#fff" />
          </div>
        )}

        {/* Rotation badge */}
        {rotation !== 0 && (
          <div
            className="absolute bottom-1.5 left-1.5 text-white rounded px-1"
            style={{
              fontSize: 7,
              fontWeight: 700,
              background: color,
              fontFamily: "var(--font-mono)",
            }}
          >
            {rotation}°
          </div>
        )}

        {badge && badge}
      </div>

      <span
        className="text-center leading-none"
        style={{
          fontSize: 9,
          fontWeight: selected ? 700 : 500,
          color: selected ? color : "var(--text3)",
          fontFamily: "var(--font-mono)",
        }}
      >
        P{pageNum}
      </span>
    </div>
  );
}

/* ── Toast ── */
export interface ToastItem {
  id: number;
  msg: string;
  type: "success" | "error" | "info" | "warning";
}

const TOAST_ICONS: Record<ToastItem["type"], string> = {
  success: "✓",
  error: "✕",
  info: "i",
  warning: "!",
};

const TOAST_COLORS: Record<ToastItem["type"], string> = {
  success: "var(--green)",
  error: "var(--red)",
  info: "var(--accent)",
  warning: "var(--amber)",
};

export function ToastList({
  toasts,
  onRemove,
}: {
  toasts: ToastItem[];
  onRemove: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl animate-slide-in pointer-events-auto"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border2)",
            boxShadow: "var(--shadow-lg)",
            minWidth: 220,
            maxWidth: 320,
          }}
          onClick={() => onRemove(t.id)}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0 text-xs font-bold"
            style={{ background: TOAST_COLORS[t.type] }}
          >
            {TOAST_ICONS[t.type]}
          </div>
          <p
            className="text-sm font-medium flex-1"
            style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}
          >
            {t.msg}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ── Cleanup Timer ── */
export function CleanupTimer() {
  const { left, formatted, expired } = useCleanupTimer(300);

  return (
    <span
      className="text-xs"
      style={{
        color: left < 60 ? "var(--red)" : "var(--text3)",
        fontFamily: "var(--font-mono)",
      }}
    >
      {expired ? "🗑 cleaned up" : `⏱ ${formatted}`}
    </span>
  );
}

/* ── Download Result ── */
export interface DownloadResult {
  url: string;
  name: string;
  size: number;
}

/* ── DLRow ── */
interface DLRowProps {
  results: DownloadResult[];
  onReset: () => void;
  onProcess: () => Promise<void>;
  disabled?: boolean;
  label: string;
  color: string;
}

export function DLRow({ results, onReset, onProcess, disabled, label, color }: DLRowProps) {
  return (
    <div
      className="flex items-center justify-between flex-wrap gap-3 pt-5"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <button
        onClick={onReset}
        className="text-xs font-medium transition-colors hover:opacity-70"
        style={{ color: "var(--text3)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-display)" }}
      >
        ← reset
      </button>

      <div className="flex items-center gap-2.5 flex-wrap">
        {results.length > 0 && (
          <>
            <div className="flex gap-2 flex-wrap items-center">
              {results.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  download={r.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold no-underline transition-opacity hover:opacity-80"
                  style={{
                    background: "var(--green-dim)",
                    color: "var(--green)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <Icon name="down" size={11} color="var(--green)" />
                  {r.name}
                  <span className="opacity-60">· {formatBytes(r.size)}</span>
                </a>
              ))}
            </div>
            <CleanupTimer />
          </>
        )}

        <Btn onClick={onProcess} disabled={disabled} color={color}>
          <Icon name="down" size={14} color="#fff" />
          {label}
        </Btn>
      </div>
    </div>
  );
}

/* ── FileCard ── */
export function FileCard({
  name,
  size,
  color,
  onRemove,
}: {
  name: string;
  size: number;
  color?: string;
  onRemove?: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div
        className="w-10 h-12 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: `${color ?? "var(--accent)"}15` }}
      >
        📄
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold truncate"
          style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}
        >
          {name}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text3)", fontFamily: "var(--font-mono)" }}>
          {formatBytes(size)}
        </p>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-80"
          style={{ background: "var(--red-dim)", border: "none", cursor: "pointer" }}
        >
          <Icon name="x" size={12} color="var(--red)" />
        </button>
      )}
    </div>
  );
}
