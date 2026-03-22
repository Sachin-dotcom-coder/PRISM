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
  Trash2
} from "lucide-react";
import CategorySelector from "./components/CategorySelector";
import EventSelector from "./components/EventSelector";
import ParticipantForm from "./components/ParticipantForm";
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
  getEventOptions
} from "./types";

const emptyParticipant = (): IParticipant => ({
  participant_name: "",
  department: "",
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
    venue: "",
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

    return eventType === "run"
      ? a.performance - b.performance
      : b.performance - a.performance;
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

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">Gender</div>
          <div className="mt-3 text-2xl font-black uppercase text-white">{gender}</div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">Category</div>
          <div className="mt-3 text-2xl font-black uppercase text-white">
            {category === "throw" ? "Throw Events" : "Run & Jump"}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">Loaded Events</div>
          <div className="mt-3 text-2xl font-black uppercase text-white">{filteredEvents.length}</div>
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
                Venue
              </label>
              <input
                value={formData.venue || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, venue: e.target.value }))}
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
                <option value="ongoing">Ongoing</option>
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
              <input
                type="text"
                value={ensureParticipantSlots(formData.participants, 2)[0].department}
                onChange={(e) =>
                  setFormData((prev) => {
                    const participants = ensureParticipantSlots(prev.participants, 2);
                    participants[0] = { ...participants[0], department: e.target.value };
                    return { ...prev, participants };
                  })
                }
                placeholder="e.g. CS"
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#FFBF00]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Dept Name 2
              </label>
              <input
                type="text"
                value={ensureParticipantSlots(formData.participants, 2)[1].department}
                onChange={(e) =>
                  setFormData((prev) => {
                    const participants = ensureParticipantSlots(prev.participants, 2);
                    participants[1] = { ...participants[1], department: e.target.value };
                    return { ...prev, participants };
                  })
                }
                placeholder="e.g. MECH"
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#FFBF00]"
              />
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
                <th className="p-4 text-left">Date / Venue</th>
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
                    <td className="p-4 text-zinc-300">
                      <div>{event.event_date ? new Date(event.event_date).toLocaleDateString() : "-"}</div>
                      <div className="mt-1 text-xs text-zinc-500">{event.venue || "-"}</div>
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
    </div>
  );
}
