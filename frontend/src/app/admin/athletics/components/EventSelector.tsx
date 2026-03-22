import { AthleticsEventName, AthleticsGender, AthleticsCategory, getEventOptions } from "../types";

interface EventSelectorProps {
  category: AthleticsCategory;
  gender: AthleticsGender;
  eventName: AthleticsEventName;
  setEventName: (value: AthleticsEventName) => void;
}

export default function EventSelector({
  category,
  gender,
  eventName,
  setEventName
}: EventSelectorProps) {
  const options = getEventOptions(category, gender);

  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
        Event Name
      </label>
      <select
        value={eventName}
        onChange={(e) => setEventName(e.target.value as AthleticsEventName)}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#FFBF00]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
