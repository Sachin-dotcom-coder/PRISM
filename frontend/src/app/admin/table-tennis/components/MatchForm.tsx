import React, { useEffect, useState, useMemo } from 'react';
import { ITableTennisMatch, IGame } from '@/app/admin/table-tennis/types';
import GameInput from './GameInput';
import { Plus, Save, X } from 'lucide-react';
import { createMatch, updateMatch } from '../services/tableTennisApi';
import { DEPARTMENT_OPTIONS } from '../../shared/departmentOptions';

interface MatchFormProps {
  initialData?: ITableTennisMatch | null;
  gender: "men" | "women";
  onSuccess: () => void;
  onCancel: () => void;
}

const normalizeGames = (
  games: IGame[],
  team1Department: string,
  team2Department: string
): IGame[] =>
  games.map((game, index) => {
    const team1Score = game.team1_score === '' ? null : Number(game.team1_score);
    const team2Score = game.team2_score === '' ? null : Number(game.team2_score);

    let winner: string | null = null;
    if (team1Score !== null && team2Score !== null) {
      if (team1Score > team2Score) winner = team1Department;
      else if (team2Score > team1Score) winner = team2Department;
    }

    return {
      ...game,
      game_number: index + 1,
      match_type: game.match_type || 'singles',
      winner,
    };
  });

export default function MatchForm({ initialData, gender, onSuccess, onCancel }: MatchFormProps) {
  const [formData, setFormData] = useState<ITableTennisMatch>({
    match_id: Date.now() % 1000000,
    match_stage: '',
    team1_department: DEPARTMENT_OPTIONS[0],
    team2_department: DEPARTMENT_OPTIONS[1],
    match_date: new Date().toISOString().slice(0, 16),
    team1_score: 0,
    team2_score: 0,
    games: [],
    total_games: 0,
    winner: '',
    match_status: 'completed',
    match_type: 'singles',
    gender: gender
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ FIX: Calculate derived data during render instead of a second useEffect to prevent infinite loops
  const derivedData = useMemo(() => {
    const normalized = normalizeGames(formData.games, formData.team1_department, formData.team2_department);
    const team1Wins = normalized.filter((game) => game.winner === formData.team1_department).length;
    const team2Wins = normalized.filter((game) => game.winner === formData.team2_department).length;
    const calculatedWinner = team1Wins > team2Wins
      ? formData.team1_department
      : team2Wins > team1Wins
        ? formData.team2_department
        : '';

    return {
      normalizedGames: normalized,
      team1Wins,
      team2Wins,
      calculatedWinner
    };
  }, [formData.games, formData.team1_department, formData.team2_department]);

  useEffect(() => {
    if (initialData) {
      const games = normalizeGames(
        (initialData.games || []).map((game, index) => ({
          ...game,
          game_number: game.game_number || index + 1,
          match_type: game.match_type || initialData.match_type || 'singles',
          winner: game.winner || null,
        })),
        initialData.team1_department,
        initialData.team2_department
      );

      const team1Wins = games.filter((game) => game.winner === initialData.team1_department).length;
      const team2Wins = games.filter((game) => game.winner === initialData.team2_department).length;

      setFormData({
        ...initialData,
        match_date: typeof initialData.match_date === 'string'
          ? initialData.match_date.slice(0, 16)
          : new Date(initialData.match_date).toISOString().slice(0, 16),
        games,
        total_games: games.length,
        team1_score: team1Wins,
        team2_score: team2Wins,
        winner: team1Wins > team2Wins
          ? initialData.team1_department
          : team2Wins > team1Wins
            ? initialData.team2_department
            : '',
      });
    } else {
      setFormData((prev) => ({ ...prev, gender }));
    }
  }, [initialData, gender]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateGame = (index: number, updatedGame: IGame) => {
    const newGames = [...formData.games];
    newGames[index] = updatedGame;
    setFormData((prev) => ({
      ...prev,
      games: newGames,
      total_games: newGames.length
    }));
  };

  const removeGame = (index: number) => {
    const newGames = formData.games.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, games: newGames, total_games: newGames.length }));
  };

  const addGame = () => {
    const newGame: IGame = {
      game_number: formData.games.length + 1,
      match_type: 'singles',
      sets: [],
      team1_score: '',
      team2_score: '',
      winner: null,
    };
    setFormData((prev) => ({
      ...prev,
      games: [...prev.games, newGame],
      total_games: prev.games.length + 1
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        gender,
        games: derivedData.normalizedGames.map((game, index) => ({
          game_number: index + 1,
          match_type: game.match_type,
          sets: game.sets || [],
          team1_score: Number(game.team1_score),
          team2_score: Number(game.team2_score),
          winner: game.winner || null,
        })),
        team1_score: Number(derivedData.team1Wins || 0),
        team2_score: Number(derivedData.team2Wins || 0),
        total_games: formData.games.length,
        winner: derivedData.calculatedWinner || null,
      };

      if (initialData?._id || (initialData && initialData.match_id)) {
        await updateMatch(formData.match_id, payload);
      } else {
        await createMatch(payload);
      }
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[#FFBF00] font-bold text-lg">{initialData ? 'Edit table tennis match' : 'Create New table tennis match'}</h3>
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
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Match Date & Time</label>
          <input required type="datetime-local" name="match_date" value={String(formData.match_date)} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white" />
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
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Overall Winner</label>
          <div className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-white font-bold">
            {derivedData.calculatedWinner || 'No overall winner yet'}
            <div className="text-[10px] text-zinc-500 mt-1">Auto-calculated from games won</div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Match Score</label>
          <div className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-white text-center font-bold">
            {derivedData.team1Wins || 0} - {derivedData.team2Wins || 0}
            <div className="text-[10px] text-zinc-500 mt-1">Games won by each department</div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Winner</label>
          <div className="flex gap-2">
            <select name="winner" value={formData.winner || ''} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white">
              {DEPARTMENT_OPTIONS.map((department) => <option key={department} value={department}>{department}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Status</label>
          <select 
            required 
            name="match_status" 
            value={formData.match_status} 
            onChange={handleChange} 
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none text-white"
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="text-zinc-300 font-bold tracking-widest text-sm uppercase">Games / Sets</h4>
            <p className="text-[11px] text-zinc-500 mt-1">Choose Singles or Doubles for each game separately.</p>
          </div>
          <button type="button" onClick={addGame} className="flex items-center gap-1 text-xs bg-[#FFBF00] text-black px-3 py-1.5 rounded font-bold hover:bg-yellow-500 transition-colors"><Plus className="w-4 h-4" /> Add Game</button>
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
          {loading ? 'Saving to MongoDB...' : <><Save className="w-4 h-4" /> Save Match Data</>}
        </button>
      </div>
    </form>
  );
}