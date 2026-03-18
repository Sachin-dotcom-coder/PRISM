"use client";

import React from "react";

export default function AboutPrism() {
  return (
    <section id="about-prism" className="relative w-full bg-[#000000] py-20 px-[5vw] border-t border-[rgba(255,191,0,0.1)]">
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
        <h2 className="font-sans font-[900] text-4xl md:text-5xl uppercase tracking-[0.3em] text-[#FFBF00] mb-8 drop-shadow-[0_0_15px_rgba(255,191,0,0.3)]">
          ABOUT PRISM
        </h2>
        
        <p className="text-white text-opacity-80 leading-relaxed text-lg md:text-xl font-medium max-w-4xl tracking-wide mb-8">
          PRISM is the premier sports festival of SVNIT, a grand celebration of athleticism, teamwork, and unyielding spirit. 
          Bringing together the brightest and most talented athletes across departments, PRISM transcends beyond mere competition—it is a legacy of passion.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8">
          <div className="bg-[rgba(20,20,20,0.6)] border border-[rgba(255,191,0,0.2)] p-8 rounded-sm hover:border-[#FFBF00] transition-all hover:-translate-y-2">
            <h3 className="text-[#FFBF00] text-2xl font-bold mb-4 tracking-widest">30+</h3>
            <p className="text-white text-opacity-60 uppercase tracking-widest text-sm font-semibold">Sporting Events</p>
          </div>
          <div className="bg-[rgba(20,20,20,0.6)] border border-[rgba(255,191,0,0.2)] p-8 rounded-sm hover:border-[#FFBF00] transition-all hover:-translate-y-2">
            <h3 className="text-[#FFBF00] text-2xl font-bold mb-4 tracking-widest">5000+</h3>
            <p className="text-white text-opacity-60 uppercase tracking-widest text-sm font-semibold">Participants</p>
          </div>
          <div className="bg-[rgba(20,20,20,0.6)] border border-[rgba(255,191,0,0.2)] p-8 rounded-sm hover:border-[#FFBF00] transition-all hover:-translate-y-2">
            <h3 className="text-[#FFBF00] text-2xl font-bold mb-4 tracking-widest">1</h3>
            <p className="text-white text-opacity-60 uppercase tracking-widest text-sm font-semibold">Champion</p>
          </div>
        </div>
      </div>
    </section>
  );
}
