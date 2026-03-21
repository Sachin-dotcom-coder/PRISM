import React from 'react';
import { IGame } from '../types';

interface ScoreInputProps {
  game: IGame | undefined;
  updateScore: (updatedGame: IGame) => void;
}

export default function ScoreInput({ game, updateScore }: ScoreInputProps) {
  const current_game = game || { game_number: 1, team1_score: '', team2_score: '' };

  const handleTeam1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateScore({ ...current_game, team1_score: e.target.value === '' ? '' : Number(e.target.value) });
  };

  const handleTeam2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateScore({ ...current_game, team2_score: e.target.value === '' ? '' : Number(e.target.value) });
  };

  return (
    <div className="flex flex-col gap-4 bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
      <div className="flex justify-between items-center mb-2">
         <span className="text-[#FFBF00] font-bold text-sm tracking-widest uppercase">Final Match Score</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[#FFBF00] mb-1 font-bold">Team 1 Score</label>
          <input 
            type="number" 
            min="0"
            value={current_game.team1_score} 
            onChange={handleTeam1Change}
            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm focus:border-[#FFBF00] outline-none text-white transition-colors text-center text-xl font-bold font-mono"
            placeholder="0"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-[#FFBF00] mb-1 font-bold">Team 2 Score</label>
          <input 
            type="number" 
            min="0"
            value={current_game.team2_score} 
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
