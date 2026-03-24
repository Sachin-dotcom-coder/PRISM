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
  const winnerLabel =
    game.team1_score !== '' && game.team2_score !== ''
      ? game.winner || 'Draw'
      : 'Pending';

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
      <div className="flex-1">
        <label className="block text-xs text-zinc-400 mb-1">Game #</label>
        <input 
          type="number" 
          disabled 
          value={game.game_number} 
          className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-zinc-500 opacity-70" 
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs text-[#FFBF00] mb-1 font-bold">Match Type</label>
        <select
          value={game.match_type}
          onChange={(e) => updateGame(index, { ...game, match_type: e.target.value as "singles" | "doubles" })}
          className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm focus:border-[#FFBF00] outline-none text-white transition-colors"
        >
          <option value="singles">Singles</option>
          <option value="doubles">Doubles</option>
        </select>
      </div>
      <div className="flex-1">
        <label className="block text-xs text-[#FFBF00] mb-1 font-bold">Team 1 Score</label>
        <input 
          type="number" 
          min="0"
          value={game.team1_score} 
          onChange={(e) => updateGame(index, { ...game, team1_score: e.target.value === '' ? '' : Number(e.target.value) })}
          className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm focus:border-[#FFBF00] outline-none text-white transition-colors"
          required
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs text-[#FFBF00] mb-1 font-bold">Team 2 Score</label>
        <input 
          type="number" 
          min="0"
          value={game.team2_score} 
          onChange={(e) => updateGame(index, { ...game, team2_score: e.target.value === '' ? '' : Number(e.target.value) })}
          className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm focus:border-[#FFBF00] outline-none text-white transition-colors"
          required
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs text-zinc-400 mb-1">Winner</label>
        <div className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-white min-h-[42px] flex items-center justify-between">
          <span className="capitalize text-zinc-400">{game.match_type}</span>
          <span className="font-bold text-[#FFBF00]">{winnerLabel}</span>
        </div>
      </div>
      <button 
        type="button" 
        onClick={() => removeGame(index)} 
        className="md:mt-5 p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors h-fit self-end justify-self-start"
        title="Remove Game"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}
