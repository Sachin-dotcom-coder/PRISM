"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Medal, Pencil, Plus, RefreshCw, Save, Trash2, Trophy, Check, X } from "lucide-react";
import { useGender } from "@/app/components/Providers";
import { DEPARTMENT_OPTIONS } from "../shared/departmentOptions";
import { createEvent, deleteEvent, getEvent, getEvents, updateEvent } from "./services/armWrestlingApi";
import {
  ARM_WRESTLING_CATEGORY_OPTIONS,
  ArmWrestlingGender,
  IArmWrestlingEvent
} from "./types";

interface ArmWrestlingLeaderboardEntry {
  _id?: string;
  leaderboard_id: number;
  dept_name: string;
  category: 'boys' | 'girls';
  group: string;
  wins?: number;
  losses?: number;
  matches?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
const LB_API = `${BASE_URL}/armwrestling-leaderboard`;

const RANK_COLORS = [
  "text-yellow-400 font-black",
  "text-zinc-300 font-black",
  "text-amber-600 font-black",
];

function ArmWrestlingTeamRow({ team, rank, onUpdate, onDelete }: { team: ArmWrestlingLeaderboardEntry; rank: number; onUpdate: (t: ArmWrestlingLeaderboardEntry) => void; onDelete: () => void; }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...team });

  useEffect(() => { if (!editing) setDraft({ ...team }); }, [team, editing]);

  const save = () => { onUpdate(draft); setEditing(false); };

  if (!editing)
    return (
      <tr className="border-b border-zinc-800/50 hover:bg-zinc-900/20 transition-colors">
        <td className={`p-3 text-center w-10 text-sm ${RANK_COLORS[rank] ?? "text-zinc-500"}`}>{rank + 1}</td>
        <td className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FFBF00]/10 border border-[#FFBF00]/20 flex items-center justify-center text-[10px] font-black text-[#FFBF00]">
              {team.dept_name.slice(0, 2).toUpperCase()}
            </div>
            <span className="font-[900] text-white tracking-widest text-sm">{team.dept_name}</span>
          </div>
        </td>
        <td className="p-3 text-center text-zinc-400 text-xs font-mono font-bold">{team.group}</td>
        <td className="p-3 text-center text-zinc-300 text-sm">{team.matches ?? 0}</td>
        <td className="p-3 text-center text-green-400 text-sm font-black">{team.wins ?? 0}</td>
        <td className="p-3 text-center text-red-400 text-sm">{team.losses ?? 0}</td>
        <td className="p-3">
          <div className="flex gap-1 justify-end">
            <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-[#FFBF00] hover:text-black transition-all text-zinc-400">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-700 hover:text-white transition-all text-zinc-400">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
    );

  return (
    <tr className="border-b border-[#FFBF00]/20 bg-[#FFBF00]/5">
      <td className="p-2 text-center text-zinc-500 text-sm">{rank + 1}</td>
      <td className="p-2">
        <input
          className="w-full bg-zinc-800 border border-zinc-700 rounded p-1.5 text-xs text-white outline-none focus:border-[#FFBF00]"
          value={draft.dept_name}
          onChange={(e) => setDraft(p => ({ ...p, dept_name: e.target.value }))}
          placeholder="Dept Name"
        />
      </td>
      <td className="p-2">
        <input
          className="w-14 bg-zinc-800 border border-zinc-700 rounded p-1.5 text-center text-xs text-white outline-none focus:border-[#FFBF00]"
          value={draft.group}
          onChange={(e) => setDraft(p => ({ ...p, group: e.target.value.toUpperCase() }))}
        />
      </td>
      <td colSpan={3} className="p-2 text-center text-[10px] text-zinc-500 italic">Auto-calculated from completed events</td>
      <td className="p-2">
        <div className="flex gap-1 justify-end">
          <button onClick={save} className="p-1.5 rounded-lg bg-[#FFBF00] hover:bg-yellow-500 text-black">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

const buildInitialForm = (gender: ArmWrestlingGender): IArmWrestlingEvent => ({
  event_id: Math.floor(Date.now() % 1000000),
  event_name: "right_hand",
  category: "below_63",
  event_date: new Date().toISOString().slice(0, 10),
  department_1: DEPARTMENT_OPTIONS[0],
  department_2: DEPARTMENT_OPTIONS[1],
  winner: null,
  event_status: "scheduled",
  gender
});

export default function ArmWrestlingAdminPage() {
  const { gender: globalGender } = useGender();
  const gender: ArmWrestlingGender = globalGender === "f" ? "women" : "men";
  const lbCategory: 'boys' | 'girls' = gender === 'men' ? 'boys' : 'girls';

  const [events, setEvents] = useState<IArmWrestlingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [formData, setFormData] = useState<IArmWrestlingEvent>(() => buildInitialForm(gender));

  // ── Leaderboard state ──
  const [lbEntries, setLbEntries] = useState<ArmWrestlingLeaderboardEntry[]>([]);
  const [standings, setStandings] = useState<Record<string, any[]>>({});
  const [addMode, setAddMode] = useState(false);
  const [lbMsg, setLbMsg] = useState("");
  const [newEntry, setNewEntry] = useState<Partial<ArmWrestlingLeaderboardEntry>>({
    dept_name: DEPARTMENT_OPTIONS[0],
    category: lbCategory,
    group: 'A',
  });

  const resetForm = (nextGender = gender) => {
    setFormData(buildInitialForm(nextGender));
    setEditingEventId(null);
  };

  const fetchEvents = useCallback(async (activeGender = gender) => {
    setLoading(true);
    setError("");
    try {
      const data = await getEvents(activeGender);
      setEvents(data);
    } catch (err: any) {
      setError(err.message || "Failed to load arm wrestling events");
    } finally {
      setLoading(false);
    }
  }, [gender]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const [entriesRes, standingsRes] = await Promise.all([
        fetch(`${LB_API}`),
        fetch(`${LB_API}/standings`),
      ]);
      const entriesData = await entriesRes.json();
      const standingsData = await standingsRes.json();
      const entries = Array.isArray(entriesData) ? entriesData : (entriesData?.data ?? []);
      setLbEntries(entries);
      setStandings(standingsData && typeof standingsData === 'object' ? standingsData : {});
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchEvents(gender);
    fetchLeaderboard();
    setFormData((prev) => ({ ...prev, gender }));
  }, [gender, fetchEvents, fetchLeaderboard]);

  useEffect(() => {
    setNewEntry(p => ({ ...p, category: lbCategory }));
  }, [lbCategory]);

  const showMsg = (msg: string) => { setLbMsg(msg); setTimeout(() => setLbMsg(""), 3000); };

  const handleAddNew = () => {
    resetForm(gender);
    setShowForm(true);
  };

  const handleEdit = async (eventId: number) => {
    try {
      setError("");
      const data = await getEvent(eventId, gender);
      setEditingEventId(eventId);
      setFormData({
        ...data,
        category: data.category || "below_63",
        event_date: data.event_date ? new Date(data.event_date).toISOString().slice(0, 10) : ""
      });
      setShowForm(true);
    } catch (err: any) {
      setError(err.message || "Failed to load event details");
    }
  };

  const handleDelete = async (eventId: number) => {
    if (!confirm("Delete this arm wrestling event from MongoDB?")) return;
    try {
      await deleteEvent(eventId, gender);
      await fetchEvents(gender);
      await fetchLeaderboard();
    } catch (err: any) {
      setError(err.message || "Failed to delete arm wrestling event");
    }
  };

  const validateForm = () => {
    if (!Number.isFinite(formData.event_id)) {
      return "Event ID must be numeric.";
    }
    if (!formData.department_1.trim() || !formData.department_2.trim()) {
      return "Department 1 and Department 2 are required.";
    }
    if (formData.department_1.trim() === formData.department_2.trim()) {
      return "Department 1 and Department 2 must be different.";
    }
    if (
      formData.winner &&
      formData.winner.trim() !== formData.department_1.trim() &&
      formData.winner.trim() !== formData.department_2.trim()
    ) {
      return "Winner must match Department 1 or Department 2.";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload: IArmWrestlingEvent = {
        ...formData,
        department_1: formData.department_1.trim(),
        department_2: formData.department_2.trim(),
        winner: formData.winner?.trim() ? formData.winner.trim() : null,
        gender,
        event_date: formData.event_date ? new Date(formData.event_date).toISOString() : undefined
      };

      if (editingEventId !== null) {
        await updateEvent(editingEventId, payload);
      } else {
        await createEvent(payload);
      }

      setShowForm(false);
      resetForm(gender);
      await fetchEvents(gender);
      await fetchLeaderboard();
    } catch (err: any) {
      setError(err.message || "Failed to save arm wrestling event");
    } finally {
      setSaving(false);
    }
  };

  // ─── Leaderboard handlers ──────────────────────────────────────────────────
  const handleAddEntry = async () => {
    if (!newEntry.dept_name) {
      showMsg('❌ Please enter a department name.');
      return;
    }
    const maxId = lbEntries.reduce((max, e) => Math.max(max, e.leaderboard_id ?? 0), 0);
    const autoId = maxId + 1;
    const res = await fetch(LB_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newEntry, leaderboard_id: autoId }),
    });
    if (res.ok) {
      showMsg('✅ Department registered!');
      setAddMode(false);
      setNewEntry({ dept_name: DEPARTMENT_OPTIONS[0], category: lbCategory, group: 'A' });
      fetchLeaderboard();
    } else {
      const d = await res.json();
      showMsg(`❌ ${d.message || 'Failed to register'}`);
    }
  };

  const handleUpdateEntry = async (t: ArmWrestlingLeaderboardEntry) => {
    const res = await fetch(`${LB_API}/${t.leaderboard_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dept_name: t.dept_name, category: t.category, group: t.group }),
    });
    if (res.ok) { showMsg('✅ Updated!'); fetchLeaderboard(); }
    else { const d = await res.json(); showMsg(`❌ ${d.message || 'Update failed'}`); }
  };

  const handleDeleteEntry = async (leaderboard_id: number) => {
    if (!confirm('Remove this department from leaderboard?')) return;
    const res = await fetch(`${LB_API}/${leaderboard_id}`, { method: 'DELETE' });
    if (res.ok) { showMsg('🗑 Entry removed'); fetchLeaderboard(); }
  };

  // ─── Leaderboard data prep ──────────────────────────────────────────────────
  const filteredEntries = lbEntries.filter(e => e.category === lbCategory);
  const groups = [...new Set(filteredEntries.map(e => e.group))].sort();

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="rounded-full bg-zinc-900 p-3 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="text-xs font-black uppercase tracking-[0.35em] text-zinc-500">
              Admin Module
            </div>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.18em] text-white">
              {gender === "men" ? "Men's Arm Wrestling" : "Women's Arm Wrestling"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Manual department-vs-department arm wrestling event entry stored in MongoDB.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => { fetchEvents(gender); fetchLeaderboard(); }}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-black uppercase tracking-wider text-white transition-all hover:border-zinc-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FFBF00] px-4 py-3 text-sm font-black uppercase tracking-wider text-black transition-all hover:bg-yellow-400"
          >
            <Plus className="h-4 w-4" />
            Create Event
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6"
        >
          <div className="flex flex-col gap-3 border-b border-zinc-800 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">
                Event Form
              </div>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-wider text-white">
                {editingEventId !== null ? "Edit Arm Wrestling Event" : "Create Arm Wrestling Event"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm(gender);
                setError("");
              }}
              className="rounded-xl border border-zinc-800 px-4 py-3 text-sm font-black uppercase tracking-wider text-zinc-400 transition-all hover:text-white"
            >
              Close Form
            </button>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Event ID
              </label>
              <input
                type="number"
                value={formData.event_id}
                readOnly={editingEventId !== null}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, event_id: Number(e.target.value) }))
                }
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#FFBF00]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Event Name
              </label>
              <input
                value={formData.event_name}
                readOnly
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-semibold uppercase text-zinc-400 outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Gender
              </label>
              <input
                value={gender}
                readOnly
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-semibold uppercase text-zinc-400 outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Categories
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value as IArmWrestlingEvent["category"] }))
                }
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#FFBF00]"
              >
                {ARM_WRESTLING_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Event Status
              </label>
              <select
                value={formData.event_status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    event_status: e.target.value as IArmWrestlingEvent["event_status"]
                  }))
                }
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#FFBF00]"
              >
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Event Date
              </label>
              <input
                type="date"
                value={formData.event_date || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, event_date: e.target.value }))}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#FFBF00]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Dept Name 1
              </label>
              <select
                value={formData.department_1}
                onChange={(e) => setFormData((prev) => ({ ...prev, department_1: e.target.value }))}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#FFBF00]"
              >
                {DEPARTMENT_OPTIONS.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Dept Name 2
              </label>
              <select
                value={formData.department_2}
                onChange={(e) => setFormData((prev) => ({ ...prev, department_2: e.target.value }))}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#FFBF00]"
              >
                {DEPARTMENT_OPTIONS.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            <div className="xl:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Winner
              </label>
              <select
                value={formData.winner || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    winner: e.target.value || null
                  }))
                }
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#FFBF00]"
              >
                <option value="">No winner yet</option>
                {formData.department_1 && (
                  <option value={formData.department_1}>{formData.department_1}</option>
                )}
                {formData.department_2 && (
                  <option value={formData.department_2}>{formData.department_2}</option>
                )}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-5">
            <div className="text-sm text-zinc-500">
              Only departments, category, and winner are stored. No score fields.
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FFBF00] px-5 py-3 text-sm font-black uppercase tracking-wider text-black transition-all hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : editingEventId !== null ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      )}

      <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/80">
        <div className="flex flex-col gap-3 border-b border-zinc-800 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">
              Event Results
            </div>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-wider text-white">
              Arm Wrestling Events
            </h2>
          </div>
          <div className="text-sm text-zinc-400">
            Filtering MongoDB arm wrestling events by <span className="font-black uppercase text-white">{gender}</span>
          </div>
        </div>

        {error && !showForm && (
          <div className="border-b border-red-500/20 bg-red-500/10 px-6 py-4 text-sm font-semibold text-red-300">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="bg-zinc-900 text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                <th className="p-4 text-left">Event</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Departments</th>
                <th className="p-4 text-left">Winner</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-[#FFBF00]">
                    Loading arm wrestling events...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-zinc-500">
                    No arm wrestling events found for this gender.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={`${event.event_id}-${event.gender}`} className="align-top hover:bg-zinc-900/40">
                    <td className="p-4">
                      <div className="font-black uppercase tracking-wider text-white">{event.event_name}</div>
                      <div className="mt-1 text-xs font-mono text-zinc-500">ID #{event.event_id}</div>
                    </td>
                    <td className="p-4 text-zinc-300">
                      {(event.category || "below_63").replace("_", " ")}
                    </td>
                    <td className="p-4 text-zinc-300">{event.event_date ? new Date(event.event_date).toLocaleDateString() : "-"}</td>
                    <td className="p-4 font-semibold text-white">
                      {event.department_1} <span className="text-zinc-500">vs</span> {event.department_2}
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1 text-sm font-semibold text-white">
                        <Medal className="h-4 w-4 text-[#FFBF00]" />
                        {event.winner || "Not selected"}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs font-black uppercase tracking-wider text-zinc-300">
                        {event.event_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(event.event_id)}
                          className="rounded-lg border border-zinc-800 p-2 text-zinc-400 transition-all hover:border-[#FFBF00] hover:text-[#FFBF00]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(event.event_id)}
                          className="rounded-lg border border-zinc-800 p-2 text-zinc-400 transition-all hover:border-red-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ════════════ LEADERBOARD ════════════ */}
      <section className="bg-zinc-950/50 rounded-3xl border border-zinc-800 overflow-hidden backdrop-blur-xl">
        <div className="p-5 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-[#FFBF00]" />
            <h2 className="text-lg font-[900] text-white uppercase tracking-widest">
              Leaderboard — {lbCategory === 'boys' ? 'Boys (Men)' : 'Girls (Women)'}
            </h2>
          </div>
          <button onClick={() => setAddMode(!addMode)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FFBF00] hover:bg-yellow-400 text-black rounded-lg text-sm font-bold transition-all shadow-[0_0_12px_rgba(255,191,0,0.3)]">
            {addMode ? <><X className="w-4 h-4"/>Cancel</> : <><Plus className="w-4 h-4"/>Add Dept</>}
          </button>
        </div>

        {addMode && (
          <div className="p-6 bg-zinc-900/50 border-b border-zinc-800 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Department</label>
                <select
                  value={newEntry.dept_name}
                  onChange={e => setNewEntry(p => ({ ...p, dept_name: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#FFBF00]">
                    {DEPARTMENT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Category</label>
                <select
                  value={newEntry.category}
                  onChange={e => setNewEntry(p => ({ ...p, category: e.target.value as 'boys' | 'girls' }))}
                  className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#FFBF00]">
                    <option value="boys">Boys (Men)</option>
                    <option value="girls">Girls (Women)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Group</label>
                <input
                  value={newEntry.group}
                  onChange={e => setNewEntry(p => ({ ...p, group: e.target.value.toUpperCase() }))}
                  className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#FFBF00]"
                />
              </div>
            </div>
            <button onClick={handleAddEntry}
              className="w-full py-3 bg-[#FFBF00] hover:bg-yellow-400 text-black font-[900] rounded-xl tracking-widest uppercase text-sm shadow-[0_0_20px_rgba(255,191,0,0.3)] transition-all">
              Register Department
            </button>
          </div>
        )}

        {lbMsg && (
          <div className={`p-3 text-center text-xs font-bold border-b border-zinc-800 ${lbMsg.includes('✅') ? 'bg-[#FFBF00]/10 text-[#FFBF00]' : 'bg-red-500/10 text-red-400'}`}>
            {lbMsg}
          </div>
        )}

        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 italic">
            No {lbCategory} leaderboard entries yet. Add departments above to get started.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {groups.map(gp => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const rawStandings: any[] = standings[gp] ?? [];
              const gpTeams: ArmWrestlingLeaderboardEntry[] = filteredEntries
                .filter(e => e.group === gp)
                .map(e => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const s = rawStandings.find((t: any) => t.dept_name === e.dept_name && t.category === e.category);
                  return { ...e, wins: s?.wins ?? 0, losses: s?.losses ?? 0, matches: s?.matches ?? 0 };
                })
                .sort((a, b) => (b.wins ?? 0) - (a.wins ?? 0));

              return (
                <div key={gp} className="p-6">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFBF00]" />
                    Group {gp} Standings
                    <span className="ml-2 text-zinc-600 font-normal lowercase normal-case tracking-normal">
                      (from completed events)
                    </span>
                  </h3>
                  <div className="overflow-x-auto rounded-2xl border border-zinc-800/50 bg-black/30">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-500 uppercase font-black tracking-tighter">
                          <th className="p-3 w-10">POS</th>
                          <th className="p-3 text-left">Department</th>
                          <th className="p-3">Group</th>
                          <th className="p-3">MP</th>
                          <th className="p-3">Wins</th>
                          <th className="p-3">Loss</th>
                          <th className="p-3 w-20"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {gpTeams.length === 0 ? (
                          <tr><td colSpan={7} className="p-8 text-center text-zinc-600 italic">No teams in this group yet.</td></tr>
                        ) : (
                          gpTeams.map((t, i) => (
                            <ArmWrestlingTeamRow
                              key={t.leaderboard_id}
                              team={t}
                              rank={i}
                              onUpdate={handleUpdateEntry}
                              onDelete={() => handleDeleteEntry(t.leaderboard_id)}
                            />
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
