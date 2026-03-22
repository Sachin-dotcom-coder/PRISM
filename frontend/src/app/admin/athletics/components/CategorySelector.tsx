import { AthleticsCategory } from "../types";

interface CategorySelectorProps {
  category: AthleticsCategory;
  setCategory: (value: AthleticsCategory) => void;
}

export default function CategorySelector({
  category,
  setCategory
}: CategorySelectorProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <button
        type="button"
        onClick={() => setCategory("throw")}
        className={`rounded-2xl border p-5 text-left transition-all ${
          category === "throw"
            ? "border-[#FFBF00] bg-[#FFBF00]/10 shadow-[0_0_25px_rgba(255,191,0,0.15)]"
            : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
        }`}
      >
        <div className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Category</div>
        <div className="mt-2 text-xl font-black uppercase tracking-wider text-white">Throw Events</div>
        <div className="mt-2 text-sm text-zinc-400">Hammer throw, shot put, discus, javelin</div>
      </button>

      <button
        type="button"
        onClick={() => setCategory("run_jump")}
        className={`rounded-2xl border p-5 text-left transition-all ${
          category === "run_jump"
            ? "border-[#FFBF00] bg-[#FFBF00]/10 shadow-[0_0_25px_rgba(255,191,0,0.15)]"
            : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
        }`}
      >
        <div className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Category</div>
        <div className="mt-2 text-xl font-black uppercase tracking-wider text-white">Run & Jump Events</div>
        <div className="mt-2 text-sm text-zinc-400">Long jump, triple jump, 5000m men, 3000m women</div>
      </button>
    </div>
  );
}
