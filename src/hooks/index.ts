"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ThemeMode } from "@/lib/constants";

/* ── useTheme ── */
export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    try {
      const stored = localStorage.getItem("pdfforge-theme") as ThemeMode | null;
      const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      const resolved = stored ?? preferred;
      setMode(resolved);
      document.documentElement.classList.toggle("dark", resolved === "dark");
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    setMode((m) => {
      const next: ThemeMode = m === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("pdfforge-theme", next);
        document.documentElement.classList.toggle("dark", next === "dark");
      } catch {}
      return next;
    });
  }, []);

  return { mode, toggle, isDark: mode === "dark" };
}

/* ── useToasts ── */
export interface Toast {
  id: number;
  msg: string;
  type: "success" | "error" | "info" | "warning";
}

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback(
    (msg: string, type: Toast["type"] = "success") => {
      const id = Date.now();
      setToasts((p) => [...p, { id, msg, type }]);
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500);
    },
    []
  );

  const remove = useCallback((id: number) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  return { toasts, toast: add, remove };
}

/* ── useCleanupTimer ── */
export function useCleanupTimer(seconds = 300) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    const iv = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(iv);
  }, []);

  const minutes = Math.floor(left / 60);
  const secs = left % 60;
  const expired = left === 0;

  return { left, minutes, secs, expired, formatted: `${minutes}:${secs.toString().padStart(2, "0")}` };
}

/* ── useDragReorder ── */
export function useDragReorder<T>(
  items: T[],
  setItems: (items: T[]) => void
) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const handleDragStart = useCallback((idx: number) => {
    setDragIdx(idx);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, idx: number) => {
      e.preventDefault();
      setOverIdx(idx);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, toIdx: number) => {
      e.preventDefault();
      if (dragIdx === null) return;
      const next = [...items];
      const [item] = next.splice(dragIdx, 1);
      next.splice(toIdx, 0, item);
      setItems(next);
      setDragIdx(null);
      setOverIdx(null);
    },
    [dragIdx, items, setItems]
  );

  const handleDragEnd = useCallback(() => {
    setDragIdx(null);
    setOverIdx(null);
  }, []);

  return { dragIdx, overIdx, handleDragStart, handleDragOver, handleDrop, handleDragEnd };
}

/* ── useKeyboard ── */
export function useKeydown(key: string, handler: () => void, deps: any[] = []) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === key) handler();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ...deps]);
}
