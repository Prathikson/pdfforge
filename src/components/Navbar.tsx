"use client";

import { useTheme } from "@/hooks";
import { Icon } from "@/components/ui/Icon";

export function Navbar() {
  const { mode, toggle } = useTheme();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 glass flex items-center justify-between px-6 border-b"
      style={{
        background: mode === "dark" ? "rgba(9,9,14,0.88)" : "rgba(249,249,252,0.9)",
        borderColor: "var(--border)",
        transition: "background 0.3s",
      }}
    >
      {/* Wordmark */}
      <div className="flex items-center gap-2.5">
        <span className="text-lg font-black tracking-tight" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}>
          <span className="gradient-text">PDF</span>
          <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 300, color: "var(--text2)" }}>nope</span>
        </span>
        <span
          className="text-white text-xs font-bold px-2 py-0.5 rounded-md"
          style={{ background: "var(--green)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em", fontSize: 9 }}
        >
          FREE
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <nav className="hidden sm:flex items-center gap-5">
          <a href="#tools" className="text-md font-medium transition-opacity hover:opacity-60" style={{ color: "var(--text2)", fontFamily: "var(--font-display)" }}>
            Tools
          </a>
          <a href="#privacy" className="text-md font-medium transition-opacity hover:opacity-60" style={{ color: "var(--text2)", fontFamily: "var(--font-display)" }}>
            Privacy
          </a>
          <a href="#support" className="text-md font-medium transition-opacity hover:opacity-60" style={{ color: "var(--text2)", fontFamily: "var(--font-display)" }}>
            Support ☕
          </a>
        </nav>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="w-12 h-6 rounded-full relative transition-all duration-300 flex-shrink-0 border"
          style={{
            background: mode === "dark" ? "var(--accent)" : "var(--surface3)",
            borderColor: "var(--border2)",
          }}
        >
          <div
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center transition-all duration-300"
            style={{
              left: mode === "dark" ? "calc(100% - 18px)" : "2px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }}
          >
            <Icon
              name={mode === "dark" ? "moon" : "sun"}
              size={8}
              color={mode === "dark" ? "#6b5ce7" : "#f59e0b"}
            />
          </div>
        </button>
      </div>
    </header>
  );
}
