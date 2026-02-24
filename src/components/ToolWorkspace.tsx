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

const TOOL_GROUPS = [
  { label: "ORGANIZE", tools: ["merge", "split", "reorder"] },
  { label: "TRANSFORM", tools: ["rotate", "compress", "grayscale"] },
  { label: "CONVERT", tools: ["img2pdf", "pdf2img"] },
  { label: "SECURE", tools: ["protect", "unlock", "watermark"] },
  { label: "EDIT", tools: ["meta"] },
];

export function ToolWorkspace({ toast }: ToolWorkspaceProps) {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [animating, setAnimating] = useState(false);
  const workRef = useRef<HTMLDivElement>(null);

  const activeCfg = TOOLS.find((t) => t.id === activeTool);
  const hoveredCfg = TOOLS.find((t) => t.id === (hoveredTool ?? activeTool));

  const openTool = (id: string) => {
    if (id === activeTool) return;
    setAnimating(true);
    setTimeout(() => {
      setActiveTool(id);
      setAnimating(false);
    }, 160);
    setTimeout(() => {
      workRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 220);
  };

  const renderTool = () => {
    const props = { toast };
    switch (activeTool) {
      case "merge":     return <MergeTool {...props} />;
      case "split":     return <SplitTool {...props} />;
      case "rotate":    return <RotateTool {...props} />;
      case "img2pdf":   return <ImageToPDFTool {...props} />;
      case "compress":  return <CompressTool {...props} />;
      case "protect":   return <ProtectTool {...props} />;
      case "unlock":    return <UnlockTool {...props} />;
      case "watermark": return <WatermarkTool {...props} />;
      case "reorder":   return <ReorderTool {...props} />;
      case "grayscale": return <GrayscaleTool {...props} />;
      case "meta":      return <MetaTool {...props} />;
      case "pdf2img":   return <PDF2ImgTool {...props} />;
      default:          return null;
    }
  };

  const glowColor = hoveredCfg?.color ?? "var(--accent)";

  return (
    <>
      <style>{`
        .workspace-section {
          width: 100%;
          padding: clamp(2.5rem,5vw,5rem) clamp(1rem,3vw,2.5rem);
          position: relative;
          overflow: hidden;
        }
        .workspace-layout {
          display: grid;
          grid-template-columns: ${sidebarOpen ? "clamp(200px,18vw,270px)" : "52px"} 1fr;
          gap: clamp(0.75rem,1.5vw,1.25rem);
          align-items: start;
          transition: grid-template-columns 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .sidebar-btn {
          width:100%; display:flex; align-items:center;
          border:none; cursor:pointer;
          border-radius:12px; transition:all 0.15s ease;
          position:relative; overflow:hidden;
        }
        .sidebar-btn:hover { background: var(--surface2) !important; }
        .tool-card {
          text-align:left; border-radius:18px;
          cursor:pointer; transition:all 0.22s ease;
        }
        .tool-card:hover { transform: translateY(-4px); }
        .close-btn { transition: all 0.15s; }
        .close-btn:hover { background: var(--red-dim) !important; border-color: var(--red) !important; }
        @media (max-width:900px) {
          .workspace-layout {
            grid-template-columns: 1fr !important;
          }
          .sidebar-sticky {
            position: static !important;
            display: grid !important;
            grid-template-columns: repeat(auto-fill,minmax(72px,1fr)) !important;
            gap: 6px !important;
          }
        }
      `}</style>

      <section id="tools" className="workspace-section">
        {/* Ambient glow */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
          background:`radial-gradient(ellipse 70% 60% at 75% 40%, ${glowColor}09 0%, transparent 70%)`,
          transition:"background 0.9s ease",
        }} />

        <div style={{ maxWidth:1800, margin:"0 auto", position:"relative", zIndex:1 }}>

          {/* ── Header ── */}
          <div style={{
            display:"flex", alignItems:"flex-end", justifyContent:"space-between",
            flexWrap:"wrap", gap:"1rem",
            marginBottom:"clamp(1.5rem,3vw,2.5rem)",
          }}>
            <div>
              <p style={{
                fontSize:"clamp(0.6rem,0.8vw,0.7rem)", fontWeight:700, color:"var(--accent)",
                fontFamily:"var(--font-mono)", letterSpacing:"0.22em", textTransform:"uppercase", marginBottom:"0.5rem",
              }}>// PDF TOOLS SUITE</p>
              <h2 style={{
                fontSize:"clamp(2rem,5vw,4rem)", fontWeight:800, color:"var(--text)",
                fontFamily:"var(--font-display)", letterSpacing:"-0.04em", lineHeight:0.95,
              }}>
                Every PDF need,{" "}
                <span style={{ fontFamily:"var(--font-serif)", fontStyle:"italic", fontWeight:300, color:"var(--text2)" }}>
                  solved.
                </span>
              </h2>
            </div>
            <p style={{
              fontSize:"clamp(0.7rem,1vw,0.85rem)", color:"var(--text3)",
              fontFamily:"var(--font-mono)", textAlign:"right", lineHeight:1.7,
            }}>
              12 tools · Real PDF previews<br/>100% private · Zero server uploads
            </p>
          </div>

          {/* ── Main layout ── */}
          <div className="workspace-layout">

            {/* ════ SIDEBAR ════ */}
            <div className="sidebar-sticky" style={{
              position:"sticky", top:80,
              display:"flex", flexDirection:"column", gap:3,
              background:"var(--surface)", borderRadius:20,
              border:"1px solid var(--border)",
              padding: sidebarOpen ? "clamp(0.75rem,1.5vw,1rem)" : "0.5rem",
              transition:"padding 0.35s ease",
              overflow:"hidden",
              boxShadow:"var(--card-shadow)",
            }}>
              {/* Toggle */}
              <div style={{
                display:"flex", alignItems:"center",
                justifyContent: sidebarOpen ? "space-between" : "center",
                padding: sidebarOpen ? "2px 4px 10px" : "2px 0 10px",
                borderBottom:"1px solid var(--border)", marginBottom:4,
              }}>
                {sidebarOpen && (
                  <span style={{ fontSize:9, fontWeight:700, color:"var(--text3)", fontFamily:"var(--font-mono)", letterSpacing:"0.18em" }}>
                    TOOLS
                  </span>
                )}
                <button
                  onClick={() => setSidebarOpen(p => !p)}
                  style={{
                    width:28, height:28, borderRadius:8, background:"var(--surface2)",
                    border:"1px solid var(--border)", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2.5" strokeLinecap="round">
                    <path d={sidebarOpen ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
                  </svg>
                </button>
              </div>

              {/* Groups */}
              {TOOL_GROUPS.map((group) => (
                <div key={group.label}>
                  {sidebarOpen && (
                    <p style={{
                      fontSize:8, fontWeight:700, color:"var(--text3)",
                      fontFamily:"var(--font-mono)", letterSpacing:"0.18em",
                      padding:"5px 8px 3px",
                    }}>{group.label}</p>
                  )}
                  {group.tools.map((tid) => {
                    const tool = TOOLS.find(t => t.id === tid)!;
                    const isActive = activeTool === tid;
                    return (
                      <button
                        key={tid}
                        className="sidebar-btn"
                        onClick={() => openTool(tid)}
                        onMouseEnter={() => setHoveredTool(tid)}
                        onMouseLeave={() => setHoveredTool(null)}
                        title={!sidebarOpen ? tool.label : undefined}
                        style={{
                          gap: sidebarOpen ? 10 : 0,
                          justifyContent: sidebarOpen ? "flex-start" : "center",
                          padding: sidebarOpen ? "9px 10px" : "9px 0",
                          background: isActive ? `${tool.color}16` : "transparent",
                        }}
                      >
                        {isActive && (
                          <div style={{
                            position:"absolute", left:0, top:"50%", transform:"translateY(-50%)",
                            width:3, height:"65%", borderRadius:"0 3px 3px 0", background:tool.color,
                          }} />
                        )}
                        <div style={{
                          width:30, height:30, borderRadius:9, flexShrink:0,
                          background: isActive ? `${tool.color}25` : `${tool.color}12`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          transition:"background 0.15s, transform 0.15s",
                          transform: isActive ? "scale(1.05)" : "scale(1)",
                        }}>
                          <Icon name={tool.icon} size={14} color={isActive ? tool.color : "var(--text3)"} />
                        </div>
                        {sidebarOpen && (
                          <div style={{ flex:1, minWidth:0, textAlign:"left" }}>
                            <p style={{
                              fontSize:12.5, fontWeight: isActive ? 700 : 500,
                              color: isActive ? tool.color : "var(--text)",
                              fontFamily:"var(--font-display)",
                              whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                            }}>{tool.shortLabel}</p>
                          </div>
                        )}
                        {sidebarOpen && tool.badge && (
                          <span style={{
                            fontSize:7, fontWeight:800, color:"#fff", background:tool.color,
                            padding:"2px 5px", borderRadius:4, fontFamily:"var(--font-mono)", flexShrink:0,
                          }}>{tool.badge}</span>
                        )}
                      </button>
                    );
                  })}
                  <div style={{ height:1, background:"var(--border)", margin:"5px 4px" }} />
                </div>
              ))}
            </div>

            {/* ════ WORKSPACE ════ */}
            <div ref={workRef} style={{ scrollMarginTop:80, minWidth:0 }}>
              {!activeTool ? (
                <EmptyState onPick={openTool} />
              ) : (
                <div style={{
                  borderRadius:24,
                  border:`1px solid ${activeCfg!.color}35`,
                  background:"var(--surface)",
                  boxShadow:`0 0 0 1px ${activeCfg!.color}12, var(--shadow-lg)`,
                  overflow:"hidden",
                  transition:"box-shadow 0.4s ease, border-color 0.4s ease",
                }}>
                  {/* Header */}
                  <div style={{
                    display:"flex", alignItems:"center",
                    gap:"clamp(0.75rem,2vw,1.5rem)",
                    padding:"clamp(1.25rem,2.5vw,2rem) clamp(1.5rem,3vw,2.75rem)",
                    background:`linear-gradient(135deg, ${activeCfg!.color}07 0%, transparent 55%)`,
                    borderBottom:`1px solid ${activeCfg!.color}20`,
                  }}>
                    <div style={{
                      width:"clamp(3.25rem,5vw,4.75rem)",
                      height:"clamp(3.25rem,5vw,4.75rem)",
                      borderRadius:18,
                      background:`${activeCfg!.color}18`,
                      border:`1.5px solid ${activeCfg!.color}35`,
                      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                      boxShadow:`0 6px 20px ${activeCfg!.color}28`,
                    }}>
                      <Icon name={activeCfg!.icon} size={40} color={activeCfg!.color} />
                    </div>

                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                        <h3 style={{
                          fontSize:"clamp(1.25rem,2.5vw,2rem)", fontWeight:600,
                          color:"var(--text)", fontFamily:"var(--font-display)", letterSpacing:"-0.02em",
                        }}>{activeCfg!.label}</h3>
                        {activeCfg!.badge && (
                          <span style={{
                            fontSize:9, fontWeight:800, color:"#fff", background:activeCfg!.color,
                            padding:"3px 9px", borderRadius:6, fontFamily:"var(--font-mono)", letterSpacing:"0.06em",
                          }}>{activeCfg!.badge}</span>
                        )}
                      </div>
                      <p style={{
                        fontSize:"clamp(0.68rem,1vw,0.82rem)", color:"var(--text3)",
                        fontFamily:"var(--font-mono)", marginTop:5,
                      }}>
                        🔒 Processed entirely in your browser · Never uploaded · Auto-cleaned in 5 min
                      </p>
                    </div>

                    {/* Quick-switch pills (desktop) */}
                    <div style={{
                      display:"flex", gap:4, flexWrap:"wrap",
                      justifyContent:"flex-end", maxWidth:"38%",
                    }} className="tool-pills-desktop">
                      {TOOLS.map(t => (
                        <button
                          key={t.id}
                          onClick={() => openTool(t.id)}
                          title={t.label}
                          style={{
                            padding:"4px 9px", fontSize:10, fontWeight:700,
                            fontFamily:"var(--font-display)", borderRadius:8,
                            background: activeTool === t.id ? `${t.color}22` : "var(--surface2)",
                            color: activeTool === t.id ? t.color : "var(--text3)",
                            border:`1px solid ${activeTool === t.id ? t.color+"60" : "var(--border)"}`,
                            cursor:"pointer", transition:"all 0.12s",
                            whiteSpace:"nowrap",
                          }}
                        >{t.shortLabel}</button>
                      ))}
                    </div>

                    <button
                      className="close-btn"
                      onClick={() => setActiveTool(null)}
                      style={{
                        width:38, height:38, borderRadius:12, flexShrink:0,
                        background:"var(--surface2)", border:"1px solid var(--border2)",
                        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                      }}
                    >
                      <Icon name="x" size={16} color="var(--text3)" />
                    </button>
                  </div>

                  {/* Shimmer accent bar */}
                  <div style={{
                    height:3,
                    background:`linear-gradient(90deg, ${activeCfg!.color}, ${activeCfg!.color}70, ${activeCfg!.color}20, transparent)`,
                  }} />

                  {/* Tool body */}
                  <div style={{
                    padding:"clamp(1.75rem,3.5vw,3.5rem)",
                    minHeight:"clamp(520px,68vh,960px)",
                    opacity: animating ? 0 : 1,
                    transform: animating ? "translateY(10px)" : "translateY(0)",
                    transition:"opacity 0.16s ease, transform 0.16s ease",
                  }}>
                    {renderTool()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .workspace-layout {
              grid-template-columns: 1fr !important;
            }
            .sidebar-sticky {
              position: static !important;
              display: grid !important;
              grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)) !important;
              gap: 6px !important;
              flex-direction: unset !important;
            }
            .tool-pills-desktop {
              display: none !important;
            }
          }
          @media (min-width: 901px) and (max-width: 1280px) {
            .tool-pills-desktop {
              display: none !important;
            }
          }
        `}</style>
      </section>
    </>
  );
}

/* ── Empty state ── */
function EmptyState({ onPick }: { onPick: (id: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{
      borderRadius:24, border:"1px solid var(--border)",
      background:"var(--surface)", overflow:"hidden",
    }}>
      {/* Banner */}
      <div style={{
        padding:"clamp(2.5rem,6vw,5rem) clamp(1.5rem,4vw,3rem) clamp(2rem,4vw,3rem)",
        textAlign:"center", borderBottom:"1px solid var(--border)",
        background:"var(--surface2)",
      }}>
        <div style={{ fontSize:"clamp(2.5rem,5vw,4.5rem)", marginBottom:18, lineHeight:1 }}>✦</div>
        <h3 style={{
          fontSize:"clamp(1.3rem,2.5vw,2.25rem)", fontWeight:800, color:"var(--text)",
          fontFamily:"var(--font-display)", letterSpacing:"-0.03em", marginBottom:10,
        }}>Pick a tool to get started</h3>
        <p style={{
          fontSize:"clamp(0.75rem,1.2vw,0.9rem)", color:"var(--text3)", fontFamily:"var(--font-mono)",
        }}>Drop files → Live preview → Download when ready</p>
      </div>

      {/* Tool grid */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill, minmax(clamp(140px,15vw,220px), 1fr))",
        gap:"clamp(0.5rem,1vw,0.875rem)",
        padding:"clamp(1.25rem,2.5vw,2rem)",
      }}>
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            className="tool-card"
            onClick={() => onPick(tool.id)}
            onMouseEnter={() => setHovered(tool.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              padding:"clamp(1rem,1.8vw,1.5rem)",
              border:`1.5px solid ${hovered === tool.id ? tool.color+"55" : "var(--border)"}`,
              background: hovered === tool.id ? `${tool.color}09` : "var(--surface2)",
              boxShadow: hovered === tool.id ? `0 10px 32px ${tool.color}22` : "none",
            }}
          >
            <div style={{
              width:"clamp(2.5rem,4vw,3.25rem)", height:"clamp(2.5rem,4vw,3.25rem)",
              borderRadius:13, background:`${tool.color}18`,
              display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"0.875rem",
              transition:"transform 0.2s",
              transform: hovered === tool.id ? "scale(1.15) rotate(-4deg)" : "scale(1)",
            }}>
              <Icon name={tool.icon} size={20} color={tool.color} />
            </div>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:6 }}>
              <p style={{
                fontSize:"clamp(0.8rem,1.1vw,1rem)", fontWeight:700,
                color: hovered === tool.id ? tool.color : "var(--text)",
                fontFamily:"var(--font-display)", lineHeight:1.2, transition:"color 0.15s",
              }}>{tool.shortLabel}</p>
              {tool.badge && (
                <span style={{
                  fontSize:7, fontWeight:800, color:"#fff", background:tool.color,
                  padding:"2px 5px", borderRadius:4, fontFamily:"var(--font-mono)", flexShrink:0, marginTop:2,
                }}>{tool.badge}</span>
              )}
            </div>
            <p style={{
              fontSize:"clamp(0.65rem,0.85vw,0.77rem)", color:"var(--text3)",
              fontFamily:"var(--font-display)", marginTop:4, lineHeight:1.45,
            }}>{tool.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}