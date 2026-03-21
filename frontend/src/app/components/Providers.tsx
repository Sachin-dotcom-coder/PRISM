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

  // Sync preference from localStorage / URL on mount
  useEffect(() => {
    const urlGender = new URL(window.location.href).searchParams.get("gender") as Gender | null;
    const saved = localStorage.getItem("prism_gender") as Gender;

    if (urlGender === "f" || urlGender === "m") {
      setGender(urlGender);
    } else if (saved === "f" || saved === "m") {
      setGender(saved);
    }

    setMounted(true);
  }, []);

  // Update localStorage, URL when gender changes
  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem("prism_gender", gender);

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("gender", gender);
    window.history.replaceState({}, "", currentUrl);
  }, [gender, mounted]);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) return <div className="min-h-screen bg-background" />;

  return (
    <GenderContext.Provider value={{ gender, setGender }}>
      {children}
    </GenderContext.Provider>
  );
}
