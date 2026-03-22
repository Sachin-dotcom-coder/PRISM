import { AthleticsGender, IAthleticsEvent } from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

const parseResponse = async <T>(res: Response, fallbackMessage: string): Promise<T> => {
  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return (payload?.data ?? payload) as T;
};

export const getEvents = async (gender: AthleticsGender): Promise<IAthleticsEvent[]> => {
  const res = await fetch(`${BASE_URL}/athletics?gender=${gender}`);
  return parseResponse<IAthleticsEvent[]>(res, "Failed to fetch athletics events");
};

export const getEvent = async (
  event_id: number,
  gender: AthleticsGender
): Promise<IAthleticsEvent> => {
  const res = await fetch(`${BASE_URL}/athletics/${event_id}?gender=${gender}`);
  return parseResponse<IAthleticsEvent>(res, `Failed to fetch athletics event ${event_id}`);
};

export const createEvent = async (data: IAthleticsEvent): Promise<IAthleticsEvent> => {
  const res = await fetch(`${BASE_URL}/athletics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return parseResponse<IAthleticsEvent>(res, "Failed to create athletics event");
};

export const updateEvent = async (
  event_id: number,
  data: IAthleticsEvent
): Promise<IAthleticsEvent> => {
  const res = await fetch(`${BASE_URL}/athletics/${event_id}?gender=${data.gender}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return parseResponse<IAthleticsEvent>(res, "Failed to update athletics event");
};

export const deleteEvent = async (
  event_id: number,
  gender: AthleticsGender
): Promise<void> => {
  const res = await fetch(`${BASE_URL}/athletics/${event_id}?gender=${gender}`, {
    method: "DELETE"
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.message || "Failed to delete athletics event");
  }
};
