"use client";



import React from "react";

import useSWR from "swr";

import { useGender } from "@/app/components/Providers";

import LiveScoreSection from "@/app/components/LiveScoreSection";



const fetcher = (url: string) => fetch(url).then((r) => r.json());



export default function TeamsPage() {

  const { gender } = useGender();

  const { data: teams, error } = useSWR(`/api/homepage-leaderboard?gender=${gender}`, fetcher, {

    refreshInterval: 10000,

  });



  const departments = ["ECE", "CSE", "AI", "MECH", "CHE", "CE", "EE", "SCI", "MBA"];

  const marqueeContent = Array(4).fill(departments).flat();



  const validTeams = Array.isArray(teams) ? teams : [];



  return (

    <section id="teams" className="relative w-full h-auto bg-[#000000] pt-[10vh] pb-[8vh] overflow-hidden">

     

      <h2 className="text-center font-sans font-[900] text-5xl md:text-6xl uppercase tracking-[0.4em] text-[#FFBF00] mb-12 drop-shadow-[0_0_15px_rgba(255,191,0,0.4)]">

        TEAMS

      </h2>



      <div className="relative w-full border-y border-[rgba(255,191,0,0.3)] py-6 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">

        <div className="flex items-center w-full animate-marquee-slow hover:[animation-play-state:paused] group pb-2">

          {marqueeContent.map((dept, idx) => (

            <React.Fragment key={idx}>

              <span className="mx-6 md:mx-10 font-sans text-3xl md:text-4xl font-[800] text-white transition-all duration-300 snap-center shrink-0

                               hover:scale-110 hover:text-[#FFBF00] hover:drop-shadow-[0_0_15px_rgba(255,191,0,0.5)]">

                {dept}

              </span>

              {idx < marqueeContent.length - 1 && (

                <span className="text-[#FFBF00] text-2xl md:text-3xl font-bold opacity-60 shrink-0">

                  |

                </span>

              )}

            </React.Fragment>

          ))}

        </div>

      </div>



      <div className="w-full max-w-6xl mx-auto px-[5vw] mt-12 mb-4" id="live-score">

        <LiveScoreSection />

      </div>



      {/* Current standings and prime fixtures removed per request */}



    </section>

  );
}
