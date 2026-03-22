import { AthleticsGender } from "../types";

interface GenderToggleProps {
  gender: AthleticsGender;
  setGender: (value: AthleticsGender) => void;
}

export default function GenderToggle({ gender, setGender }: GenderToggleProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 p-1.5">
      <button
        type="button"
        onClick={() => setGender("men")}
        className={`px-5 py-2 text-sm font-black uppercase tracking-widest transition-all ${
          gender === "men"
            ? "rounded-lg bg-[#FFBF00] text-black"
            : "text-zinc-500 hover:text-white"
        }`}
      >
        Men
      </button>
      <button
        type="button"
        onClick={() => setGender("women")}
        className={`px-5 py-2 text-sm font-black uppercase tracking-widest transition-all ${
          gender === "women"
            ? "rounded-lg bg-[#FFBF00] text-black"
            : "text-zinc-500 hover:text-white"
        }`}
      >
        Women
      </button>
    </div>
  );
}
