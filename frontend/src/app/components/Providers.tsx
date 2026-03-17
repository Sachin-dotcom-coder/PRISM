"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Gender = "m" | "f";

interface GenderContextType {
  gender: Gender;
  setGender: (val: Gender) => void;
}

const GenderContext = createContext<GenderContextType>({
  gender: "m",
  setGender: () => {},
});

export const useGender = () => useContext(GenderContext);

export default function Providers({ children }: { children: React.ReactNode }) {
  const [gender, setGender] = useState<Gender>("m");
  const [mounted, setMounted] = useState(false);

  // Sync preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("prism_gender") as Gender;
    if (saved === "f" || saved === "m") {
      setGender(saved);
    }
    setMounted(true);
  }, []);

  // Update localStorage and body class when gender changes
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("prism_gender", gender);
    if (gender === "f") {
      document.body.classList.add("theme-women");
      document.body.classList.remove("theme-men");
    } else {
      document.body.classList.add("theme-men");
      document.body.classList.remove("theme-women");
    }
  }, [gender, mounted]);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) return <div className="min-h-screen bg-background" />;

  return (
    <GenderContext.Provider value={{ gender, setGender }}>
      {children}
    </GenderContext.Provider>
  );
}
