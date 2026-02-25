"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { Features, SupportSection, Footer } from "@/components/Footer";
import { ToastList } from "@/components/ui/index";
import { useToasts } from "@/hooks";

export default function Home() {
  const { toasts, toast, remove } = useToasts();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Loading splash */}
      {!loaded && (
        <div
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-8 transition-opacity duration-500"
          style={{ background: "var(--bg)" }}
        >
          <div
            className="text-5xl font-black tracking-tighter"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.05em" }}
          >
            <span className="gradient-text">PDF</span>
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontWeight: 300,
                color: "var(--text2)",
              }}
            >
              nope
            </span>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  background: "var(--accent)",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
          <p
            className="text-xs tracking-widest"
            style={{ color: "var(--text3)", fontFamily: "var(--font-mono)", letterSpacing: "0.15em" }}
          >
            LOADING ENGINES…
          </p>
        </div>
      )}

      <Navbar />
      <main>
        <Hero />
        <ToolWorkspace toast={toast} />
        <Features />
        <SupportSection toast={toast} />
      </main>
      <Footer />

      <ToastList toasts={toasts} onRemove={remove} />
    </>
  );
}
