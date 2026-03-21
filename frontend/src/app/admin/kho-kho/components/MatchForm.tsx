import React, { useState, useEffect } from 'react';
import { IKhoKhoMatch } from '../types';
import { Save, X } from 'lucide-react';
import { createMatch, updateMatch } from '../services/khokhoApi';

interface MatchFormProps {
  initialData?: IKhoKhoMatch | null;
  gender: "men" | "women";
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MatchForm({ initialData, gender, onSuccess, onCancel }: MatchFormProps) {
  const [formData, setFormData] = useState<IKhoKhoMatch>({
    match_id: Math.floor(Date.now() % 1000000),
    match_stage: '',
    team1_department: '',
    team2_department: '',
    team1_score: '',
    team2_score: '',
    winner: '',
    match_status: 'completed',
    gender: gender
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({ 
        ...initialData, 
        winner: initialData.winner || '',
        team1_score: initialData.team1_score ?? '',
        team2_score: initialData.team2_score ?? ''
      });
    } else {
      setFormData(prev => ({ ...prev, gender }));
    }
  }, [initialData, gender]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'team1_score' || name === 'team2_score' || name === 'match_id') {
      const numValue = value === '' ? '' : parseInt(value, 10);
      setFormData(prev => ({ ...prev, [name]: Number.isNaN(numValue) ? '' : numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
        <h3 className="text-[#FFBF00] font-bold text-lg">{initialData ? 'Edit Kho-Kho Match' : 'Create New Kho-Kho Match'}</h3>
        <button type="button" onClick={onCancel} className="text-zinc-500 hover:text-white"><X /></button>
      </div>

      {error && <div className="bg-red-500/20 text-red-500 p-3 rounded font-mono text-sm whitespace-pre-wrap">{error}</div>}

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
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Dept Name 1</label>
          <input required type="text" name="team1_department" value={formData.team1_department} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white" placeholder="e.g. CS" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Dept Name 2</label>
          <input required type="text" name="team2_department" value={formData.team2_department} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white" placeholder="e.g. MECH" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Winner Dept</label>
          <input type="text" name="winner" value={formData.winner || ''} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white" placeholder="e.g. CS" />
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <h4 className="text-zinc-300 font-bold tracking-widest text-sm uppercase mb-4">Total Points</h4>
        
        <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="block text-xs font-semibold text-[#FFBF00] uppercase mb-1">Team 1 Points</label>
             <input type="number" name="team1_score" value={formData.team1_score} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-4 text-center text-3xl font-black focus:ring-2 focus:ring-[#FFBF00] outline-none text-white" placeholder="0" min="0"/>
           </div>

           <div>
             <label className="block text-xs font-semibold text-[#FFBF00] uppercase mb-1">Team 2 Points</label>
             <input type="number" name="team2_score" value={formData.team2_score} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-4 text-center text-3xl font-black focus:ring-2 focus:ring-[#FFBF00] outline-none text-white" placeholder="0" min="0"/>
           </div>
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
