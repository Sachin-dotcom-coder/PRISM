import React, { useState, useEffect } from 'react';
import { IBasketballMatch, IGame } from '../types';
import ScoreInput from './ScoreInput';
import { Save, X } from 'lucide-react';
import { createMatch, updateMatch } from '../services/basketballApi';
import { DEPARTMENT_OPTIONS } from '../../shared/departmentOptions';

interface MatchFormProps {
  initialData?: IBasketballMatch | null;
  gender: "men" | "women";
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MatchForm({ initialData, gender, onSuccess, onCancel }: MatchFormProps) {
  const [formData, setFormData] = useState<IBasketballMatch>({
    match_id: Date.now() % 1000000,
    match_stage: '',
    team1_department: DEPARTMENT_OPTIONS[0],
    team2_department: DEPARTMENT_OPTIONS[1],
    match_date: new Date().toISOString().slice(0, 16),
    games: [],
    total_games: 1,
    winner: '',
    match_status: 'scheduled',
    gender: gender
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        match_date: typeof initialData.match_date === 'string' 
          ? initialData.match_date.slice(0, 16) 
          : new Date(initialData.match_date || new Date()).toISOString().slice(0, 16)
      });
    } else {
      setFormData(prev => ({ ...prev, gender }));
    }
  }, [initialData, gender]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateScore = (updatedGame: IGame) => {
    setFormData(prev => ({ ...prev, games: [updatedGame] }));
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
        <h3 className="text-[#FFBF00] font-bold text-lg">{initialData ? 'Edit Basketball Match' : 'Create New Basketball Match'}</h3>
        <button type="button" onClick={onCancel} className="text-zinc-500 hover:text-white"><X /></button>
      </div>

      {error && <div className="bg-red-500/20 text-red-500 p-3 rounded text-sm font-mono whitespace-pre-wrap">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Match ID</label>
          <input required type="number" name="match_id" value={formData.match_id} onChange={handleChange} readOnly={!!initialData} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white opacity-70" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Match Stage</label>
          <input required type="text" name="match_stage" value={formData.match_stage} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white" placeholder="e.g. League, Semi Final" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Team 1 Dept</label>
          <select required name="team1_department" value={formData.team1_department} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white">
            {DEPARTMENT_OPTIONS.map((department) => <option key={department} value={department}>{department}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Team 2 Dept</label>
          <select required name="team2_department" value={formData.team2_department} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white">
            {DEPARTMENT_OPTIONS.map((department) => <option key={department} value={department}>{department}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Match Date & Time</label>
          <input type="datetime-local" name="match_date" value={String(formData.match_date)} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Gender Constraint</label>
          <input type="text" name="gender" value={gender} readOnly className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-zinc-500 opacity-70 uppercase tracking-widest font-bold" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Match Status</label>
          <select required name="match_status" value={formData.match_status} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white">
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <ScoreInput game={formData.games[0]} updateScore={updateScore} />
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
