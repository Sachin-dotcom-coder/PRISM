import Navbar from "@/app/components/Navbar";

export default function VolleyballLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="pt-24 px-6 md:px-12 pb-12">
        {children}
      </main>
    </div>
  );
}