import React from 'react';
import { IGame } from '../types';
import { Trash2 } from 'lucide-react';

interface GameInputProps {
  game: IGame;
  index: number;
  updateGame: (index: number, updatedGame: IGame) => void;
  dept1: string;
  dept2: string;
  format: string;
}

export default function GameInput({ game, index, updateGame, dept1, dept2, format }: GameInputProps) {
  const formatLabels: Record<string, string> = {
    best_of_7: "Best of 7",
    best_of_9: "Best of 9",
    full_set: "Full Set"
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl relative overflow-hidden group/game">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/game:opacity-30 transition-opacity">
        <span className="text-[40px] font-black text-white italic select-none">#{index + 1}</span>
      </div>
<<<<<<< Updated upstream
=======
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Status</label>
          <select 
            value={game.status} 
            onChange={(e) => updateGame(index, { ...game, status: e.target.value as any })}
            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-white focus:border-[#FFBF00] outline-none" 
            required
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
>>>>>>> Stashed changes

      <div className="flex flex-col md:flex-row md:items-center gap-6 relative">
        <div className="min-w-[140px]">
          <h5 className="text-[#FFBF00] font-black text-sm tracking-widest uppercase">{game.game_name}</h5>
          <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{formatLabels[format]}</div>
        </div>
        
        <div className="flex-1 grid grid-cols-2 gap-8 items-end">
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
