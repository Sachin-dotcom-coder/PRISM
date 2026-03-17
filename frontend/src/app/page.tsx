import HeroPage from "./homepage/heropage";
import TeamsPage from "./homepage/teamspage";

export default function Home() {
  return (
    <main className="min-h-screen bg-black overflow-x-hidden flex flex-col items-center justify-start">
      <HeroPage />
      <TeamsPage />
    </main>
  );
}
