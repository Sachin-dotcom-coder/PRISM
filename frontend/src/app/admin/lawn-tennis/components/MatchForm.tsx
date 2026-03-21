import React, { useState, useEffect } from 'react';
import { ILawnTennisMatch, IGame } from '../types';
import GameInput from './GameInput';
import { Plus, Save, X } from 'lucide-react';
import { createMatch, updateMatch } from '../services/lawnTennisApi';
import { useGender } from '@/app/components/Providers';

interface MatchFormProps {
  initialData?: ILawnTennisMatch | null;
  gender: "men" | "women";
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MatchForm({ initialData, gender, onSuccess, onCancel }: MatchFormProps) {

  const [formData, setFormData] = useState<ILawnTennisMatch>({
    match_id: `M${Date.now() % 1000000}`,
    match_type: 'singles',
    category: '',
    stage: '',
    dept_name1: '',
    dept_name2: '',
    games: [],
    winner_dept: '',
    status: 'completed',
    gender: gender
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData, winner_dept: initialData.winner_dept || '' });
    } else {
      setFormData(prev => ({ ...prev, gender }));
    }
  }, [initialData, gender]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateGame = (index: number, updatedGame: IGame) => {
    const newGames = [...formData.games];
    newGames[index] = updatedGame;
    setFormData(prev => ({ ...prev, games: newGames }));
  };

  const removeGame = (index: number) => {
    const newGames = formData.games.filter((_, i) => i !== index);
    newGames.forEach((g, i) => { g.tie_id = i + 1; });
    setFormData(prev => ({ ...prev, games: newGames }));
  };

  const addGame = () => {
    const newGame: IGame = {
      tie_id: formData.games.length + 1,
      score_dept1: 0,
      score_dept2: 0,
      status: "scheduled",
    };
    setFormData(prev => ({ ...prev, games: [...prev.games, newGame] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload = { ...formData, gender };
      delete payload._id;

      if (initialData?._id) {
        await updateMatch(initialData.match_id, payload);
      } else {
        await createMatch(payload);
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
        <h3 className="text-[#FFBF00] font-bold text-lg">{initialData ? 'Edit Lawn Tennis Match' : 'Create New Lawn Tennis Match'}</h3>
        <button type="button" onClick={onCancel} className="text-zinc-500 hover:text-white"><X /></button>
      </div>

      {error && <div className="bg-red-500/20 text-red-500 p-3 rounded font-mono text-sm whitespace-pre-wrap">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Match ID</label>
          <input required type="text" name="match_id" value={formData.match_id} onChange={handleChange} readOnly={!!initialData} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white opacity-70" />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Match Type</label>
          <select required name="match_type" value={formData.match_type} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white">
            <option value="singles">Singles</option>
            <option value="doubles">Doubles</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Category</label>
          <input required type="text" name="category" value={formData.category} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white" placeholder="e.g. Doubles, Open" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Dept Name 1</label>
          <input required type="text" name="dept_name1" value={formData.dept_name1} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white" placeholder="e.g. CS" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Dept Name 2</label>
          <input required type="text" name="dept_name2" value={formData.dept_name2} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white" placeholder="e.g. MECH" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Winner Dept</label>
          <input type="text" name="winner_dept" value={formData.winner_dept} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white" placeholder="e.g. CS" />
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-zinc-300 font-bold tracking-widest text-sm uppercase">Sets (Games)</h4>
          <button type="button" onClick={addGame} className="flex items-center gap-1 text-xs bg-[#FFBF00] text-black px-3 py-1.5 rounded font-bold hover:bg-yellow-500 transition-colors"><Plus className="w-4 h-4"/> Add Set</button>
        </div>
        <div className="space-y-3">
          {formData.games.length === 0 ? (
            <div className="text-center text-zinc-500 py-6 text-sm border border-dashed border-zinc-700 rounded-lg">No sets added yet.</div>
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
          {loading ? 'Saving...' : <><Save className="w-4 h-4"/> Save Match</>}
        </button>
      </div>
    </form>
  );
}
