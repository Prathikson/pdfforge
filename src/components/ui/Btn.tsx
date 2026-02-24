"use client";

import { useState, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "xs" | "sm" | "md" | "lg";

interface BtnProps {
  children: ReactNode;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  variant?: Variant;
  size?: Size;
  color?: string;
  fullWidth?: boolean;
  className?: string;
  type?: "button" | "submit";
  icon?: ReactNode;
}

const sizeMap: Record<Size, string> = {
  xs: "px-2.5 py-1.5 text-xs gap-1.5 rounded-lg",
  sm: "px-3.5 py-2 text-xs gap-2 rounded-lg",
  md: "px-5 py-2.5 text-sm gap-2.5 rounded-xl",
  lg: "px-7 py-3.5 text-sm gap-3 rounded-xl",
};

export function Btn({
  children,
  onClick,
  disabled,
  variant = "primary",
  size = "md",
  color,
  fullWidth,
  className = "",
  type = "button",
  icon,
}: BtnProps) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (disabled || loading) return;
    if (onClick) {
      const result = onClick();
      if (result instanceof Promise) {
        setLoading(true);
        try {
          await result;
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const accentColor = color ?? "var(--accent)";

  const variantStyles: Record<Variant, string> = {
    primary:
      "text-white font-semibold shadow-sm active:scale-[0.98]",
    secondary:
      "bg-[var(--surface2)] text-[var(--text)] border border-[var(--border2)] hover:bg-[var(--surface3)] font-medium active:scale-[0.98]",
    outline:
      "bg-transparent text-[var(--text)] border border-[var(--border2)] hover:bg-[var(--surface2)] font-medium active:scale-[0.98]",
    ghost:
      "bg-transparent text-[var(--text2)] hover:bg-[var(--surface2)] hover:text-[var(--text)] font-medium",
    danger:
      "bg-[var(--red-dim)] text-[var(--red)] border border-[var(--red)]/20 hover:bg-[var(--red)]/15 font-medium active:scale-[0.98]",
  };

  return (
    <button
      type={type}
      onClick={handle}
      disabled={disabled || loading}
      style={
        variant === "primary"
          ? {
              background: disabled ? "var(--surface3)" : accentColor,
              opacity: disabled ? 0.6 : 1,
            }
          : undefined
      }
      className={[
        "inline-flex items-center justify-center transition-all duration-150 select-none",
        "disabled:cursor-not-allowed",
        sizeMap[size],
        variantStyles[variant],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
    >
      {loading ? (
        <span
          className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"
          style={{ display: "block" }}
        />
      ) : null}
      {!loading && icon && icon}
      <span style={{ fontFamily: "var(--font-display)" }}>{children}</span>
    </button>
  );
}
