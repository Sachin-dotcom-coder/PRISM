import HeroPage from "./homepage/heropage";
import TeamsPage from "./homepage/teamspage";
<<<<<<< Updated upstream


=======
>>>>>>> Stashed changes
import SportScoreBar from "./components/SportScoreBar";
import HomepageLeaderboard from "./components/HomepageLeaderboard";
import AboutPrism from "./components/AboutPrism";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black overflow-x-hidden flex flex-col items-center justify-start">
      <HeroPage />
      <TeamsPage />
<<<<<<< Updated upstream

      
=======
>>>>>>> Stashed changes
      {/* Sport Score Bars */}
      <section id="scores" className="w-full">
        <SportScoreBar 
          sport="Football" 
          match="ECE vs CSE" 
          time="FULL TIME" 
          score1="2" 
          score2="1" 
        />
        <SportScoreBar 
          sport="Cricket" 
          match="AI vs MECH" 
          time="MATCH ENDED" 
          score1="134/4" 
          score2="132/9" 
        />
        <SportScoreBar 
          sport="Kabaddi" 
          match="CHE vs EEE" 
          time="2ND HALF" 
          score1="42" 
          score2="38" 
        />
      </section>

      {/* Leaderboard Section */}
      <section id="leaderboard" className="w-full max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-12">
          Leaderboard <span className="text-[#FFBF00]">Standings</span>
        </h2>
        <HomepageLeaderboard />
      </section>
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
      <AboutPrism />
      <Footer />
    </main>
  );
}
