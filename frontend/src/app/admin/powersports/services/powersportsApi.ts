import { IPowersportsEvent, PowersportsGender } from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

const parseResponse = async <T>(res: Response, fallbackMessage: string): Promise<T> => {
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(payload?.message || fallbackMessage);
  }
  return (payload?.data ?? payload) as T;
};

export const getEvents = async (gender: PowersportsGender): Promise<IPowersportsEvent[]> => {
  const res = await fetch(`${BASE_URL}/powersports?gender=${gender}`);
  return parseResponse<IPowersportsEvent[]>(res, "Failed to fetch powersports events");
};

export const getEvent = async (
  event_id: number,
  gender: PowersportsGender
): Promise<IPowersportsEvent> => {
  const res = await fetch(`${BASE_URL}/powersports/${event_id}?gender=${gender}`);
  return parseResponse<IPowersportsEvent>(res, `Failed to fetch powersports event ${event_id}`);
};

export const createEvent = async (data: IPowersportsEvent): Promise<IPowersportsEvent> => {
  const res = await fetch(`${BASE_URL}/powersports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return parseResponse<IPowersportsEvent>(res, "Failed to create powersports event");
};

export const updateEvent = async (
  event_id: number,
  data: IPowersportsEvent
): Promise<IPowersportsEvent> => {
  const res = await fetch(`${BASE_URL}/powersports/${event_id}?gender=${data.gender}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return parseResponse<IPowersportsEvent>(res, "Failed to update powersports event");
};

export const deleteEvent = async (
  event_id: number,
  gender: PowersportsGender
): Promise<void> => {
  const res = await fetch(`${BASE_URL}/powersports/${event_id}?gender=${gender}`, {
    method: "DELETE"
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.message || "Failed to delete powersports event");
  }
};
