"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGender } from "@/app/components/Providers";

export default function AdminWomenRedirect() {
  const { setGender } = useGender();
  const router = useRouter();

  useEffect(() => {
    setGender("f");
    router.replace("/admin");
  }, [router, setGender]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="glass p-8 rounded-3xl border border-zinc-800 text-center">
        <p className="text-lg font-semibold">Switching to Women’s admin view…</p>
        <p className="text-sm text-zinc-500 mt-2">If you are not redirected, <a className="text-accent underline" href="/admin">click here</a>.</p>
      </div>
    </div>
  );
}
