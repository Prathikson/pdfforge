"use client";

export function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pb-20 overflow-hidden"
      style={{ paddingTop: "5rem" }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 bg-grid"
        style={{
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 40%, black 0%, transparent 80%)",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 40%, black 0%, transparent 80%)",
        }}
      />

      {/* Purple glow blob */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 600,
          height: 600,
          background: "radial-gradient(circle, rgba(107,92,231,0.15) 0%, transparent 70%)",
          top: -200,
          left: "50%",
          transform: "translateX(-50%)",
          filter: "blur(60px)",
        }}
      />

      {/* Red accent blob */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 300,
          height: 300,
          background: "radial-gradient(circle, rgba(244,63,94,0.08) 0%, transparent 70%)",
          bottom: 100,
          right: "15%",
          filter: "blur(40px)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full mb-10 border"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border2)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "var(--green)" }}
          />
          <span
            className="text-xs font-bold tracking-widest"
            style={{ color: "var(--text3)", fontFamily: "var(--font-mono)", letterSpacing: "0.14em" }}
          >
            BROWSER-ONLY · ZERO UPLOADS · ALWAYS FREE
          </span>
        </div>

        {/* Headline */}
        <h1
          className="mb-6 leading-[0.88]"
          style={{
            fontSize: "clamp(3.5rem, 10vw, 8.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.05em",
            fontFamily: "var(--font-display)",
          }}
        >
          <span className="gradient-text">Visual</span>{" "}
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontWeight: 300,
              color: "var(--text)",
            }}
          >
            PDF
          </span>
          <br />
          <span style={{ color: "var(--text)" }}>Toolkit</span>
        </h1>

        <p
          className="mb-12 mx-auto"
          style={{
            fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
            color: "var(--text2)",
            maxWidth: 460,
            lineHeight: 1.75,
            fontFamily: "var(--font-display)",
          }}
        >
          12 powerful tools. Real PDF previews. See exactly what you're doing — before you download. Zero server uploads.
        </p>

        {/* CTAs */}
        <div className="flex gap-3 justify-center flex-wrap">
          <a
            href="#tools"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-white font-bold text-sm no-underline transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "var(--accent)",
              boxShadow: "0 4px 20px var(--accent-glow)",
              fontFamily: "var(--font-display)",
            }}
          >
            Open a Tool →
          </a>
          <a
            href="#support"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-sm no-underline border transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "var(--surface)",
              color: "var(--text)",
              borderColor: "var(--border2)",
              boxShadow: "var(--card-shadow)",
              fontFamily: "var(--font-display)",
            }}
          >
            ☕ Support
          </a>
        </div>
      </div>

      {/* Stats strip */}
      <div
        className="absolute bottom-0 left-0 right-0 grid grid-cols-4 border-t"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {[
          { n: "12", s: "", l: "TOTAL TOOLS" },
          { n: "100", s: "%", l: "FREE FOREVER" },
          { n: "0", s: "ms", l: "SERVER UPLOAD" },
          { n: "5", s: "min", l: "AUTO CLEANUP" },
        ].map((st, i) => (
          <div
            key={i}
            className="text-center py-5 px-4"
            style={{ borderRight: i < 3 ? "1px solid var(--border)" : "none" }}
          >
            <div
              className="text-2xl font-black gradient-text mb-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {st.n}
              {st.s}
            </div>
            <div
              className="text-xs"
              style={{ color: "var(--text3)", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}
            >
              {st.l}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
