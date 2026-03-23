"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Medal, Pencil, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { useGender } from "@/app/components/Providers";
import { DEPARTMENT_OPTIONS } from "../shared/departmentOptions";
import { createEvent, deleteEvent, getEvent, getEvents, updateEvent } from "./services/armWrestlingApi";
import {
  ARM_WRESTLING_CATEGORY_OPTIONS,
  ArmWrestlingGender,
  IArmWrestlingEvent
} from "./types";

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

  const [events, setEvents] = useState<IArmWrestlingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [formData, setFormData] = useState<IArmWrestlingEvent>(() => buildInitialForm(gender));

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
      setError(err.message || "Failed to load arm wrestling events");
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
    } catch (err: any) {
      setError(err.message || "Failed to save arm wrestling event");
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
                {DEPARTMENT_OPTIONS.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
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
    </div>
  );
}
