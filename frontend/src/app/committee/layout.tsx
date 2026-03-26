import Navbar from "@/app/components/Navbar";

export default function CommitteeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>
        {children}
      </main>
    </>
  );
}