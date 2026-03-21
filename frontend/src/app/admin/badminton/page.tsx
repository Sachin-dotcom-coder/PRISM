"use client";

import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, RefreshCw, Pencil, Trash2, Activity } from 'lucide-react';
import Link from 'next/link';
import MatchForm from './components/MatchForm';
import { IBadmintonMatch } from './types';
import { getMatches, deleteMatch } from './services/badmintonApi';
import { useGender } from '@/app/components/Providers';

export default function BadmintonAdminPage() {
  const { gender: globalGender } = useGender();
  const gender = globalGender === "f" ? "women" : "men";
  
  const [matches, setMatches] = useState<IBadmintonMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<IBadmintonMatch | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getMatches(gender);
      const data = Array.isArray(response) ? response : (response as any).data || [];
      if (!Array.isArray(data)) throw new Error("Invalid response format");
      setMatches(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load matches from backend API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [gender]);

  const handleAddNew = () => {
    setEditingMatch(null);
    setShowForm(true);
  };

  const handleEdit = (match: IBadmintonMatch) => {
    setEditingMatch(match);
    setShowForm(true);
  };

  const handleDelete = async (match_id: number) => {
    if (!confirm('Are you sure you want to delete this match entirely from the database?')) return;
    try {
      await deleteMatch(match_id);
      fetchMatches();
    } catch (err: any) {
      alert(err.message || 'Deletion failed');
    }
  };

  const onFormSuccess = () => {
    setShowForm(false);
    fetchMatches();
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-20 min-h-screen bg-black text-white">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-[#FFBF00]/20 flex items-center justify-center text-[#FFBF00]">
                <Activity className="w-5 h-5" />
             </div>
             <h1 className="text-3xl font-[900] tracking-widest text-[#FFBF00] uppercase">Badminton CMS</h1>
          </div>
        </div>
        
        {!showForm && (
          <div className="flex gap-3">
            <button onClick={fetchMatches} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white rounded-lg text-sm font-bold transition-all">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh API
            </button>
            <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-[#FFBF00] hover:bg-yellow-500 text-black rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(255,191,0,0.4)]">
              <Plus className="w-4 h-4" /> Create Match
            </button>
          </div>
        )}
      </div>

      {showForm ? (
        <MatchForm 
          initialData={editingMatch} 
          gender={gender}
          onSuccess={onFormSuccess} 
          onCancel={() => setShowForm(false)} 
        />
      ) : (
        <div className="bg-zinc-950/50 rounded-3xl border border-zinc-800 overflow-hidden backdrop-blur-xl">
          {error && <div className="bg-red-500/10 text-red-500 p-4 font-semibold text-center">{error}</div>}
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">Departments</th>
                  <th className="text-left p-4">Stage & Venue</th>
                  <th className="text-center p-4">Date</th>
                  <th className="text-center p-4">Games</th>
                  <th className="text-center p-4">Status</th>
                  <th className="text-center p-4">Winner</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {loading && matches.length === 0 ? (
                  <tr><td colSpan={8} className="p-10 text-center text-[#FFBF00] font-bold animate-pulse">Fetching MongoDB Data...</td></tr>
                ) : matches.length === 0 ? (
                  <tr><td colSpan={8} className="p-10 text-center text-zinc-500">No badminton matches found in database. Create one.</td></tr>
                ) : (
                  matches.map((match) => (
                    <tr key={match.match_id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-4 text-zinc-500 font-mono">{match.match_id}</td>
                      <td className="p-4">
                        <span className="font-[900] text-white tracking-widest">{match.team1_department}</span>
                        <span className="text-[#FFBF00] mx-2 text-xs font-bold font-mono">VS</span>
                        <span className="font-[900] text-white tracking-widest">{match.team2_department}</span>
                      </td>
                      <td className="p-4">
                        <div className="text-white font-bold">{match.match_stage}</div>
                        <div className="text-zinc-500 text-xs tracking-wider">{match.venue}</div>
                      </td>
                      <td className="p-4 text-center text-zinc-400 text-xs">
                        {new Date(match.match_date).toLocaleString()}
                      </td>
                      <td className="p-4 text-center font-mono text-zinc-300 font-bold bg-zinc-900/30">
                        <span className="text-[#FFBF00] text-lg glow-text mx-2 tracking-widest">{match.team1_score ?? '-'}</span>
                         - 
                        <span className="text-[#FFBF00] text-lg glow-text mx-2 tracking-widest">{match.team2_score ?? '-'}</span>
                        <div className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">({match.total_games} Sets)</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 text-[10px] uppercase font-[900] tracking-widest rounded border ${
                          match.match_status === 'scheduled' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                          match.match_status === 'ongoing' ? 'border-[#FFBF00]/30 text-[#FFBF00] bg-[#FFBF00]/10 shadow-[0_0_8px_rgba(255,191,0,0.5)]' :
                          'border-green-500/30 text-green-400 bg-green-500/10'
                        }`}>
                          {match.match_status}
                        </span>
                      </td>
                      <td className="p-4 text-center font-[900] text-white tracking-widest">{match.winner || '-'}</td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleEdit(match)} className="p-2 rounded bg-zinc-800 hover:bg-[#FFBF00] transition-all text-zinc-400 hover:text-black shadow-md"><Pencil className="w-4 h-4"/></button>
                          <button onClick={() => handleDelete(match.match_id)} className="p-2 rounded bg-zinc-800 hover:bg-red-600 transition-all text-zinc-400 hover:text-white shadow-md"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
