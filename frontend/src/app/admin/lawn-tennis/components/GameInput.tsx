import React from 'react';
import { IGame } from '../types';

interface GameInputProps {
  game: IGame;
  index: number;
  updateGame: (index: number, updatedGame: IGame) => void;
  removeGame: (index: number) => void;
  dept1: string;
  dept2: string;
  format: string;
}

export default function GameInput({ game, index, updateGame, removeGame, dept1, dept2, format }: GameInputProps) {
  const formatLabels: Record<string, string> = {
    best_of_7: "Best of 7",
    best_of_9: "Best of 9",
    full_set: "Full Set"
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl relative overflow-hidden group/game">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/game:opacity-30 transition-opacity flex gap-2">
        <button 
          type="button" 
          onClick={() => removeGame(index)} 
          className="p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover/game:opacity-100 transition-all hover:bg-red-500 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
        <span className="text-[40px] font-black text-white italic select-none">#{index + 1}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Name Section */}
        <div className="md:col-span-1 space-y-2">
          <input 
            type="text" 
            value={game.game_name} 
            onChange={(e) => updateGame(index, { ...game, game_name: e.target.value })}
            className="bg-transparent text-[#FFBF00] font-black text-lg tracking-widest uppercase outline-none focus:border-b border-[#FFBF00]/30 w-full"
            placeholder="Game Name"
          />
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{formatLabels[format]}</div>
        </div>
        
        {/* Scores Section */}
        <div className="md:col-span-2 grid grid-cols-2 gap-6 items-end">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center truncate">{dept1}</label>
            <input 
              type="number" 
              placeholder="0"
              min="0"
              value={game.score_dept1} 
              onChange={(e) => updateGame(index, { ...game, score_dept1: e.target.value === '' ? '' : Number(e.target.value) })}
              className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-xl font-black text-center text-white focus:border-[#FFBF00] focus:ring-1 focus:ring-[#FFBF00] outline-none transition-all placeholder:text-zinc-800"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center truncate">{dept2}</label>
            <input 
              type="number" 
              placeholder="0"
              min="0"
              value={game.score_dept2} 
              onChange={(e) => updateGame(index, { ...game, score_dept2: e.target.value === '' ? '' : Number(e.target.value) })}
              className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-xl font-black text-center text-white focus:border-[#FFBF00] focus:ring-1 focus:ring-[#FFBF00] outline-none transition-all placeholder:text-zinc-800"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import { X } from 'lucide-react';
