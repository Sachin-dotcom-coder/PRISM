/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { IVolleyballMatch, IGame } from '../types';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { createMatch, updateMatch } from '../services/volleyballApi';

interface MatchFormProps {
  initialData?: IVolleyballMatch | null;
  gender: "men" | "women";
  onSuccess: () => void;
  onCancel: () => void;
}

const STAGES = ['league', 'quarter-final', 'semi-final', 'grand_finale'];

const emptyForm = (gender: "men" | "women"): IVolleyballMatch => ({
  match_id: Date.now() % 1000000,
  match_stage: 'league',
  team1_department: '',
  team2_department: '',
  match_date: new Date().toISOString().slice(0, 16),
  venue: '',
  team1_score: '',
  team2_score: '',
  winner: '',
  match_status: 'scheduled',
  games: [],
  total_games: 0,
  gender,
});

export default function MatchForm({ initialData, gender, onSuccess, onCancel }: MatchFormProps) {
  const [formData, setFormData] = useState<IVolleyballMatch>(emptyForm(gender));
  const [sets, setSets] = useState<IGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        match_date: typeof initialData.match_date === 'string'
          ? initialData.match_date.slice(0, 16)
          : new Date(initialData.match_date || new Date()).toISOString().slice(0, 16),
      });
      setSets(initialData.games?.length ? [...initialData.games] : []);
    } else {
      setFormData(emptyForm(gender));
      setSets([]);
    }
  }, [initialData, gender]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addSet = () => {
    setSets(prev => [...prev, { game_number: prev.length + 1, team1_score: 0, team2_score: 0 }]);
  };

  const removeSet = (idx: number) => {
    setSets(prev => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, game_number: i + 1 })));
  };

  const updateSet = (idx: number, field: 'team1_score' | 'team2_score', val: string) => {
    setSets(prev => prev.map((s, i) => i === idx ? { ...s, [field]: Number(val) || 0 } : s));
  };

  // Compute set scores from games
  const computeSetCounts = () => {
    let t1 = 0, t2 = 0;
    sets.forEach(s => {
      if (s.team1_score > s.team2_score) t1++;
      else if (s.team2_score > s.team1_score) t2++;
    });
    return { t1, t2 };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { t1, t2 } = computeSetCounts();
      const payload = {
        ...formData,
        gender,
        games: sets,
        total_games: sets.length,
        team1_score: t1,
        team2_score: t2,
        winner: formData.winner || null,
      };
      if (initialData) {
        await updateMatch(formData.match_id, payload);
      } else {
        await createMatch(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white";
  const labelCls = "block text-[10px] font-black text-zinc-500 uppercase mb-1 tracking-widest";

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-950/60 p-6 rounded-2xl border border-zinc-800 space-y-6 backdrop-blur-xl">
      <div className="flex justify-between items-center">
        <h3 className="text-[#FFBF00] font-black text-lg tracking-widest uppercase">
          {initialData ? 'Edit Volleyball Match' : 'Create Volleyball Match'}
        </h3>
        <button type="button" onClick={onCancel} className="text-zinc-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm font-mono">{error}</div>}

      {/* ── Core Fields ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Match ID</label>
          <input required type="number" name="match_id" value={formData.match_id} onChange={handleChange}
            readOnly={!!initialData} className={`${inputCls} ${initialData ? 'opacity-50 cursor-not-allowed' : ''}`} />
        </div>

        <div>
          <label className={labelCls}>Stage</label>
          <select required name="match_stage" value={formData.match_stage} onChange={handleChange} className={inputCls}>
            {STAGES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Status</label>
          <select name="match_status" value={formData.match_status} onChange={handleChange} className={inputCls}>
            <option value="scheduled">Scheduled</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Team 1 Department</label>
          <input required type="text" name="team1_department" value={formData.team1_department}
            onChange={handleChange} className={inputCls} placeholder="e.g. CS" />
        </div>

        <div>
          <label className={labelCls}>Team 2 Department</label>
          <input required type="text" name="team2_department" value={formData.team2_department}
            onChange={handleChange} className={inputCls} placeholder="e.g. MECH" />
        </div>

        <div>
          <label className={labelCls}>Winner (leave blank if ongoing)</label>
          <input type="text" name="winner" value={formData.winner || ''} onChange={handleChange}
            className={inputCls} placeholder="e.g. CS" />
        </div>

        <div>
          <label className={labelCls}>Venue</label>
          <input type="text" name="venue" value={formData.venue || ''} onChange={handleChange}
            className={inputCls} placeholder="e.g. Main Court" />
        </div>

        <div>
          <label className={labelCls}>Match Date & Time</label>
          <input type="datetime-local" name="match_date" value={String(formData.match_date)}
            onChange={handleChange} className={inputCls} />
        </div>
      </div>

      {/* ── Set Scorecard ── */}
      <div className="border-t border-zinc-800 pt-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            Set Scorecard ({sets.length} set{sets.length !== 1 ? 's' : ''})
          </span>
          <button type="button" onClick={addSet}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-zinc-800 hover:bg-[#FFBF00] hover:text-black text-zinc-300 rounded-lg font-bold transition-all">
            <Plus className="w-3.5 h-3.5" /> Add Set
          </button>
        </div>

        {sets.length === 0 ? (
          <p className="text-zinc-600 text-xs italic text-center py-4">No sets added yet. Click &quot;Add Set&quot; to enter set scores.</p>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-[3rem_1fr_2rem_1fr_2rem] gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">
              <span className="text-center">Set</span>
              <span className="text-center">{formData.team1_department || 'Team 1'}</span>
              <span />
              <span className="text-center">{formData.team2_department || 'Team 2'}</span>
              <span />
            </div>
            {sets.map((set, idx) => (
              <div key={idx} className="grid grid-cols-[3rem_1fr_2rem_1fr_2rem] gap-2 items-center">
                <span className="text-center text-zinc-400 text-xs font-bold">{set.game_number}</span>
                <input
                  type="number" min="0"
                  value={set.team1_score}
                  onChange={e => updateSet(idx, 'team1_score', e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-center text-sm text-white outline-none focus:border-[#FFBF00]"
                />
                <span className="text-center text-zinc-500 text-xs">-</span>
                <input
                  type="number" min="0"
                  value={set.team2_score}
                  onChange={e => updateSet(idx, 'team2_score', e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-center text-sm text-white outline-none focus:border-[#FFBF00]"
                />
                <button type="button" onClick={() => removeSet(idx)}
                  className="flex items-center justify-center text-zinc-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Set tally */}
            {sets.length > 0 && (() => {
              const { t1, t2 } = computeSetCounts();
              return (
                <div className="mt-2 p-3 bg-zinc-900/60 rounded-xl flex items-center justify-center gap-4 text-sm font-black">
                  <span className="text-white">{formData.team1_department || 'T1'}</span>
                  <span className="text-2xl text-[#FFBF00]">{t1}</span>
                  <span className="text-zinc-500">–</span>
                  <span className="text-2xl text-[#FFBF00]">{t2}</span>
                  <span className="text-white">{formData.team2_department || 'T2'}</span>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
        <button type="button" onClick={onCancel}
          className="px-6 py-2 rounded-lg text-sm text-zinc-400 font-bold hover:text-white hover:bg-zinc-800 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="px-6 py-2 rounded-lg text-sm bg-[#FFBF00] text-black font-[900] hover:bg-yellow-500 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(255,191,0,0.3)]">
          {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Match</>}
        </button>
      </div>
    </form>
  );
}
