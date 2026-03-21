import React from 'react';
import { IGame } from '../types';
import { Trash2 } from 'lucide-react';

interface SetInputProps {
  game: IGame;
  index: number;
  updateGame: (index: number, updatedGame: IGame) => void;
  removeGame: (index: number) => void;
}

export default function SetInput({ game, index, updateGame, removeGame }: SetInputProps) {
  const handleTeam1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateGame(index, { ...game, team1_score: e.target.value === '' ? '' : Number(e.target.value) });
  };

  const handleTeam2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateGame(index, { ...game, team2_score: e.target.value === '' ? '' : Number(e.target.value) });
  };

  return (
    <div className="flex flex-col gap-4 bg-zinc-800/50 p-4 rounded-lg border border-zinc-700 relative group transition-all hover:bg-zinc-800/80">
      <div className="flex justify-between items-center mb-1">
         <span className="text-[#FFBF00] font-bold text-sm tracking-widest uppercase">Set {game.game_number}</span>
         <button 
           type="button" 
           onClick={() => removeGame(index)} 
           className="text-zinc-500 hover:text-red-500 transition-colors p-1"
           title="Remove Set"
         >
           <Trash2 className="w-4 h-4" />
         </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-zinc-400 mb-1 font-semibold uppercase">Team 1 Score</label>
          <input 
            type="number" 
            min="0"
            value={game.team1_score} 
            onChange={handleTeam1Change}
            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm focus:border-[#FFBF00] outline-none text-white transition-colors text-center text-xl font-bold font-mono"
            placeholder="0"
            required
          />
        </div>

        <div>
           <label className="block text-xs text-zinc-400 mb-1 font-semibold uppercase">Team 2 Score</label>
          <input 
            type="number" 
            min="0"
            value={game.team2_score} 
            onChange={handleTeam2Change}
            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm focus:border-[#FFBF00] outline-none text-white transition-colors text-center text-xl font-bold font-mono"
            placeholder="0"
            required
          />
        </div>
      </div>
    </div>
  );
}
