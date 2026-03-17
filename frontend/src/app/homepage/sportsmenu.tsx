"use client";

import React from "react";

// === Phase 4 — Steps 20–24 ===
// Full-screen sports menu overlay with 16 sport cards, amber borders,
// bounce hover animation, and close-on-click/Escape functionality.

// Step 22: 16 sport categories with routing slugs
const SPORTS = [
  { label: "CRICKET",       href: "/sports/cricket"       },
  { label: "FOOTBALL",      href: "/sports/football"      },
  { label: "KABADDI",       href: "/sports/kabaddi"       },
  { label: "TUG OF WAR",    href: "/sports/tug-of-war"    },
  { label: "KHO KHO",       href: "/sports/kho-kho"       },
  { label: "ATHLETICS",     href: "/sports/athletics"     },
  { label: "VOLLEYBALL",    href: "/sports/volleyball"    },
  { label: "HANDBALL",      href: "/sports/handball"      },
  { label: "BASKETBALL",    href: "/sports/basketball"    },
  { label: "TABLE TENNIS",  href: "/sports/table-tennis"  },
  { label: "LAWN TENNIS",   href: "/sports/lawn-tennis"   },
  { label: "BADMINTON",     href: "/sports/badminton"     },
  { label: "CHESS",         href: "/sports/chess"         },
  { label: "CARROM",        href: "/sports/carrom"        },
  { label: "POWER SPORTS",  href: "/sports/power-sports"  },
  { label: "ARM WRESTLING", href: "/sports/arm-wrestling" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SportsMenuOverlay({ open, onClose }: Props) {
  // Close on Escape key
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    // === Step 20: Full-screen fixed overlay — drops over the whole page ===
    <div
      aria-modal="true"
      role="dialog"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999,
        backgroundColor: "#000000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        // Smooth curtain transition
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.4s ease",
        overflowY: "auto",
        padding: "60px 24px",
      }}
    >
      {/* Close (×) button — top-right */}
      <button
        onClick={onClose}
        style={{
          position: "fixed",
          top: "24px",
          right: "32px",
          background: "transparent",
          border: "none",
          color: "#FFBF00",
          fontSize: "2rem",
          lineHeight: 1,
          cursor: "pointer",
          transition: "transform 0.2s ease, color 0.2s ease",
          zIndex: 1000,
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "rotate(90deg) scale(1.2)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "rotate(0deg) scale(1)")}
        aria-label="Close menu"
      >
        ✕
      </button>

      {/* Section heading */}
      <h2
        style={{
          color: "#FFBF00",
          fontSize: "clamp(0.65rem, 1.2vw, 0.85rem)",
          letterSpacing: "0.5em",
          fontWeight: 600,
          marginBottom: "40px",
          textTransform: "uppercase",
          opacity: 0.7,
        }}
      >
        SELECT YOUR SPORT
      </h2>

      {/* === Step 21: Responsive grid — 4 cols desktop, 2 mobile === */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(160px, 220px))",
          gap: "24px",
          placeItems: "center",
          width: "100%",
          maxWidth: "1000px",
        }}
      >
        {/* === Steps 22–24: Individual sport cards === */}
        {SPORTS.map((sport) => (
          <a
            key={sport.label}
            href={sport.href}
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              aspectRatio: "2 / 1",
              // === Step 23: Background & border ===
              backgroundColor: "#1A1A1A",
              border: "1px solid #FFBF00",
              color: "#FFFFFF",
              textDecoration: "none",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(0.65rem, 1.1vw, 0.9rem)",
              letterSpacing: "0.18em",
              textAlign: "center",
              padding: "12px 8px",
              // === Step 24: Bounce cubic-bezier transition ===
              transition:
                "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.2s ease, border-color 0.2s ease, box-shadow 0.3s ease",
              willChange: "transform",
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.transform = "scale(1.04)";
              el.style.color = "#FFBF00";
              el.style.borderColor = "#FFDF73";
              el.style.boxShadow = "0 0 18px rgba(255,191,0,0.25)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.transform = "scale(1)";
              el.style.color = "#FFFFFF";
              el.style.borderColor = "#FFBF00";
              el.style.boxShadow = "none";
            }}
          >
            {sport.label}
          </a>
        ))}
      </div>
    </div>
  );
}
