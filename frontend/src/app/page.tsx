import HeroPage from "./homepage/heropage";
import TeamsPage from "./homepage/teamspage";

import HomepageLeaderboard from "./components/HomepageLeaderboard";
import AboutPrism from "./components/AboutPrism";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black overflow-x-hidden flex flex-col items-center justify-start">
      <HeroPage />
      <TeamsPage />

      {/* Removed duplicate LiveScoreSection here to prevent repeated bottom scores; TeamsPage now owns live scores */}

      {/* Leaderboard Section */}
      <section id="leaderboard" className="w-full max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-12">
          Leaderboard <span className="text-[#FFBF00]">Standings</span>
        </h2>
        <HomepageLeaderboard />
      </section>

      <AboutPrism />
      <Footer />
    </main>
  );
}
