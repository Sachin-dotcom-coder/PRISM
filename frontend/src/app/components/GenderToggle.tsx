"use client";

import { useGender } from "./Providers";

export default function GenderToggle() {
  const { gender, setGender } = useGender();
  const isWomen = gender === "f";

  return (
    <div
      className="flex items-center rounded-xl p-[3px] gap-[3px]"
      style={{ background: "#111", border: "1px solid #2A2A2A", width: "fit-content" }}
    >
      <button
        onClick={() => setGender("m")}
        className="px-5 py-2 rounded-[10px] text-sm font-black tracking-wider transition-all duration-200"
        style={
          !isWomen
            ? { background: "#FFBF00", color: "#000", boxShadow: "0 2px 10px rgba(255,191,0,0.45)" }
            : { background: "transparent", color: "#555" }
        }
      >
        Men
      </button>
      <button
        onClick={() => setGender("f")}
        className="px-5 py-2 rounded-[10px] text-sm font-black tracking-wider transition-all duration-200"
        style={
          isWomen
            ? { background: "#FFBF00", color: "#000", boxShadow: "0 2px 10px rgba(255,191,0,0.45)" }
            : { background: "transparent", color: "#555" }
        }
      >
        Women
      </button>
    </div>
  );
}
