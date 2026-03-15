"use client";

import { useEffect, useState } from "react";

export default function EnquiryTest() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/enquiries")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => setData(data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="p-4 border border-zinc-200 rounded dark:border-zinc-800 mt-8 w-full">
      <h2 className="text-xl font-bold mb-2">Backend Connection Test</h2>
      {error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <pre className="text-sm bg-black/[.04] p-2 rounded dark:bg-white/[.04] overflow-auto max-h-40">
          {data ? JSON.stringify(data, null, 2) : "Loading..."}
        </pre>
      )}
    </div>
  );
}
