"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Medal,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Timer,
  Trash2,
  Trophy,
  Check,
  X
} from "lucide-react";
import useSWR from "swr";
import CategorySelector from "./components/CategorySelector";
import EventSelector from "./components/EventSelector";
import ParticipantForm from "./components/ParticipantForm";
import { DEPARTMENT_OPTIONS } from "../shared/departmentOptions";
import { createEvent, deleteEvent, getEvent, getEvents, updateEvent } from "./services/athleticsApi";
import { useGender } from "@/app/components/Providers";
import {
  AthleticsCategory,
  AthleticsEventType,
  AthleticsGender,
  AthleticsEventName,
  IAthleticsEvent,
  IParticipant,
  getEventMeta,
  getEventOptions,
  ATeam,
  ATHLETICS_LEAD_EVENT_OPTIONS,
  AthleticsLeadEventName
} from "./types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function ATeamRow({ team, rank, onUpdate, onDelete }: { team: ATeam; rank: number; onUpdate: (t: ATeam) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...team });

  useEffect(() => { if (!editing) setDraft({ ...team }); }, [team, editing]);

  const f = (k: keyof ATeam, v: string | number) => setDraft(p => ({ ...p, [k]: v }));
  const save = () => { onUpdate(draft); setEditing(false); };

  if (!editing) return (
    <tr className="border-b border-zinc-800/50 hover:bg-zinc-900/20">
      <td className={`p-3 text-center w-10 text-sm font-black`}>{rank + 1}</td>
      <td className="p-3">
        <div className="flex flex-col">
          <span className="font-semibold text-zinc-200 text-sm">{team.dept_name}</span>
          <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter">
            {team.event_name}
          </span>
        </div>
      </td>
      <td className="p-3 text-center text-zinc-400 text-xs font-mono">{team.group}</td>
      <td className="p-3 text-center text-zinc-100 text-xs font-bold">{team.points ?? "0"}</td>
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
          {DEPARTMENT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <div className="flex gap-1">
          <select className="input-field py-1 text-[10px]" value={draft.event_name} onChange={e => f("event_name", e.target.value as any)}>
            {ATHLETICS_LEAD_EVENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </td>
      <td className="p-2">
        <select className="w-12 input-field p-1 text-center text-xs" value={draft.group} onChange={e => f("group", e.target.value)}>
          <option value="A">A</option>
          <option value="B">B</option>
        </select>
      </td>
      <td className="p-2"><input type="number" className="w-12 input-field p-1 text-center text-xs" value={draft.points ?? "0"} onChange={e => f("points", e.target.value)} /></td>
      <td className="p-2">
        <div className="flex gap-1 justify-end">
          <button onClick={save} className="p-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white"><X className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );
}

const emptyParticipant = (): IParticipant => ({
  participant_name: "",
  department: DEPARTMENT_OPTIONS[0],
  performance: "",
  rank: null
});

const ensureParticipantSlots = (participants: IParticipant[], count: number) => {
  const next = [...participants];
  while (next.length < count) {
    next.push(emptyParticipant());
  }
  return next;
};

const initialEventNameFor = (category: AthleticsCategory, gender: AthleticsGender): AthleticsEventName =>
  getEventOptions(category, gender)[0].value;

const buildInitialForm = (
  category: AthleticsCategory,
  gender: AthleticsGender
): IAthleticsEvent => {
  const eventName = initialEventNameFor(category, gender);
  const meta = getEventMeta(eventName)!;

  return {
    event_id: Math.floor(Date.now() % 1000000),
    event_name: eventName,
    event_type: meta.eventType,
    event_date: new Date().toISOString().slice(0, 10),
    participants: [emptyParticipant()],
    winner: null,
    event_status: "scheduled",
    gender
  };
};

const rankParticipants = (
  participants: IParticipant[],
  eventType: AthleticsEventType
) => {
  const sorted = [...participants].sort((a, b) => {
    if (a.performance === b.performance) {
      return a.participant_name.localeCompare(b.participant_name);
    }

    const performanceA = Number(a.performance);
    const performanceB = Number(b.performance);

    return eventType === "run"
      ? performanceA - performanceB
      : performanceB - performanceA;
  });

  return sorted.map((participant, index, arr) => {
    let rank = index + 1;

    if (index > 0 && participant.performance === arr[index - 1].performance) {
      rank = arr[index - 1].rank ?? rank;
    }

    return { ...participant, rank };
  });
};

export default function AthleticsAdminPage() {
  const { gender: globalGender } = useGender();
  const gender: AthleticsGender = globalGender === "f" ? "women" : "men";

  // --- LEADERBOARD LOGIC ---
  const LB_API = "/api/athletics-lead";
  const lbGender = gender === "men" ? "M" : "F";

  const { data: allEntries, mutate: mutateEntries } = useSWR(LB_API, fetcher);
  const validEntries: ATeam[] = Array.isArray(allEntries) ? allEntries : [];
  const filteredEntries = validEntries.filter(e => e.category === lbGender);

  const [addMode, setAddMode] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const showMsg = (msg: string) => { setSaveMsg(msg); setTimeout(() => setSaveMsg(""), 3000); };

  const [newEntry, setNewEntry] = useState<Partial<ATeam>>({
    dept_name: "",
    event_name: "Running",
    group: "A",
    category: lbGender,
    points: "0"
  });

  useEffect(() => {
    setNewEntry(prev => ({ ...prev, category: lbGender }));
  }, [lbGender]);

  const handleAddEntry = async () => {
    if (!newEntry.dept_name || !newEntry.event_name) return;
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
        event_name: "Running",
        group: "A",
        category: lbGender,
        points: "0"
      });
      mutateEntries();
    } else {
      const d = await res.json();
      showMsg(`❌ ${d.message || "Failed"}`);
    }
  };

  const handleUpdateEntry = async (t: ATeam) => {
    const res = await fetch(`${LB_API}/${t._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t)
    });
    if (res.ok) {
      showMsg("✅ Dept updated!");
      mutateEntries();
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Remove dept from leaderboard?")) return;
    const res = await fetch(`${LB_API}/${id}`, { method: "DELETE" });
    if (res.ok) {
      showMsg("🗑 Dept removed");
      mutateEntries();
    }
  };
  // -----------------------

  const [category, setCategory] = useState<AthleticsCategory>("throw");
  const [events, setEvents] = useState<IAthleticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [formData, setFormData] = useState<IAthleticsEvent>(() => buildInitialForm("throw", gender));

  const eventOptions = useMemo(() => getEventOptions(category, gender), [category, gender]);
  const filteredEvents = useMemo(
    () => events.filter((event) => eventOptions.some((option) => option.value === event.event_name)),
    [events, eventOptions]
  );

  const resetForm = (nextCategory = category, nextGender = gender) => {
    setFormData(buildInitialForm(nextCategory, nextGender));
    setEditingEventId(null);
  };

  const fetchEvents = async (activeGender = gender) => {
    setLoading(true);
    setError("");

    try {
      const data = await getEvents(activeGender);
      setEvents(data);
    } catch (err: any) {
      setError(err.message || "Failed to load athletics events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(gender);
  }, [gender]);

  useEffect(() => {
    const nextOptions = getEventOptions(category, gender);
    if (!nextOptions.some((option) => option.value === formData.event_name)) {
      const fallback = nextOptions[0];
      setFormData((prev) => ({
        ...prev,
        event_name: fallback.value,
        event_type: fallback.eventType,
        gender
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, gender }));
  }, [category, gender, formData.event_name]);

  const handleCategoryChange = (value: AthleticsCategory) => {
    setCategory(value);
    if (!showForm) {
      return;
    }
    resetForm(value, gender);
  };

  const handleEventNameChange = (eventName: AthleticsEventName) => {
    const meta = getEventMeta(eventName);
    if (!meta) return;

    setFormData((prev) => ({
      ...prev,
      event_name: eventName,
      event_type: meta.eventType,
      winner: prev.participants.some((participant) => participant.participant_name === prev.winner)
        ? prev.winner
        : null
    }));
  };

  const handleAddNew = () => {
    resetForm(category, gender);
    setShowForm(true);
  };

  const handleEdit = async (eventId: number) => {
    try {
      setError("");
      const data = await getEvent(eventId, gender);
      const nextCategory = data.event_type === "throw" ? "throw" : "run_jump";

      setCategory(nextCategory);
      setEditingEventId(eventId);
      setFormData({
        ...data,
        event_date: data.event_date ? new Date(data.event_date).toISOString().slice(0, 10) : "",
        participants: data.participants.length > 0 ? data.participants : [emptyParticipant()]
      });
      setShowForm(true);
    } catch (err: any) {
      setError(err.message || "Failed to load event details");
    }
  };

  const handleDelete = async (eventId: number) => {
    if (!confirm("Delete this athletics event from MongoDB?")) return;

    try {
      await deleteEvent(eventId, gender);
      await fetchEvents(gender);
    } catch (err: any) {
      setError(err.message || "Failed to delete athletics event");
    }
  };

  const validateForm = () => {
    if (!Number.isFinite(formData.event_id)) {
      return "Event ID must be numeric.";
    }

    if (formData.participants.length === 0) {
      return "At least one participant is required.";
    }

    for (const participant of formData.participants) {
      if (!participant.participant_name.trim() || !participant.department.trim()) {
        return "Participant name and department are required.";
      }

      if (
        String(participant.performance).trim() === "" ||
        !Number.isFinite(Number(participant.performance))
      ) {
        return "Performance must be numeric.";
      }
    }

    if (
      formData.winner &&
      !formData.participants.some(
        (participant) => participant.participant_name.trim() === formData.winner
      )
    ) {
      return "Winner must match one of the participant names.";
    }

    if (!formData.gender) {
      return "Gender is required.";
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
      const rankedParticipants = rankParticipants(
        formData.participants.map((participant) => ({
          ...participant,
          participant_name: participant.participant_name.trim(),
          department: participant.department.trim(),
          performance: Number(participant.performance)
        })),
        formData.event_type
      );

      const payload: IAthleticsEvent = {
        ...formData,
        participants: rankedParticipants,
        gender,
        event_date: formData.event_date ? new Date(formData.event_date).toISOString() : undefined
      };

      if (editingEventId !== null) {
        await updateEvent(editingEventId, payload);
      } else {
        await createEvent(payload);
      }

      setShowForm(false);
      resetForm(category, gender);
      await fetchEvents(gender);
    } catch (err: any) {
      setError(err.message || "Failed to save athletics event");
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
              {gender === "men" ? "Men's Athletics" : "Women's Athletics"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Final-result entry for throw, jump, and running events stored in MongoDB.
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

      <CategorySelector category={category} setCategory={handleCategoryChange} />

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
                {editingEventId !== null ? "Edit Athletics Event" : "Create Athletics Event"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm(category, gender);
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

            <EventSelector
              category={category}
              gender={gender}
              eventName={formData.event_name}
              setEventName={handleEventNameChange}
            />

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Event Type
              </label>
              <input
                value={formData.event_type}
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
                Event Status
              </label>
              <select
                value={formData.event_status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    event_status: e.target.value as IAthleticsEvent["event_status"]
                  }))
                }
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#FFBF00]"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="xl:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Winner
              </label>
              <input
                type="text"
                value={formData.winner || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    winner: e.target.value.trim() ? e.target.value : null
                  }))
                }
                placeholder="Type winner name manually"
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#FFBF00]"
              />
            </div>
          </div>

          <div className="grid gap-4 border-t border-zinc-800 pt-6 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Dept Name 1
              </label>
              <select
                value={ensureParticipantSlots(formData.participants, 2)[0].department}
                onChange={(e) =>
                  setFormData((prev) => {
                    const participants = ensureParticipantSlots(prev.participants, 2);
                    participants[0] = { ...participants[0], department: e.target.value };
                    return { ...prev, participants };
                  })
                }
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
                value={ensureParticipantSlots(formData.participants, 2)[1].department}
                onChange={(e) =>
                  setFormData((prev) => {
                    const participants = ensureParticipantSlots(prev.participants, 2);
                    participants[1] = { ...participants[1], department: e.target.value };
                    return { ...prev, participants };
                  })
                }
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
                Departments
              </label>
              <input
                type="text"
                readOnly
                value={`${ensureParticipantSlots(formData.participants, 2)[0].department || "Team 1"} vs ${ensureParticipantSlots(formData.participants, 2)[1].department || "Team 2"}`}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-400 outline-none"
              />
            </div>
          </div>

          <ParticipantForm
            participants={formData.participants}
            eventType={formData.event_type}
            onChange={(participants) =>
              setFormData((prev) => {
                const nextWinner =
                  prev.winner &&
                  participants.some(
                    (participant) => participant.participant_name.trim() === prev.winner
                  )
                    ? prev.winner
                    : null;

                return {
                  ...prev,
                  participants,
                  winner: nextWinner
                };
              })
            }
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-5">
            <div className="text-sm text-zinc-500">
              Data flow: UI to API to backend to MongoDB to response to UI refresh.
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
              {category === "throw" ? "Throw Events" : "Run & Jump Events"}
            </h2>
          </div>
          <div className="text-sm text-zinc-400">
            Filtering MongoDB athletics events by <span className="font-black uppercase text-white">{gender}</span>
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
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Winner</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Participants</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-[#FFBF00]">
                    Loading athletics events...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-zinc-500">
                    No athletics events found for this category and gender.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={`${event.event_id}-${event.gender}`} className="align-top hover:bg-zinc-900/40">
                    <td className="p-4">
                      <div className="font-black uppercase tracking-wider text-white">
                        {event.event_name.replaceAll("_", " ")}
                      </div>
                      <div className="mt-1 text-xs font-mono text-zinc-500">ID #{event.event_id}</div>
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#FFBF00]">
                        {event.event_type}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-300">{event.event_date ? new Date(event.event_date).toLocaleDateString() : "-"}</td>
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
                      <div className="space-y-2">
                        {event.participants.map((participant) => (
                          <div
                            key={`${participant.participant_name}-${participant.department}`}
                            className="rounded-xl bg-black/50 px-3 py-2"
                          >
                            <div className="font-semibold text-white">
                              {participant.participant_name} <span className="text-zinc-500">({participant.department})</span>
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
                              <span className="inline-flex items-center gap-1">
                                <Timer className="h-3.5 w-3.5" />
                                {participant.performance}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
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
      <section className="glass rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl mt-8">
        <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/40">
          <div className="flex items-center gap-3"><Trophy className="w-5 h-5 text-blue-500" /><h2 className="text-xl font-sports text-white">Leaderboard — {gender === "men" ? "Men" : "Women"}</h2></div>
          <button onClick={() => setAddMode(!addMode)} className="btn-blue px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            {addMode ? "Cancel" : <><Plus className="w-4 h-4" /> Add Dept</>}
          </button>
        </div>
        {saveMsg && <div className={`p-3 text-center text-xs font-bold border-b border-zinc-800 ${saveMsg.includes('✅') ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>{saveMsg}</div>}
        {addMode && (
          <div className="p-6 bg-zinc-900/50 border-b border-zinc-800 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 border border-zinc-800 rounded-xl p-3 bg-black/40">
              <div><label className="label-sm">Dept</label>
                <select value={newEntry.dept_name} onChange={e => setNewEntry(p => ({ ...p, dept_name: e.target.value }))} className="input-field py-2">
                  <option value="">Select Dept</option>
                  {DEPARTMENT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div><label className="label-sm">Event</label>
                <select value={newEntry.event_name} onChange={e => setNewEntry(p => ({ ...p, event_name: e.target.value as any }))} className="input-field py-2">
                  {ATHLETICS_LEAD_EVENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div><label className="label-sm">Group</label>
                <select value={newEntry.group} onChange={e => setNewEntry(p => ({ ...p, group: e.target.value }))} className="input-field py-2">
                  <option value="A">A</option>
                  <option value="B">B</option>
                </select>
              </div>
              <div><label className="label-sm">Points</label>
                <input type="number" value={newEntry.points} onChange={e => setNewEntry(p => ({ ...p, points: e.target.value }))} className="input-field py-2" />
              </div>
            </div>
            <button onClick={handleAddEntry} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-lg">REGISTER DEPARTMENT</button>
          </div>
        )}
        <div className="divide-y divide-zinc-800">
          {ATHLETICS_LEAD_EVENT_OPTIONS.map(eventKey => {
            const eventEntries = filteredEntries.filter(e => e.event_name === eventKey);
            const groups = eventEntries.length > 0 ? [...new Set(eventEntries.map(e => e.group))] : ["A", "B"];

            return (
              <div key={eventKey} className="border-b border-zinc-800/50 p-6 bg-zinc-900/20">
                <h3 className="text-lg font-black text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                  <span className="w-2 h-8 rounded-full bg-blue-500 block" /> {eventKey}
                </h3>

                <div className="grid gap-6 xl:grid-cols-2">
                  {groups.map(gp => {
                    const gpTeams: ATeam[] = eventEntries
                      .filter(e => e.group === gp)
                      .sort((a, b) => Number(b.points || 0) - Number(a.points || 0));

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
                                <th className="p-3 w-10 text-center">POS</th><th className="p-3 text-left">DEPARTMENT</th><th className="p-3 text-center">GP</th><th className="p-3 text-center">PTS</th><th className="p-3 w-20"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {gpTeams.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-zinc-600 italic">No rankings for this group yet.</td></tr> :
                                gpTeams.map((t: ATeam, i: number) => <ATeamRow key={t.dept_name ?? t._id} team={t} rank={i} onUpdate={handleUpdateEntry} onDelete={() => handleDeleteEntry(t._id as string)} />)
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
        .input-field { width: 100%; background: #121212; border: 1px solid #222; border-radius: 10px; padding: 10px; font-size: 13px; color: white; }
        .input-field:focus { border-color: #3b82f6; outline: none; }
        .label-sm { display: block; font-size: 9px; font-weight: 900; color: #555; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.1em; }
        .btn-blue { background: #1d4ed8; color: white; transition: all 0.2s; }
        .btn-blue:hover { background: #2563eb; box-shadow: 0 0 15px rgba(59,130,246,0.4); }
      `}</style>

    </div>
  );
}
