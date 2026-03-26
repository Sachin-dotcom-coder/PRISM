"use client";

import React from "react";

// The data array pointing to your local files
const committeeMembers = [
  {
    id: 1,
    name: "Aadil",
    role: "Convenor",
    image: "/aadil.jpeg"
  },
  {
    id: 2,
    name: "Nakul",
    role: "Convenor",
    image: "/nakul.jpeg"
  },
  {
    id: 3,
    name: "Rohan",
    role: "Co-Convenor",
    image: "/rohan.jpeg"
  },
  {
    id: 4,
    name: "Yash",
    role: "Co-Convenor",
    image: "/yash.jpeg"
  },
  {
    id: 5,
    name: "RS Vishnoi",
    role: "Co-Convenor",
    image: "/rsvishnoi.jpeg"
  },
  {
    id: 6,
    name: "Devanshi",
    role: "Co-Convenor",
    image: "/devanshi.jpeg"
  },
  {
    id: 7,
    name: "Chetna",
    role: "Co-Convenor",
    image: "/chetna.jpeg"
  }
];

export default function CommitteePage() {
  // Split the data
  const convenors = committeeMembers.slice(0, 2);
  const coConvenorsRow1 = committeeMembers.slice(2, 5); // 3 members
  const coConvenorsRow2 = committeeMembers.slice(5, 7); // 2 members

  return (
    <div className="relative w-full min-h-screen bg-[#000000] overflow-hidden flex flex-col items-center pt-40 pb-20 font-sans text-white">
      
      {/* === Ambient Particle Sparks === */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden opacity-50">
        <div className="particle p1" /><div className="particle p2" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-8 flex flex-col items-center">
        
        {/* Section Header */}
        <div className="flex flex-col items-center mb-20 text-center">
          <div className="font-mono text-xs tracking-[0.4em] text-[#FFBF00] font-bold mb-4 select-none drop-shadow-[0_0_8px_rgba(255,191,0,0.5)]">
            SYS.USERS // PRISM.COMMITTEE
          </div>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-6 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] leading-none">
            Core <span className="text-[#FFBF00]">Committee</span>
          </h2>
          <p className="text-gray-400 font-mono text-sm md:text-base tracking-widest uppercase max-w-2xl">
            The minds behind the ultimate sports festival of SVNIT.
          </p>
        </div>

        {/* =========================================
            TOP ROW: CONVENORS (Slightly Bigger: max-w-[320px])
        ========================================= */}
        <div className="flex flex-wrap justify-center gap-8 w-full mb-12">
          {convenors.map((member) => (
            <div 
              key={member.id} 
              className="w-full max-w-[320px] group relative bg-[#050505] border border-[#1A1A1A] p-6 md:p-7 flex flex-col items-center transition-all duration-500 hover:border-[#FFBF00]/50 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(255,191,0,0.1)]"
            >
              {/* HUD Corners */}
              <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#FFBF00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[#FFBF00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[#FFBF00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#FFBF00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Image Container */}
              <div className="w-full aspect-[4/5] mb-6 overflow-hidden relative border border-[#1A1A1A] group-hover:border-[#FFBF00]/30 transition-colors duration-300">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover transition-all duration-500 transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FFBF00]/5 to-transparent -translate-y-full group-hover:animate-scanline pointer-events-none" />
              </div>

              {/* Text Info */}
              <h3 className="text-2xl font-black tracking-widest uppercase text-white mb-1 group-hover:text-[#FFBF00] transition-colors text-center">
                {member.name}
              </h3>
              <p className="text-[#FFBF00] font-mono text-sm tracking-widest uppercase mb-1 text-center font-bold">
                {member.role}
              </p>
              <div className="w-10 h-px bg-[#333] mt-3 group-hover:bg-[#FFBF00]/50 transition-colors" />
            </div>
          ))}
        </div>

        {/* =========================================
            MIDDLE ROW: CO-CONVENORS (Original Small Size: max-w-[280px])
        ========================================= */}
        <div className="flex flex-wrap justify-center gap-8 w-full mb-8">
          {coConvenorsRow1.map((member) => (
            <div 
              key={member.id} 
              className="w-full max-w-[280px] group relative bg-[#050505] border border-[#1A1A1A] p-6 flex flex-col items-center transition-all duration-500 hover:border-[#FFBF00]/50 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(255,191,0,0.1)]"
            >
              {/* HUD Corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#FFBF00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#FFBF00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#FFBF00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#FFBF00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Image Container */}
              <div className="w-full aspect-[4/5] mb-6 overflow-hidden relative border border-[#1A1A1A] group-hover:border-[#FFBF00]/30 transition-colors duration-300">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover transition-all duration-500 transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FFBF00]/5 to-transparent -translate-y-full group-hover:animate-scanline pointer-events-none" />
              </div>

              {/* Text Info */}
              <h3 className="text-xl font-black tracking-widest uppercase text-white mb-1 group-hover:text-[#FFBF00] transition-colors text-center">
                {member.name}
              </h3>
              <p className="text-[#FFBF00] font-mono text-xs tracking-widest uppercase mb-1 text-center">
                {member.role}
              </p>
              <div className="w-8 h-px bg-[#333] mt-3 group-hover:bg-[#FFBF00]/50 transition-colors" />
            </div>
          ))}
        </div>

        {/* =========================================
            BOTTOM ROW: CO-CONVENORS (Original Small Size: max-w-[280px])
        ========================================= */}
        <div className="flex flex-wrap justify-center gap-8 w-full">
          {coConvenorsRow2.map((member) => (
            <div 
              key={member.id} 
              className="w-full max-w-[280px] group relative bg-[#050505] border border-[#1A1A1A] p-6 flex flex-col items-center transition-all duration-500 hover:border-[#FFBF00]/50 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(255,191,0,0.1)]"
            >
              {/* HUD Corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#FFBF00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#FFBF00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#FFBF00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#FFBF00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Image Container */}
              <div className="w-full aspect-[4/5] mb-6 overflow-hidden relative border border-[#1A1A1A] group-hover:border-[#FFBF00]/30 transition-colors duration-300">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover transition-all duration-500 transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FFBF00]/5 to-transparent -translate-y-full group-hover:animate-scanline pointer-events-none" />
              </div>

              {/* Text Info */}
              <h3 className="text-xl font-black tracking-widest uppercase text-white mb-1 group-hover:text-[#FFBF00] transition-colors text-center">
                {member.name}
              </h3>
              <p className="text-[#FFBF00] font-mono text-xs tracking-widest uppercase mb-1 text-center">
                {member.role}
              </p>
              <div className="w-8 h-px bg-[#333] mt-3 group-hover:bg-[#FFBF00]/50 transition-colors" />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}