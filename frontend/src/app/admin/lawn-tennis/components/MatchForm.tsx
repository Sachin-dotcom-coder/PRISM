import React, { useState, useEffect } from 'react';
import { ILawnTennisMatch, IGame } from '../types';
import GameInput from './GameInput';
import { Plus, Save, X, Trophy } from 'lucide-react';
import { createMatch, updateMatch } from '../services/lawnTennisApi';
import { DEPARTMENT_OPTIONS } from '../../shared/departmentOptions';

interface MatchFormProps {
  initialData?: ILawnTennisMatch | null;
  gender: "men" | "women";
  onSuccess: () => void;
  onCancel: () => void;
}

const DEFAULT_GAMES: IGame[] = [
  { tie_id: 1, game_name: "Singles 1", score_dept1: '', score_dept2: '' },
  { tie_id: 2, game_name: "Singles 2", score_dept1: '', score_dept2: '' },
  { tie_id: 3, game_name: "Doubles (Decider)", score_dept1: '', score_dept2: '' },
];

export default function MatchForm({ initialData, gender, onSuccess, onCancel }: MatchFormProps) {

  const [formData, setFormData] = useState<ILawnTennisMatch>({
    match_id: `M${Date.now() % 1000000}`,
    match_type: 'singles',
    category: 'boys',
    stage: 'league',
    dept_name1: DEPARTMENT_OPTIONS[0],
    dept_name2: DEPARTMENT_OPTIONS[1],
    series_format: 'best_of_7',
    games: DEFAULT_GAMES,
    winner_dept: '',
    status: 'scheduled',
    gender: gender
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-calculate winner
  useEffect(() => {
    const calculateWinner = () => {
      let dept1Wins = 0;
      let dept2Wins = 0;
      let allGamesPlayed = true;

      const formatThresholds = {
        best_of_7: 4,
        best_of_9: 5,
        full_set: 6
      };

      const threshold = formatThresholds[formData.series_format];

      formData.games.forEach(game => {
        const s1 = Number(game.score_dept1);
        const s2 = Number(game.score_dept2);
        
        if (game.score_dept1 === '' || game.score_dept2 === '') {
          allGamesPlayed = false;
          return;
        }

        if (s1 >= threshold || s2 >= threshold) {
           if (s1 > s2) dept1Wins++;
           else if (s2 > s1) dept2Wins++;
        } else {
          // If neither reached threshold, it's not "complete" or a winner isn't clear
          // But for best of 7, 4 wins is the goal.
          // If the score is 3-3, it's a draw/ongoing.
        }
      });

      if (dept1Wins >= 2) return formData.dept_name1;
      if (dept2Wins >= 2) return formData.dept_name2;
      return '';
    };

    const calculatedWinner = calculateWinner();
    if (calculatedWinner !== formData.winner_dept) {
      setFormData(prev => ({ ...prev, winner_dept: calculatedWinner }));
    }
  }, [formData.games, formData.series_format, formData.dept_name1, formData.dept_name2, formData.winner_dept]);

  useEffect(() => {
    if (initialData) {
      setFormData({ 
        ...initialData, 
        winner_dept: initialData.winner_dept || '',
        games: initialData.games && initialData.games.length > 0 ? initialData.games : DEFAULT_GAMES
      });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload = { ...formData, gender };
      delete payload._id;

      if (initialData && initialData.match_id) {
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
    <form onSubmit={handleSubmit} className="bg-zinc-950/80 p-6 md:p-8 rounded-3xl border border-zinc-800 space-y-8 backdrop-blur-xl shadow-2xl overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFBF00]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div className="flex justify-between items-center relative">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-[#FFBF00] rounded-full shadow-[0_0_15px_rgba(255,191,0,0.5)]" />
          <div>
            <h3 className="text-white font-[900] text-xl tracking-widest uppercase">{initialData ? 'Edit Match Scores' : 'Register New Tie'}</h3>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">Lawn Tennis — Laver Cup Format</p>
          </div>
        </div>
        <button type="button" onClick={onCancel} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-all"><X className="w-5 h-5"/></button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl font-mono text-xs animate-shake">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        <div>
          <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2 tracking-[0.2em]">Match Identifier</label>
          <input required type="text" name="match_id" value={formData.match_id} onChange={handleChange} readOnly={!!initialData} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-sm focus:ring-1 focus:ring-[#FFBF00] border-zinc-700 outline-none text-white opacity-70 font-mono" />
        </div>
        
        <div>
          <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2 tracking-[0.2em]">Series Format</label>
          <select required name="series_format" value={formData.series_format} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white font-bold transition-all cursor-pointer hover:border-zinc-700">
            <option value="best_of_7">Best of 7 Games</option>
            <option value="best_of_9">Best of 9 Games</option>
            <option value="full_set">Full Set (6 Games)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2 tracking-[0.2em]">Category</label>
          <select required name="category" value={formData.category} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white font-bold cursor-pointer">
            <option value="boys">Boys (Men)</option>
            <option value="girls">Girls (Women)</option>
          </select>
        </div>

        <div>
           <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2 tracking-[0.2em]">Event Stage</label>
           <select required name="stage" value={formData.stage} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white font-bold cursor-pointer">
             <option value="league">League</option>
             <option value="quarter_final">Quarter Final</option>
             <option value="semi_final">Semi Final</option>
             <option value="final">Final</option>
           </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2 tracking-[0.2em]">Department A</label>
          <select required name="dept_name1" value={formData.dept_name1} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white font-black tracking-widest">
            {DEPARTMENT_OPTIONS.map((department) => <option key={department} value={department}>{department}</option>)}
          </select>
        </div>

<<<<<<< Updated upstream
        <div className="md:col-span-2">
          <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2 tracking-[0.2em]">Department B</label>
          <select required name="dept_name2" value={formData.dept_name2} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white font-black tracking-widest">
=======
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Status</label>
          <select required name="status" value={formData.status} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white">
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Dept Name 1</label>
          <select required name="dept_name1" value={formData.dept_name1} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white">
>>>>>>> Stashed changes
            {DEPARTMENT_OPTIONS.map((department) => <option key={department} value={department}>{department}</option>)}
          </select>
        </div>

        <div>
           <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2 tracking-[0.2em]">Match Status</label>
           <select required name="status" value={formData.status} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white font-bold">
             <option value="scheduled">Scheduled</option>
             <option value="completed">Completed</option>
           </select>
        </div>

        <div className="lg:col-span-3">
          <label className="block text-[10px] font-black text-[#FFBF00] uppercase mb-2 tracking-[0.2em]">Tie Winner (Automated)</label>
          <div className="relative">
            <select name="winner_dept" value={formData.winner_dept} onChange={handleChange} className="w-full bg-zinc-900 border border-[#FFBF00]/30 rounded-xl p-3.5 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-[#FFBF00] font-[900] tracking-widest appearance-none cursor-default">
              <option value="">— Winner pending —</option>
              {DEPARTMENT_OPTIONS.map((department) => <option key={department} value={department}>{department}</option>)}
            </select>
            <Trophy className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFBF00]" />
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-zinc-800 space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="text-zinc-500 font-black tracking-[0.3em] text-[10px] uppercase">Match Components (Best of 3)</h4>
          <div className="px-3 py-1 bg-zinc-900 rounded-full text-[9px] text-zinc-500 font-bold border border-zinc-800 uppercase tracking-tighter">Fixed Slots</div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {formData.games.map((game, idx) => (
            <GameInput 
              key={idx} 
              game={game} 
              index={idx} 
              updateGame={updateGame}
              dept1={formData.dept_name1}
              dept2={formData.dept_name2}
              format={formData.series_format}
            />
          ))}
        </div>
      </div>

      <div className="pt-8 border-t border-zinc-800 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-8 py-3 rounded-xl text-sm text-zinc-500 font-black uppercase tracking-widest hover:text-white hover:bg-zinc-900 transition-all">Discard</button>
        <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl text-sm bg-[#FFBF00] text-black font-[900] uppercase tracking-widest hover:bg-yellow-500 transition-all flex items-center gap-2 shadow-[0_5px_20px_rgba(255,191,0,0.2)] disabled:opacity-50">
          {loading ? 'Committing...' : <><Save className="w-4 h-4"/> Save CMS Data</>}
        </button>
      </div>
    </form>
  );
}
