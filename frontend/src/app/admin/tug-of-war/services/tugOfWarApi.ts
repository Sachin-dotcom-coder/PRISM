import { ITugOfWarEvent, TugOfWarGender } from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

const parseResponse = async <T>(res: Response, fallbackMessage: string): Promise<T> => {
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(payload?.message || fallbackMessage);
  }
  return (payload?.data ?? payload) as T;
};

export const getEvents = async (gender: TugOfWarGender): Promise<ITugOfWarEvent[]> => {
  const res = await fetch(`${BASE_URL}/tug-of-war?gender=${gender}`);
  return parseResponse<ITugOfWarEvent[]>(res, "Failed to fetch tug of war events");
};

export const getEvent = async (
  event_id: number,
  gender: TugOfWarGender
): Promise<ITugOfWarEvent> => {
  const res = await fetch(`${BASE_URL}/tug-of-war/${event_id}?gender=${gender}`);
  return parseResponse<ITugOfWarEvent>(res, `Failed to fetch tug of war event ${event_id}`);
};

export const createEvent = async (data: ITugOfWarEvent): Promise<ITugOfWarEvent> => {
  const res = await fetch(`${BASE_URL}/tug-of-war`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return parseResponse<ITugOfWarEvent>(res, "Failed to create tug of war event");
};

export const updateEvent = async (
  event_id: number,
  data: ITugOfWarEvent
): Promise<ITugOfWarEvent> => {
  const res = await fetch(`${BASE_URL}/tug-of-war/${event_id}?gender=${data.gender}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return parseResponse<ITugOfWarEvent>(res, "Failed to update tug of war event");
};

export const deleteEvent = async (
  event_id: number,
  gender: TugOfWarGender
): Promise<void> => {
  const res = await fetch(`${BASE_URL}/tug-of-war/${event_id}?gender=${gender}`, {
    method: "DELETE"
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.message || "Failed to delete tug of war event");
  }
};
