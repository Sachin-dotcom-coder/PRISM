import { Minus, Plus } from "lucide-react";
import { AthleticsEventType, IParticipant } from "../types";

interface ParticipantFormProps {
  participants: IParticipant[];
  eventType: AthleticsEventType;
  onChange: (participants: IParticipant[]) => void;
}

const performanceLabel: Record<AthleticsEventType, string> = {
  throw: "Final Throw Distance (m)",
  jump: "Best Jump Distance (m)",
  run: "Time (seconds)"
};

export default function ParticipantForm({
  participants,
  eventType,
  onChange
}: ParticipantFormProps) {
  const updateParticipant = (
    index: number,
    field: keyof IParticipant,
    value: string | number | null
  ) => {
    const next = participants.map((participant, participantIndex) =>
      participantIndex === index ? { ...participant, [field]: value } : participant
    );
    onChange(next);
  };

  const addParticipant = () => {
    onChange([
      ...participants,
      {
        participant_name: "",
        department: "",
        performance: "",
        rank: null
      }
    ]);
  };

  const removeParticipant = (index: number) => {
    onChange(participants.filter((_, participantIndex) => participantIndex !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">Participants</h3>
          <p className="mt-1 text-sm text-zinc-500">Store final performance only. No attempts.</p>
        </div>
        <button
          type="button"
          onClick={addParticipant}
          className="inline-flex items-center gap-2 rounded-lg bg-[#FFBF00] px-4 py-2 text-sm font-black text-black transition-all hover:bg-yellow-400"
        >
          <Plus className="h-4 w-4" />
          Add Participant
        </button>
      </div>

      {participants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-6 text-center text-sm text-zinc-500">
          No participants added.
        </div>
      ) : (
        <div className="space-y-3">
          {participants.map((participant, index) => (
            <div
              key={index}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                  Participant {index + 1}
                </div>
                <button
                  type="button"
                  onClick={() => removeParticipant(index)}
                  className="rounded-lg border border-zinc-800 p-2 text-zinc-500 transition-all hover:border-red-500 hover:text-red-400"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                    {index === 0 ? "Participant / Team 1" : index === 1 ? "Participant / Team 2" : `Participant ${index + 1}`}
                  </label>
                  <input
                    value={participant.participant_name}
                    onChange={(e) => updateParticipant(index, "participant_name", e.target.value)}
                    placeholder={index === 0 ? "Type team 1 / participant name" : index === 1 ? "Type team 2 / participant name" : "Type participant name"}
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#FFBF00]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                    {index === 0 ? "Team 1 Department" : index === 1 ? "Team 2 Department" : `Department ${index + 1}`}
                  </label>
                  <input
                    value={participant.department}
                    onChange={(e) => updateParticipant(index, "department", e.target.value)}
                    placeholder={index === 0 ? "Type team 1 department" : index === 1 ? "Type team 2 department" : "Type department"}
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#FFBF00]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                    {performanceLabel[eventType]}
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={participant.performance}
                    onChange={(e) =>
                      updateParticipant(index, "performance", e.target.value)
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#FFBF00]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
