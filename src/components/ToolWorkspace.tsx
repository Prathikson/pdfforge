"use client";

import { useState, useRef, useEffect } from "react";
import { TOOLS } from "@/lib/constants";
import { Icon } from "@/components/ui/Icon";
import { MergeTool } from "@/components/tools/MergeTool";
import { SplitTool } from "@/components/tools/SplitTool";
import { RotateTool } from "@/components/tools/RotateTool";
import {
  ImageToPDFTool, CompressTool, ProtectTool, UnlockTool,
} from "@/components/tools/UtilityTools";
import {
  WatermarkTool, ReorderTool, GrayscaleTool, MetaTool, PDF2ImgTool,
} from "@/components/tools/AdvancedTools";

interface ToolWorkspaceProps { toast: (msg: string, type?: any) => void; }

const TOOL_GROUPS = [
  { label: "ORGANIZE",  tools: ["merge", "split", "reorder"] },
  { label: "TRANSFORM", tools: ["rotate", "compress", "grayscale"] },
  { label: "CONVERT",   tools: ["img2pdf", "pdf2img"] },
  { label: "SECURE",    tools: ["protect", "unlock", "watermark"] },
  { label: "EDIT",      tools: ["meta"] },
];

export function ToolWorkspace({ toast }: ToolWorkspaceProps) {
  const [activeTool, setActiveTool]   = useState<string | null>(null);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const [animating, setAnimating]     = useState(false);
  const [isMobile, setIsMobile]       = useState(false);
  const workRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
      if (e.matches) setSidebarOpen(false);
    };
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const activeCfg  = TOOLS.find((t) => t.id === activeTool);
  const hoveredCfg = TOOLS.find((t) => t.id === (hoveredTool ?? activeTool));
  const glowColor  = hoveredCfg?.color ?? "#6b5ce7";

  const openTool = (id: string) => {
    if (id === activeTool) { if (isMobile) setMobileDrawer(false); return; }
    setAnimating(true);
    setTimeout(() => { setActiveTool(id); setAnimating(false); }, 150);
    if (isMobile) setMobileDrawer(false);
    setTimeout(() => workRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
  };

  const renderTool = () => {
    const p = { toast };
    switch (activeTool) {
      case "merge":     return <MergeTool {...p} />;
      case "split":     return <SplitTool {...p} />;
      case "rotate":    return <RotateTool {...p} />;
      case "img2pdf":   return <ImageToPDFTool {...p} />;
      case "compress":  return <CompressTool {...p} />;
      case "protect":   return <ProtectTool {...p} />;
      case "unlock":    return <UnlockTool {...p} />;
      case "watermark": return <WatermarkTool {...p} />;
      case "reorder":   return <ReorderTool {...p} />;
      case "grayscale": return <GrayscaleTool {...p} />;
      case "meta":      return <MetaTool {...p} />;
      case "pdf2img":   return <PDF2ImgTool {...p} />;
      default:          return null;
    }
  };

  /* ── Sidebar content (shared between desktop + mobile drawer) ── */
  const SidebarContent = ({ compact }: { compact?: boolean }) => (
    <>
      {TOOL_GROUPS.map((group) => (
        <div key={group.label}>
          {!compact && (
            <p style={{
              fontSize: 9, fontWeight: 800, color: "var(--text3)",
              fontFamily: "var(--font-mono)", letterSpacing: "0.2em",
              padding: "8px 12px 4px", textTransform: "uppercase",
            }}>{group.label}</p>
          )}
          {group.tools.map((tid) => {
            const tool = TOOLS.find((t) => t.id === tid)!;
            const isActive = activeTool === tid;
            return (
              <button
                key={tid}
                onClick={() => openTool(tid)}
                onMouseEnter={() => setHoveredTool(tid)}
                onMouseLeave={() => setHoveredTool(null)}
                title={compact ? tool.label : undefined}
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  gap: compact ? 0 : 12,
                  justifyContent: compact ? "center" : "flex-start",
                  padding: compact ? "10px 0" : "10px 12px",
                  borderRadius: 12, border: "none",
                  background: isActive ? `${tool.color}18` : "transparent",
                  cursor: "pointer",
                  transition: "background 0.15s",
                  position: "relative", overflow: "hidden",
                }}
              >
                {isActive && (
                  <div style={{
                    position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                    width: 3, height: "60%", borderRadius: "0 3px 3px 0", background: tool.color,
                  }} />
                )}
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: isActive ? `${tool.color}28` : `${tool.color}14`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                  transform: isActive ? "scale(1.08)" : "scale(1)",
                  boxShadow: isActive ? `0 4px 12px ${tool.color}30` : "none",
                }}>
                  <Icon name={tool.icon} size={16} color={isActive ? tool.color : "var(--text3)"} />
                </div>
                {!compact && (
                  <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                    <p style={{
                      fontSize: 13, fontWeight: isActive ? 700 : 500,
                      color: isActive ? tool.color : "var(--text)",
                      fontFamily: "var(--font-display)",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{tool.shortLabel}</p>
                    {isActive && (
                      <p style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono)", marginTop: 1 }}>
                        {tool.description}
                      </p>
                    )}
                  </div>
                )}
                {!compact && tool.badge && (
                  <span style={{
                    fontSize: 7, fontWeight: 800, color: "#fff", background: tool.color,
                    padding: "2px 6px", borderRadius: 4, fontFamily: "var(--font-mono)", flexShrink: 0,
                  }}>{tool.badge}</span>
                )}
              </button>
            );
          })}
          <div style={{ height: 1, background: "var(--border)", margin: "6px 8px" }} />
        </div>
      ))}
    </>
  );

  return (
    <>
      <style>{`
        #tools-section {
          width: 100%;
          padding: clamp(2.5rem,5vw,5rem) clamp(1rem,3vw,2.5rem);
          position: relative; overflow: hidden;
        }
        .tools-layout {
          display: grid;
          grid-template-columns: ${sidebarOpen ? "clamp(230px,20vw,300px)" : "56px"} 1fr;
          gap: clamp(0.75rem,1.5vw,1.5rem);
          align-items: start;
          transition: grid-template-columns 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .sidebar-col {
          position: sticky; top: 72px;
          display: flex; flex-direction: column; gap: 3;
          background: var(--surface); border-radius: 20px;
          border: 1px solid var(--border);
          padding: ${sidebarOpen ? "clamp(0.875rem,1.5vw,1.125rem)" : "0.5rem"};
          overflow: hidden; transition: padding 0.35s ease;
          box-shadow: var(--card-shadow);
          max-height: calc(100vh - 100px);
          overflow-y: auto;
          scrollbar-width: none;
        }
        .sidebar-col::-webkit-scrollbar { display: none; }
        .sb-btn { transition: background 0.15s !important; }
        .sb-btn:hover { background: var(--surface2) !important; }
        .close-btn:hover { background: var(--red-dim) !important; border-color: var(--red) !important; }
        .tool-card-grid { transition: all 0.22s ease; }
        .tool-card-grid:hover { transform: translateY(-3px); }

        /* ── Mobile bottom drawer ── */
        .mobile-fab {
          display: none;
          position: fixed; bottom: 24px; right: 24px; z-index: 100;
          width: 56px; height: 56px; border-radius: 16px;
          background: var(--accent); color: #fff;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          border: none; cursor: pointer;
          align-items: center; justify-content: center;
          font-size: 22px;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .mobile-fab:hover { transform: scale(1.06); }
        .mobile-overlay {
          display: none;
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
        }
        .mobile-drawer {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 201;
          background: var(--surface);
          border-radius: 24px 24px 0 0;
          border-top: 1px solid var(--border);
          padding: 0 16px 32px;
          max-height: 75vh; overflow-y: auto;
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          scrollbar-width: none;
        }
        .mobile-drawer::-webkit-scrollbar { display: none; }
        .mobile-drawer.open { transform: translateY(0); }

        @media (max-width: 900px) {
          .tools-layout {
            grid-template-columns: 1fr !important;
          }
          .sidebar-col {
            display: none !important;
          }
          .mobile-fab { display: flex !important; }
          .mobile-overlay.open { display: block; }
          .mobile-drawer { display: block; }
          .tool-pills-desktop { display: none !important; }
        }
        @media (min-width: 901px) and (max-width: 1200px) {
          .tool-pills-desktop { display: none !important; }
        }
      `}</style>

      <section id="tools">
        {/* Ambient glow */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
          background:`radial-gradient(ellipse 70% 60% at 72% 40%, ${glowColor}0a 0%, transparent 70%)`,
          transition:"background 1s ease",
        }} />

        <div style={{ maxWidth:1800, margin:"0 auto", position:"relative", zIndex:1 }}>

          {/* ── Section header ── */}
          <div style={{
            display:"flex", alignItems:"flex-end", justifyContent:"space-between",
            flexWrap:"wrap", gap:"1rem", marginBottom:"clamp(1.5rem,3vw,2.5rem)",
          }}>
            <div>
              <p style={{ fontSize:"clamp(0.6rem,0.8vw,0.7rem)", fontWeight:800, color:"var(--accent)", fontFamily:"var(--font-mono)", letterSpacing:"0.22em", textTransform:"uppercase", marginBottom:"0.5rem" }}>
                // PDF TOOLS SUITE
              </p>
              <h2 style={{ fontSize:"clamp(2rem,5vw,4rem)", fontWeight:800, color:"var(--text)", fontFamily:"var(--font-display)", letterSpacing:"-0.04em", lineHeight:0.95 }}>
                Every PDF need,{" "}
                <span style={{ fontFamily:"var(--font-serif)", fontStyle:"italic", fontWeight:300, color:"var(--text2)" }}>solved.</span>
              </h2>
            </div>
            <p style={{ fontSize:"clamp(0.7rem,1vw,0.85rem)", color:"var(--text3)", fontFamily:"var(--font-mono)", textAlign:"right", lineHeight:1.7 }}>
              12 tools · Real PDF previews<br/>100% private · Zero server uploads
            </p>
          </div>

          {/* ── Layout ── */}
          <div className="tools-layout">

            {/* ══ DESKTOP SIDEBAR ══ */}
            <div className="sidebar-col">
              {/* Header row */}
              <div style={{
                display:"flex", alignItems:"center",
                justifyContent: sidebarOpen ? "space-between" : "center",
                padding: sidebarOpen ? "2px 4px 12px" : "2px 0 12px",
                borderBottom:"1px solid var(--border)", marginBottom:4,
              }}>
                {sidebarOpen && (
                  <span style={{ fontSize:10, fontWeight:800, color:"var(--text3)", fontFamily:"var(--font-mono)", letterSpacing:"0.2em" }}>
                    TOOLS
                  </span>
                )}
                <button onClick={() => setSidebarOpen(p => !p)} style={{
                  width:30, height:30, borderRadius:8, background:"var(--surface2)",
                  border:"1px solid var(--border)", cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"background 0.15s",
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2.5" strokeLinecap="round">
                    <path d={sidebarOpen ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
                  </svg>
                </button>
              </div>
              <SidebarContent compact={!sidebarOpen} />
            </div>

            {/* ══ WORKSPACE ══ */}
            <div ref={workRef} style={{ scrollMarginTop:80, minWidth:0 }}>
              {!activeTool ? (
                <EmptyState onPick={openTool} />
              ) : (
                <div style={{
                  borderRadius:24, border:`1px solid ${activeCfg!.color}35`,
                  background:"var(--surface)",
                  boxShadow:`0 0 0 1px ${activeCfg!.color}12, var(--shadow-lg)`,
                  overflow:"hidden", transition:"box-shadow 0.4s ease, border-color 0.4s ease",
                }}>
                  {/* Tool header */}
                  <div style={{
                    display:"flex", alignItems:"center",
                    gap:"clamp(0.75rem,2vw,1.5rem)",
                    padding:"clamp(1.25rem,2.5vw,2rem) clamp(1.5rem,3vw,2.75rem)",
                    background:`linear-gradient(135deg, ${activeCfg!.color}07 0%, transparent 55%)`,
                    borderBottom:`1px solid ${activeCfg!.color}20`,
                  }}>
                    <div style={{
                      width:"clamp(3.25rem,5vw,4.75rem)", height:"clamp(3.25rem,5vw,4.75rem)",
                      borderRadius:18, background:`${activeCfg!.color}18`,
                      border:`1.5px solid ${activeCfg!.color}35`,
                      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                      boxShadow:`0 6px 20px ${activeCfg!.color}28`,
                    }}>
                      <Icon name={activeCfg!.icon} size={30} color={activeCfg!.color} />
                    </div>

                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                        <h3 style={{ fontSize:"clamp(1.1rem,2.5vw,1.85rem)", fontWeight:800, color:"var(--text)", fontFamily:"var(--font-display)", letterSpacing:"-0.02em" }}>
                          {activeCfg!.label}
                        </h3>
                        {activeCfg!.badge && (
                          <span style={{ fontSize:9, fontWeight:800, color:"#fff", background:activeCfg!.color, padding:"3px 9px", borderRadius:6, fontFamily:"var(--font-mono)", letterSpacing:"0.06em" }}>
                            {activeCfg!.badge}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize:"clamp(0.65rem,1vw,0.8rem)", color:"var(--text3)", fontFamily:"var(--font-mono)", marginTop:5 }}>
                        🔒 Processed entirely in your browser · Never uploaded · Auto-cleaned in 5 min
                      </p>
                    </div>

                    {/* Quick-switch pills — desktop only */}
                    <div className="tool-pills-desktop" style={{ display:"flex", gap:4, flexWrap:"wrap", justifyContent:"flex-end", maxWidth:"36%" }}>
                      {TOOLS.map(t => (
                        <button key={t.id} onClick={() => openTool(t.id)} title={t.label}
                          style={{ padding:"4px 9px", fontSize:10, fontWeight:700, fontFamily:"var(--font-display)", borderRadius:8, background: activeTool===t.id ? `${t.color}22` : "var(--surface2)", color: activeTool===t.id ? t.color : "var(--text3)", border:`1px solid ${activeTool===t.id ? t.color+"60" : "var(--border)"}`, cursor:"pointer", transition:"all 0.12s", whiteSpace:"nowrap" }}>
                          {t.shortLabel}
                        </button>
                      ))}
                    </div>

                    <button className="close-btn" onClick={() => setActiveTool(null)}
                      style={{ width:38, height:38, borderRadius:12, flexShrink:0, background:"var(--surface2)", border:"1px solid var(--border2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
                      <Icon name="x" size={16} color="var(--text3)" />
                    </button>
                  </div>

                  {/* Accent bar */}
                  <div style={{ height:3, background:`linear-gradient(90deg, ${activeCfg!.color}, ${activeCfg!.color}70, ${activeCfg!.color}20, transparent)` }} />

                  {/* Tool body */}
                  <div style={{
                    padding:"clamp(1.5rem,3.5vw,3.5rem)",
                    minHeight:"clamp(480px,65vh,960px)",
                    opacity: animating ? 0 : 1,
                    transform: animating ? "translateY(8px)" : "translateY(0)",
                    transition:"opacity 0.15s ease, transform 0.15s ease",
                  }}>
                    {renderTool()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ MOBILE FAB ══ */}
      <button className="mobile-fab" onClick={() => setMobileDrawer(true)}
        style={{ background: activeCfg?.color ?? "var(--accent)" }}>
        {activeTool ? <Icon name={activeCfg!.icon} size={22} color="#fff" /> : "☰"}
      </button>

      {/* ══ MOBILE OVERLAY ══ */}
      <div className={`mobile-overlay ${mobileDrawer ? "open" : ""}`} onClick={() => setMobileDrawer(false)} />

      {/* ══ MOBILE BOTTOM DRAWER ══ */}
      <div className={`mobile-drawer ${mobileDrawer ? "open" : ""}`}>
        {/* Drag handle */}
        <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 8px" }}>
          <div style={{ width:36, height:4, borderRadius:2, background:"var(--border2)" }} />
        </div>

        {/* Active tool indicator */}
        {activeTool && activeCfg && (
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 4px 14px", borderBottom:"1px solid var(--border)", marginBottom:4 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:`${activeCfg.color}20`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Icon name={activeCfg.icon} size={15} color={activeCfg.color} />
            </div>
            <span style={{ fontSize:13, fontWeight:700, color:activeCfg.color, fontFamily:"var(--font-display)" }}>
              {activeCfg.label} — active
            </span>
          </div>
        )}

        <p style={{ fontSize:9, fontWeight:800, color:"var(--text3)", fontFamily:"var(--font-mono)", letterSpacing:"0.2em", padding:"8px 4px 4px" }}>SELECT A TOOL</p>

        {/* All tools as large tap targets */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, paddingBottom:8 }}>
          {TOOLS.map(tool => {
            const isActive = activeTool === tool.id;
            return (
              <button key={tool.id} onClick={() => openTool(tool.id)}
                style={{
                  display:"flex", alignItems:"center", gap:10, padding:"12px 14px",
                  borderRadius:14, border:`1.5px solid ${isActive ? tool.color : "var(--border)"}`,
                  background: isActive ? `${tool.color}14` : "var(--surface2)",
                  cursor:"pointer", textAlign:"left", transition:"all 0.15s",
                }}>
                <div style={{ width:34, height:34, borderRadius:9, background:`${tool.color}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon name={tool.icon} size={15} color={tool.color} />
                </div>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontSize:12, fontWeight:700, color: isActive ? tool.color : "var(--text)", fontFamily:"var(--font-display)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {tool.shortLabel}
                  </p>
                  {tool.badge && (
                    <span style={{ fontSize:7, fontWeight:800, color:"#fff", background:tool.color, padding:"1px 5px", borderRadius:3, fontFamily:"var(--font-mono)" }}>{tool.badge}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ── Empty state ── */
function EmptyState({ onPick }: { onPick: (id: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <div style={{ borderRadius:24, border:"1px solid var(--border)", background:"var(--surface)", overflow:"hidden" }}>
      <div style={{ padding:"clamp(2.5rem,6vw,5rem) clamp(1.5rem,4vw,3rem) clamp(2rem,4vw,3rem)", textAlign:"center", borderBottom:"1px solid var(--border)", background:"var(--surface2)" }}>
        <div style={{ fontSize:"clamp(2.5rem,5vw,4.5rem)", marginBottom:18, lineHeight:1 }}>✦</div>
        <h3 style={{ fontSize:"clamp(1.3rem,2.5vw,2.25rem)", fontWeight:800, color:"var(--text)", fontFamily:"var(--font-display)", letterSpacing:"-0.03em", marginBottom:10 }}>
          Pick a tool to get started
        </h3>
        <p style={{ fontSize:"clamp(0.75rem,1.2vw,0.9rem)", color:"var(--text3)", fontFamily:"var(--font-mono)" }}>
          Drop files → Live preview → Download when ready
        </p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(clamp(140px,15vw,220px), 1fr))", gap:"clamp(0.5rem,1vw,0.875rem)", padding:"clamp(1.25rem,2.5vw,2rem)" }}>
        {TOOLS.map(tool => (
          <button key={tool.id} className="tool-card-grid"
            onClick={() => onPick(tool.id)}
            onMouseEnter={() => setHovered(tool.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              textAlign:"left", padding:"clamp(1rem,1.8vw,1.5rem)", borderRadius:18,
              border:`1.5px solid ${hovered===tool.id ? tool.color+"55" : "var(--border)"}`,
              background: hovered===tool.id ? `${tool.color}09` : "var(--surface2)",
              cursor:"pointer",
              boxShadow: hovered===tool.id ? `0 10px 32px ${tool.color}22` : "none",
              transition:"all 0.22s ease",
            }}>
            <div style={{
              width:"clamp(2.5rem,4vw,3.25rem)", height:"clamp(2.5rem,4vw,3.25rem)",
              borderRadius:13, background:`${tool.color}18`,
              display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"0.875rem",
              transition:"transform 0.2s",
              transform: hovered===tool.id ? "scale(1.15) rotate(-4deg)" : "scale(1)",
            }}>
              <Icon name={tool.icon} size={20} color={tool.color} />
            </div>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:6 }}>
              <p style={{ fontSize:"clamp(0.8rem,1.1vw,1rem)", fontWeight:700, color: hovered===tool.id ? tool.color : "var(--text)", fontFamily:"var(--font-display)", lineHeight:1.2, transition:"color 0.15s" }}>
                {tool.shortLabel}
              </p>
              {tool.badge && <span style={{ fontSize:7, fontWeight:800, color:"#fff", background:tool.color, padding:"2px 5px", borderRadius:4, fontFamily:"var(--font-mono)", flexShrink:0, marginTop:2 }}>{tool.badge}</span>}
            </div>
            <p style={{ fontSize:"clamp(0.65rem,0.85vw,0.77rem)", color:"var(--text3)", fontFamily:"var(--font-display)", marginTop:4, lineHeight:1.45 }}>
              {tool.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
