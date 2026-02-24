"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

export function Features() {
  const items = [
    {
      icon: "eye",
      title: "Real PDF Preview",
      desc: "Actual PDF pages rendered via PDF.js — not placeholder graphics. See exactly what you're editing.",
      color: "#7c6eff",
    },
    {
      icon: "shield",
      title: "100% Private",
      desc: "Files never touch a server. All processing happens in your browser using Web APIs.",
      color: "#10b981",
    },
    {
      icon: "zap",
      title: "No Auto-Download",
      desc: "Generate first, preview the output, download only when you're satisfied with the result.",
      color: "#f59e0b",
    },
  ];

  return (
    <section
      id="privacy"
      className="py-10 px-5"
      style={{ maxWidth: 1100, margin: "0 auto" }}
    >
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}
      >
        {items.map((f) => (
          <div
            key={f.title}
            className="p-5 rounded-2xl border"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: `${f.color}18` }}
            >
              <Icon name={f.icon} size={17} color={f.color} />
            </div>
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}
            >
              {f.title}
            </h3>
            <p
              className="text-md leading-relaxed"
              style={{ color: "var(--text3)", fontFamily: "var(--font-display)", lineHeight: 1.65 }}
            >
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SupportSection({ toast }: { toast: (msg: string, type?: any) => void }) {
  return (
    <section id="support" className="py-10 px-5 pb-20" style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div
        className="relative rounded-3xl border p-12 text-center overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(244,63,94,0.05) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10">
          <div className="text-5xl mb-5">💜</div>
          <h2
            className="mb-4 leading-tight"
            style={{
              fontSize: "clamp(1.8rem, 3vw, 2.2rem)",
              fontWeight: 800,
              color: "var(--text)",
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.03em",
            }}
          >
            PDFforge is free.{" "}
            <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 300 }}>
              Keep it that way.
            </span>
          </h2>
          <p
            className="mb-8 mx-auto"
            style={{
              fontSize: "0.9rem",
              color: "var(--text2)",
              maxWidth: 400,
              lineHeight: 1.75,
              fontFamily: "var(--font-display)",
            }}
          >
            Built because PDF tools shouldn't be paywalled. If this saved you time, a coffee helps keep it alive.
          </p>

          <div className="flex gap-2.5 justify-center flex-wrap mb-6">
            {[
              { l: "☕ $1", a: 1 },
              { l: "🍕 $3", a: 3 },
              { l: "🍺 $5", a: 5 },
              { l: "🚀 $10", a: 10 },
            ].map((d) => (
              <button
                key={d.a}
                onClick={() => {
                  toast(`Thank you for your $${d.a} support! 🙏`, "success");
                  window.open("https://buymeacoffee.com", "_blank");
                }}
                className="px-5 py-2.5 rounded-xl border text-md font-bold transition-all duration-150 hover:-translate-y-0.5"
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border2)",
                  color: "var(--text)",
                  cursor: "pointer",
                  fontFamily: "var(--font-display)",
                }}
              >
                {d.l}
              </button>
            ))}
          </div>

          <a
            href="https://buymeacoffee.com"
            target="_blank"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-white text-md font-bold no-underline transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #f43f5e, #c0392b)",
              boxShadow: "0 4px 20px rgba(244,63,94,0.35)",
              fontFamily: "var(--font-display)",
            }}
          >
            <Icon name="coffee" size={16} color="#fff" />
            Buy Me a Coffee
          </a>

          <p
            className="mt-5 text-sm"
            style={{ color: "var(--text3)", fontFamily: "var(--font-mono)" }}
          >
            100% goes to dev & hosting · No BS · Thank you 🙏
          </p>
        </div>
      </div>
    </section>
  );
}

function FooterLogo() {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <p className="text-lg font-black mb-1.5 tracking-tight" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}>
        <span className="gradient-text">PDF</span>
        <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 300, color: "var(--text2)" }}>forge</span>
      </p>
    );
  }
  return (
    <div className="flex justify-center mb-1.5">
      <Image src="/logo.png" alt="PDFforge" width={96} height={28} onError={() => setErr(true)} style={{ objectFit: "contain", height: 28, width: "auto", opacity: 0.85 }} />
    </div>
  );
}

export function Footer() {
  return (
    <footer
      className="py-8 px-6 text-center border-t"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <FooterLogo />
      <p className="text-xs mb-1.5" style={{ color: "var(--text3)", fontFamily: "var(--font-display)" }}>
        Free forever · No login · 12 visual tools · Files stay in your browser
      </p>
      <p className="text-xs" style={{ color: "var(--text3)", fontFamily: "var(--font-mono)" }}>
        Auto-cleanup after 5 minutes · Zero data collection · Built with ❤️
      </p>
    </footer>
  );
}