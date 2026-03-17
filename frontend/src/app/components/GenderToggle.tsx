"use client";

import { useGender } from "./Providers";
import { motion } from "framer-motion";

export default function GenderToggle() {
  const { gender, setGender } = useGender();
  const isWomen = gender === "f";

  return (
    <div className="flex justify-center my-8">
      <div className="relative flex items-center bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-full p-1 w-64 h-12 shadow-lg theme-women:bg-white/50 theme-women:border-zinc-200">
        
        {/* Sliding background pill */}
        <motion.div
          className="absolute h-10 rounded-full bg-accent shadow-lg"
          initial={false}
          animate={{
            x: isWomen ? "100%" : "0%",
            width: "50%",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />

        {/* Men Button */}
        <button
          onClick={() => setGender("m")}
          className={`flex-1 relative z-10 font-bold text-sm transition-colors duration-300 ${
            !isWomen ? "text-white" : "text-zinc-400 hover:text-zinc-200 theme-women:text-zinc-500 theme-women:hover:text-zinc-800"
          }`}
        >
          MEN
        </button>

        {/* Women Button */}
        <button
          onClick={() => setGender("f")}
          className={`flex-1 relative z-10 font-bold text-sm transition-colors duration-300 ${
            isWomen ? "text-white theme-women:text-white" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          WOMEN
        </button>
      </div>
    </div>
  );
}
