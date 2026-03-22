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
  { label: "CARROM",        href: "/sports/carrom",        emoji: "⚪" },
  { label: "POWER SPORTS",  href: "/sports/power-sports",  emoji: "🏋️‍♂️" },
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
        zIndex: 9999,
        backgroundColor: "rgba(0,0,0,0.98)", // Nearly solid black
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center", // Centers the entire grid vertically on laptop
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.4s ease",
        overflowY: "auto",
        padding: "60px 5vw",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "fixed",
          top: "30px",
          right: "40px",
          background: "transparent",
          border: "none",
          color: "#FFBF00",
          fontSize: "2.5rem",
          cursor: "pointer",
          zIndex: 10001,
        }}
      >
        ✕
      </button>

      <div
        style={{
          display: "grid",
          // Smart Grid: min 140px on phone, up to 220px on laptop
          gridTemplateColumns: "repeat(auto-fit, minmax(clamp(140px, 15vw, 220px), 1fr))",
          gap: "clamp(20px, 5vh, 50px)", 
          width: "100%",
          maxWidth: "1400px", // Allows it to fill laptop screens
          margin: "auto",
          padding: "20px 0"
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
              transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "scale(1.15) translateY(-10px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1) translateY(0)";
            }}
          >
            {/* Emoji scales from 2.5rem (phone) to 5rem (laptop) */}
            <span style={{ 
              fontSize: "clamp(2.5rem, 6vh, 5rem)", 
              marginBottom: "15px",
              filter: "sepia(1) saturate(5) hue-rotate(-50deg) drop-shadow(0 0 10px rgba(255,191,0,0.2))",
              lineHeight: 1
            }}>
              {sport.emoji}
            </span>
            
            {/* Text scales slightly for better visibility */}
            <span style={{
              color: "#FFFFFF",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(0.65rem, 0.8vw, 0.9rem)",
              letterSpacing: "0.25em",
              textAlign: "center",
              textTransform: "uppercase"
            }}>
              {sport.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}