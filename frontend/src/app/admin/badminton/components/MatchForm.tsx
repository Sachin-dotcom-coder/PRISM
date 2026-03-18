import React, { useState, useEffect } from 'react';
import { IBadmintonMatch, IGame } from '../types';
import GameInput from './GameInput';
import { Plus, Save, X } from 'lucide-react';
import { createMatch, updateMatch } from '../services/badmintonApi';

interface MatchFormProps {
  initialData?: IBadmintonMatch | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MatchForm({ initialData, onSuccess, onCancel }: MatchFormProps) {
  const [formData, setFormData] = useState<IBadmintonMatch>({
    match_id: Date.now() % 1000000,
    match_stage: '',
    team1_department: '',
    team2_department: '',
    match_date: new Date().toISOString().slice(0, 16),
    venue: '',
    games: [],
    total_games: 0,
    winner: '',
    match_status: 'scheduled',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        match_date: typeof initialData.match_date === 'string' 
          ? initialData.match_date.slice(0, 16) 
          : new Date(initialData.match_date).toISOString().slice(0, 16)
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateGame = (index: number, updatedGame: IGame) => {
    const newGames = [...formData.games];
    newGames[index] = updatedGame;
    setFormData(prev => ({ 
      ...prev, 
      games: newGames,
      total_games: newGames.length
    }));
  };

  const removeGame = (index: number) => {
    const newGames = formData.games.filter((_, i) => i !== index);
    newGames.forEach((g, i) => { g.game_number = i + 1; });
    setFormData(prev => ({ ...prev, games: newGames, total_games: newGames.length }));
  };

  const addGame = () => {
    const newGame: IGame = {
      game_number: formData.games.length + 1,
      team1_score: 0,
      team2_score: 0,
    };
    setFormData(prev => ({ 
      ...prev, 
      games: [...prev.games, newGame],
      total_games: prev.games.length + 1
    }));
  };

  const calculateWinner = () => {
    let t1Wins = 0;
    let t2Wins = 0;
    formData.games.forEach(g => {
      if (g.team1_score > g.team2_score) t1Wins++;
      else if (g.team2_score > g.team1_score) t2Wins++;
    });
    
    if (t1Wins > t2Wins) setFormData(prev => ({ ...prev, winner: prev.team1_department }));
    else if (t2Wins > t1Wins) setFormData(prev => ({ ...prev, winner: prev.team2_department }));
    else setFormData(prev => ({ ...prev, winner: 'Draw' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (formData.total_games !== formData.games.length) {
      setError("Total games count does not match the number of games listed.");
      setLoading(false);
      return;
    }

    try {
      if (initialData?._id || (initialData && initialData.match_id)) {
        await updateMatch(formData.match_id, formData);
      } else {
        await createMatch(formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[#FFBF00] font-bold text-lg">{initialData ? 'Edit Badminton Match' : 'Create New Badminton Match'}</h3>
        <button type="button" onClick={onCancel} className="text-zinc-500 hover:text-white"><X /></button>
      </div>

      {error && <div className="bg-red-500/20 text-red-500 p-3 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Match ID</label>
          <input required type="number" name="match_id" value={formData.match_id} onChange={handleChange} readOnly={!!initialData} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white opacity-70" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Match Stage</label>
          <input required type="text" name="match_stage" value={formData.match_stage} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white" placeholder="e.g. Quarter Finals" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Venue</label>
          <input required type="text" name="venue" value={formData.venue} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white" placeholder="e.g. Indoor Court 1" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Team 1 Dept</label>
          <input required type="text" name="team1_department" value={formData.team1_department} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white" placeholder="e.g. CS" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Team 2 Dept</label>
          <input required type="text" name="team2_department" value={formData.team2_department} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white" placeholder="e.g. MECH" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Match Date & Time</label>
          <input required type="datetime-local" name="match_date" value={String(formData.match_date)} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Match Status</label>
          <select required name="match_status" value={formData.match_status} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white">
            <option value="scheduled">Scheduled</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Winner</label>
          <div className="flex gap-2">
             <input type="text" name="winner" value={formData.winner || ''} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white" placeholder="Winner Dept" />
             <button type="button" onClick={calculateWinner} className="px-3 bg-zinc-700 text-xs rounded hover:bg-[#FFBF00] hover:text-black transition-colors" title="Auto-calculate Winner">Auto</button>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-zinc-300 font-bold tracking-widest text-sm uppercase">Games / Sets</h4>
          <button type="button" onClick={addGame} className="flex items-center gap-1 text-xs bg-[#FFBF00] text-black px-3 py-1.5 rounded font-bold hover:bg-yellow-500 transition-colors"><Plus className="w-4 h-4"/> Add Game</button>
        </div>
        <div className="space-y-3">
          {formData.games.length === 0 ? (
            <div className="text-center text-zinc-500 py-6 text-sm border border-dashed border-zinc-700 rounded-lg">No games added yet.</div>
          ) : (
            formData.games.map((game, idx) => (
              <GameInput key={idx} game={game} index={idx} updateGame={updateGame} removeGame={removeGame} />
            ))
          )}
        </div>
      </div>

      <div className="pt-6 border-t border-zinc-800 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg text-sm text-zinc-400 font-bold hover:text-white hover:bg-zinc-800 transition-colors">Cancel</button>
        <button type="submit" disabled={loading} className="px-6 py-2 rounded-lg text-sm bg-[#FFBF00] text-black font-bold hover:bg-yellow-500 transition-colors flex items-center gap-2">
          {loading ? 'Saving to MongoDB...' : <><Save className="w-4 h-4"/> Save Match Data</>}
        </button>
      </div>
    </form>
  );
}
