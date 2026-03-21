"use client";

import React from "react";

const SPORTS = [
  { label: "CRICKET",       href: "/sports/cricket",       emoji: "🏏" },
  { label: "FOOTBALL",      href: "/sports/football",      emoji: "⚽" },
  { label: "KABADDI",       href: "/sports/kabaddi",       emoji: "🏃‍♂️" },
  { label: "TUG OF WAR",    href: "/sports/tug-of-war",    emoji: "⚓" },
  { label: "KHO KHO",       href: "/sports/kho-kho",       emoji: "🏃" },
  { label: "ATHLETICS",     href: "/sports/athletics",     emoji: "👟" },
  { label: "VOLLEYBALL",    href: "/sports/volleyball",    emoji: "🏐" },
  { label: "HANDBALL",      href: "/sports/handball",      emoji: "🤾" },
  { label: "BASKETBALL",    href: "/sports/basketball",    emoji: "🏀" },
  { label: "TABLE TENNIS",  href: "/sports/table-tennis",  emoji: "🏓" },
  { label: "LAWN TENNIS",   href: "/sports/lawn-tennis",   emoji: "🎾" },
  { label: "BADMINTON",     href: "/sports/badminton",     emoji: "🏸" },
  { label: "CHESS",         href: "/sports/chess",         emoji: "♟️" },
  { label: "CARROM",         href: "/sports/carrom",         emoji: "⚪" },
  { label: "POWER SPORTS",  href: "/sports/power-sports",  emoji: "🏋️‍♂️" },
  { label: "ARM WRESTLING", href: "/sports/arm-wrestling", emoji: "💪" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SportsMenuOverlay({ open, onClose }: Props) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
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
        // Changed to start so content flows naturally for scrolling
        justifyContent: "flex-start", 
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.4s ease",
        overflowY: "auto", // Essential for mobile scrolling
        padding: "80px 24px",
      }}
    >
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
          cursor: "pointer",
          zIndex: 1001,
        }}
      >
        ✕
      </button>

      <h2 style={{
        color: "#FFBF00",
        fontSize: "0.75rem",
        letterSpacing: "0.5em",
        fontWeight: 600,
        marginBottom: "60px",
        textAlign: "center",
        opacity: 0.8
      }}>
        SELECT YOUR SPORT
      </h2>

      <div
        style={{
          display: "grid",
          // Fixed Mobile Scrolling: 2 columns on small screens, 4 on desktop
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "30px",
          width: "100%",
          maxWidth: "900px",
          paddingBottom: "40px"
        }}
      >
        {SPORTS.map((sport) => (
          <a
            key={sport.label}
            href={sport.href}
            onClick={onClose}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            {/* Emoji Container */}
            <span style={{ 
              fontSize: "2.5rem", 
              marginBottom: "12px",
              filter: "sepia(1) saturate(5) hue-rotate(-50deg)" // Makes emojis look amber/golden
            }}>
              {sport.emoji}
            </span>
            
            {/* Label */}
            <span style={{
              color: "#FFFFFF",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textAlign: "center",
              transition: "color 0.2s ease"
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#FFBF00")}
            onMouseLeave={e => (e.currentTarget.style.color = "#FFFFFF")}
            >
              {sport.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}