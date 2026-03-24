import Navbar from "@/app/components/Navbar";

export default function CarromLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {children}
      </main>
    </>
  );
}