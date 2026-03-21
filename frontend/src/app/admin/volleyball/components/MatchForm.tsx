import React, { useState, useEffect } from 'react';
import { IVolleyballMatch } from '../types';
import { Save, X } from 'lucide-react';
import { createMatch, updateMatch } from '../services/volleyballApi';

interface MatchFormProps {
  initialData?: IVolleyballMatch | null;
  gender: "men" | "women";
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MatchForm({ initialData, gender, onSuccess, onCancel }: MatchFormProps) {
  const [formData, setFormData] = useState<IVolleyballMatch>({
    match_id: Date.now() % 1000000,
    match_stage: '',
    team1_department: '',
    team2_department: '',
    match_date: new Date().toISOString().slice(0, 16),
    team1_score: '',
    team2_score: '',
    winner: '',
    match_status: 'completed',
    venue: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = { ...formData, gender };
      
      if (initialData?._id || (initialData && initialData.match_id)) {
        await updateMatch(formData.match_id, payload);
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
        <h3 className="text-[#FFBF00] font-bold text-lg">{initialData ? 'Edit Volleyball Match' : 'Create New Volleyball Match'}</h3>
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
          <input required type="text" name="team1_department" value={formData.team1_department} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white" placeholder="e.g. CS" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Team 2 Dept</label>
          <input required type="text" name="team2_department" value={formData.team2_department} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white" placeholder="e.g. MECH" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Match Date & Time</label>
          <input type="datetime-local" name="match_date" value={String(formData.match_date)} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white" />
        </div>

        <div className="md:col-span-1">
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Final Score (T1 - T2)</label>
          <div className="flex gap-2">
            <input required type="number" min="0" name="team1_score" value={formData.team1_score} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white text-center" placeholder="T1" />
            <span className="text-zinc-500 flex items-center">-</span>
            <input required type="number" min="0" name="team2_score" value={formData.team2_score} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white text-center" placeholder="T2" />
          </div>
        </div>

        <div className="md:col-span-1">
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Winner Dept (Final Result)</label>
          <input type="text" name="winner" value={formData.winner || ''} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white" placeholder="e.g. CS" />
        </div>
      </div>

      <div className="pt-6 border-t border-zinc-800 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg text-sm text-zinc-400 font-bold hover:text-white hover:bg-zinc-800 transition-colors">Cancel</button>
        <button type="submit" disabled={loading} className="px-6 py-2 rounded-lg text-sm bg-[#FFBF00] text-black font-bold hover:bg-yellow-500 transition-colors flex items-center gap-2">
          {loading ? 'Saving Match...' : <><Save className="w-4 h-4"/> Save Match Data</>}
        </button>
      </div>
    </form>
  );
}
