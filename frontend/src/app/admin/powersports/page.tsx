/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Medal, Pencil, Plus, RefreshCw, Save, Trash2, Check, X, Trophy } from "lucide-react";
import useSWR from "swr";
import { useGender } from "@/app/components/Providers";
import { createEvent, deleteEvent, getEvent, getEvents, updateEvent } from "./services/powersportsApi";
import { IPowersportsEvent, PowersportsGender, POWERSPORTS_CATEGORY_OPTIONS, POWERSPORTS_EVENT_OPTIONS, POWERSPORTS_DEPARTMENTS } from "./types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export type PTeam = {
  _id?: string;
  leaderboard_id: number;
  dept_name: string;
  category: "u63" | "u83" | "a83";
  group: string;
  gender: "M" | "F";
  points?: number;
  participations?: number;
};

const RANK_COLORS = ["text-yellow-400 font-black", "text-zinc-300 font-black", "text-amber-600 font-black"];

function PTeamRow({ team, rank, onUpdate, onDelete }: { team: PTeam; rank: number; onUpdate: (t: PTeam) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...team });

  useEffect(() => { if (!editing) setDraft({ ...team }); }, [team, editing]);

  const f = (k: keyof PTeam, v: string | number) => setDraft(p => ({ ...p, [k]: v }));
  const save = () => { onUpdate(draft); setEditing(false); };

  if (!editing) return (
    <tr className="border-b border-zinc-800/50 hover:bg-zinc-900/20">
      <td className={`p-3 text-center w-10 text-sm ${RANK_COLORS[rank] ?? "text-zinc-500"}`}>{rank + 1}</td>
      <td className="p-3">
        <div className="flex items-center gap-2">

          <div className="flex flex-col">
            <span className="font-semibold text-zinc-200 text-sm">{team.dept_name}</span>
            <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter">
              {team.category}
            </span>
          </div>
        </div>
      </td>
      <td className="p-3 text-center text-zinc-400 text-xs font-mono">{team.group}</td>
      <td className="p-3 text-center text-zinc-100 text-xs font-bold">{team.points ?? 0}</td>
      <td className="p-3 text-center text-accent font-mono text-sm">{team.participations ?? 0}</td>
      <td className="p-3">
        <div className="flex gap-1 justify-end">
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-blue-600 hover:text-white transition-all text-zinc-400"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-700 hover:text-white transition-all text-zinc-400"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <tr className="border-b border-blue-500/20 bg-blue-500/5">
      <td className="p-2 text-center text-zinc-500 text-sm">{rank + 1}</td>
      <td className="p-2">
        <select className="input-field py-1 text-xs mb-1" value={draft.dept_name} onChange={e => f("dept_name", e.target.value)}>
          <option value="">Select Dept</option>
          {POWERSPORTS_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <div className="flex gap-1">
          <select className="input-field py-1 text-[10px]" value={draft.category} onChange={e => f("category", e.target.value as any)}>
            <option value="u63">Under 63kg</option>
            <option value="u83">Under 83kg</option>
            <option value="a83">Above 83kg</option>
          </select>
        </div>
      </td>
      <td className="p-2">
        <select className="w-12 input-field p-1 text-center text-xs" value={draft.group} onChange={e => f("group", e.target.value)}>
          <option value="A">A</option>
          <option value="B">B</option>
        </select>
      </td>
      <td colSpan={2} className="p-2 text-right text-[10px] text-zinc-500 italic">Auto-calculated from events</td>
      <td className="p-2">
        <div className="flex gap-1 justify-end">
          <button onClick={save} className="p-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white"><X className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );
}

const buildInitialForm = (gender: PowersportsGender): IPowersportsEvent => ({
  event_id: Math.floor(Date.now() % 1000000),
  event_name: "squat",
  category: "u63",
  event_date: new Date().toISOString().slice(0, 10),
  department_1: POWERSPORTS_DEPARTMENTS[0],
  department_2: POWERSPORTS_DEPARTMENTS[1],
  winner: null,
  event_status: "scheduled",
  gender
});

export default function PowersportsAdminPage() {
  const { gender: globalGender } = useGender();
  const gender: PowersportsGender = globalGender === "f" ? "women" : "men";

  const [events, setEvents] = useState<IPowersportsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [formData, setFormData] = useState<IPowersportsEvent>(() => buildInitialForm(gender));

  const resetForm = (nextGender = gender) => {
    setFormData(buildInitialForm(nextGender));
    setEditingEventId(null);
  };

  const fetchEvents = async (activeGender = gender) => {
    setLoading(true);
    setError("");
    try {
      const data = await getEvents(activeGender);
      setEvents(data);
    } catch (err: any) {
      setError(err.message || "Failed to load powersports events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(gender);
    setFormData((prev) => ({ ...prev, gender }));
  }, [gender]);

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
        category: data.category || "u63",
        event_date: data.event_date ? new Date(data.event_date).toISOString().slice(0, 10) : ""
      });
      setShowForm(true);
    } catch (err: any) {
      setError(err.message || "Failed to load event details");
    }
  };

  const handleDelete = async (eventId: number) => {
    if (!confirm("Delete this powersports event from MongoDB?")) return;
    try {
      await deleteEvent(eventId, gender);
      await fetchEvents(gender);
    } catch (err: any) {
      setError(err.message || "Failed to delete powersports event");
    }
  };

  // --- LEADERBOARD LOGIC ---
  const LB_API = "/api/powersport-lead";
  const lbGender = gender === "men" ? "M" : "F";

  const { data: allEntries, mutate: mutateEntries } = useSWR(LB_API, fetcher);
  const { data: standings, mutate: mutateStandings } = useSWR(`${LB_API}/standings?gender=${gender}`, fetcher);

  const validEntries: PTeam[] = Array.isArray(allEntries?.data) ? allEntries.data : Array.isArray(allEntries) ? allEntries : [];
  const filteredEntries = validEntries.filter(e => e.gender === lbGender);

  const [addMode, setAddMode] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const showMsg = (msg: string) => { setSaveMsg(msg); setTimeout(() => setSaveMsg(""), 3000); };

  const [newEntry, setNewEntry] = useState<Partial<PTeam>>({
    dept_name: "",
    category: "u83",
    group: "A",
    gender: lbGender
  });

  useEffect(() => {
    setNewEntry(prev => ({ ...prev, gender: lbGender }));
  }, [lbGender]);

  const handleAddEntry = async () => {
    if (!newEntry.dept_name) return;
    const res = await fetch(LB_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEntry)
    });
    if (res.ok) {
      showMsg("✅ Dept added to Leaderboard!");
      setAddMode(false);
      setNewEntry({
        dept_name: "",
        category: "u83",
        group: "A",
        gender: lbGender
      });
      mutateEntries();
      mutateStandings();
    } else {
      const d = await res.json();
      showMsg(`❌ ${d.message || "Failed"}`);
    }
  };

  const handleUpdateEntry = async (t: PTeam) => {
    const res = await fetch(`${LB_API}/${t._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t)
    });
    if (res.ok) {
      showMsg("✅ Dept updated!");
      mutateEntries();
      mutateStandings();
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Remove dept from leaderboard?")) return;
    const res = await fetch(`${LB_API}/${id}`, { method: "DELETE" });
    if (res.ok) {
      showMsg("🗑 Dept removed");
      mutateEntries();
      mutateStandings();
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
      const payload: IPowersportsEvent = {
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
      mutateStandings();
    } catch (err: any) {
      setError(err.message || "Failed to save powersports event");
    } finally {
      setSaving(false);
    }
  };

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
              {gender === "men" ? "Men's Powersports" : "Women's Powersports"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Manual department-vs-department powersports event entry stored in MongoDB.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fetchEvents(gender)}
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
                {editingEventId !== null ? "Edit Powersports Event" : "Create Powersports Event"}
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
              <select
                value={formData.event_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, event_name: e.target.value as IPowersportsEvent["event_name"] }))
                }
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#FFBF00]"
              >
                {POWERSPORTS_EVENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
                  setFormData((prev) => ({ ...prev, category: e.target.value as IPowersportsEvent["category"] }))
                }
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#FFBF00]"
              >
                {POWERSPORTS_CATEGORY_OPTIONS.map((option) => (
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
                    event_status: e.target.value as IPowersportsEvent["event_status"]
                  }))
                }
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#FFBF00]"
              >
                <option value="scheduled">Scheduled</option>
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
                {POWERSPORTS_DEPARTMENTS.map((department) => (
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
                {POWERSPORTS_DEPARTMENTS.map((department) => (
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
                {POWERSPORTS_DEPARTMENTS.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-5">
            <div className="text-sm text-zinc-500">
              Only departments and winner are stored. No score fields.
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
              Powersports Events
            </h2>
          </div>
          <div className="text-sm text-zinc-400">
            Filtering MongoDB powersports events by <span className="font-black uppercase text-white">{gender}</span>
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
                    Loading powersports events...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-zinc-500">
                    No powersports events found for this gender.
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
                      {POWERSPORTS_CATEGORY_OPTIONS.find(o => o.value === (event.category || "u63"))?.label}
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
                      <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${
                        event.event_status === 'scheduled' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                        'border-green-500/30 text-green-400 bg-green-500/10'
                      }`}>
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

      {/* LEADERBOARD SECTION */}
      <section className="glass rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/40">
          <div className="flex items-center gap-3"><Trophy className="w-5 h-5 text-blue-500" /><h2 className="text-xl font-sports text-white">Leaderboard — {gender === "men" ? "Men" : "Women"}</h2></div>
          <button onClick={() => setAddMode(!addMode)} className="btn-blue px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            {addMode ? "Cancel" : <><Plus className="w-4 h-4" /> Add Dept</>}
          </button>
        </div>
        {saveMsg && <div className={`p-3 text-center text-xs font-bold border-b border-zinc-800 ${saveMsg.includes('✅') ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>{saveMsg}</div>}
        {addMode && (
          <div className="p-6 bg-zinc-900/50 border-b border-zinc-800 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 border border-zinc-800 rounded-xl p-3 bg-black/40">
              <div><label className="label-sm">Dept</label>
                <select value={newEntry.dept_name} onChange={e => setNewEntry(p => ({ ...p, dept_name: e.target.value }))} className="input-field py-2">
                  <option value="">Select Dept</option>
                  {POWERSPORTS_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div><label className="label-sm">Category</label>
                <select value={newEntry.category} onChange={e => setNewEntry(p => ({ ...p, category: e.target.value as any }))} className="input-field py-2">
                  {POWERSPORTS_CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div><label className="label-sm">Group</label>
                <select value={newEntry.group} onChange={e => setNewEntry(p => ({ ...p, group: e.target.value }))} className="input-field py-2">
                  <option value="A">A</option>
                  <option value="B">B</option>
                </select>
              </div>
            </div>
            <button onClick={handleAddEntry} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-lg">REGISTER DEPARTMENT</button>
          </div>
        )}
        <div className="divide-y divide-zinc-800">
          {(["u63", "u83", "a83"] as const).map(catKey => {
            const catEntries = filteredEntries.filter(e => e.category === catKey);
            const groups = catEntries.length > 0 ? [...new Set(catEntries.map(e => e.group))] : ["A", "B"];
            const catLabel = POWERSPORTS_CATEGORY_OPTIONS.find(o => o.value === catKey)?.label || catKey;

            return (
              <div key={catKey} className="border-b border-zinc-800/50 p-6 bg-zinc-900/20">
                <h3 className="text-lg font-black text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                  <span className="w-2 h-8 rounded-full bg-blue-500 block" /> {catLabel}
                </h3>

                <div className="grid gap-6 xl:grid-cols-2">
                  {groups.map(gp => {
                    const rawStandings: any[] = standings ? standings[gp] ?? [] : [];

                    const gpTeams: PTeam[] = catEntries
                      .filter(e => e.group === gp)
                      .map(e => {
                        const s = rawStandings.find((t: any) => t._id === e._id);
                        return { ...e, points: s?.points ?? 0, participations: s?.participations ?? 0 };
                      })
                      .sort((a, b) => (b.points ?? 0) - (a.points ?? 0));

                    return (
                      <div key={gp} className="bg-black/40 rounded-2xl border border-zinc-800/50 overflow-hidden">
                        <div className="p-4 bg-zinc-900/60 border-b border-zinc-800/50">
                          <h4 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Group {gp}
                          </h4>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-zinc-800/50 bg-black/40 text-zinc-500 uppercase font-black tracking-tighter">
                                <th className="p-3 w-10 text-center">POS</th><th className="p-3 text-left">DEPARTMENT</th><th className="p-3 text-center">GP</th><th className="p-3 text-center">PTS</th><th className="p-3 text-center text-accent">EVT</th><th className="p-3 w-20"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {gpTeams.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-zinc-600 italic">No rankings for this group yet.</td></tr> :
                                gpTeams.map((t: any, i: number) => <PTeamRow key={t.dept_name ?? t._id} team={t} rank={i} onUpdate={handleUpdateEntry} onDelete={() => handleDeleteEntry(t._id as string)} />)
                              }
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <style jsx global>{`
        .glass { background: rgba(8, 8, 8, 0.8); backdrop-filter: blur(16px); }
        .glow-text-blue { text-shadow: 0 0 25px rgba(59, 130, 246, 0.3); }
        .input-field { width: 100%; background: #121212; border: 1px solid #222; border-radius: 10px; padding: 10px; font-size: 13px; color: white; }
        .input-field:focus { border-color: #3b82f6; outline: none; }
        .label-sm { display: block; font-size: 9px; font-weight: 900; color: #555; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.1em; }
        .btn-blue { background: #1d4ed8; color: white; transition: all 0.2s; }
        .btn-blue:hover { background: #2563eb; box-shadow: 0 0 15px rgba(59,130,246,0.4); }
      `}</style>
    </div>
  );
}
