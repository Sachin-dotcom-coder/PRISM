import React from 'react';
import { IGame } from '../types';
import { Trash2 } from 'lucide-react';

interface GameInputProps {
  game: IGame;
  index: number;
  updateGame: (index: number, updatedGame: IGame) => void;
  removeGame: (index: number) => void;
}

export default function GameInput({ game, index, updateGame, removeGame }: GameInputProps) {
  return (
    <div className="flex flex-col gap-4 bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
      <div className="flex justify-between items-center mb-2">
         <span className="text-[#FFBF00] font-bold text-sm tracking-widest uppercase">Set {index + 1} (Tie ID: {game.tie_id})</span>
         <button 
           type="button" 
           onClick={() => removeGame(index)} 
           className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"
           title="Remove Set"
         >
           <Trash2 className="w-4 h-4" />
         </button>
      </div>
      
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
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-[#FFBF00] mb-1 font-bold">Dept 1 Score</label>
          <input 
            type="number" 
            min="0"
            value={game.score_dept1} 
            onChange={(e) => updateGame(index, { ...game, score_dept1: e.target.value === '' ? '' : Number(e.target.value) })}
            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm focus:border-[#FFBF00] outline-none text-white transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-[#FFBF00] mb-1 font-bold">Dept 2 Score</label>
          <input 
            type="number" 
            min="0"
            value={game.score_dept2} 
            onChange={(e) => updateGame(index, { ...game, score_dept2: e.target.value === '' ? '' : Number(e.target.value) })}
            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm focus:border-[#FFBF00] outline-none text-white transition-colors"
            required
          />
        </div>
      </div>
    </div>
  );
}
