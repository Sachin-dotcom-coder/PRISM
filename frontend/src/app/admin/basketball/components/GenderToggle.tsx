import React from 'react';

interface GenderToggleProps {
  gender: "men" | "women";
  setGender: (val: "men" | "women") => void;
}

export default function GenderToggle({ gender, setGender }: GenderToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
      <button
        onClick={() => setGender("men")}
        className={`px-6 py-2 rounded-md text-sm font-bold tracking-wider uppercase transition-all ${
          gender === "men" 
            ? "bg-[#FFBF00] text-black shadow-md" 
            : "text-zinc-500 hover:text-white"
        }`}
      >
        Men
      </button>
      <button
        onClick={() => setGender("women")}
        className={`px-6 py-2 rounded-md text-sm font-bold tracking-wider uppercase transition-all ${
          gender === "women" 
            ? "bg-[#FFBF00] text-black shadow-md" 
            : "text-zinc-500 hover:text-white"
        }`}
      >
        Women
      </button>
    </div>
  );
}
