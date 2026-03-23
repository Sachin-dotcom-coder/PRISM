import { CarromGender, ICarromEvent } from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

const parseResponse = async <T>(res: Response, fallbackMessage: string): Promise<T> => {
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(payload?.message || fallbackMessage);
  }
  return (payload?.data ?? payload) as T;
};

export const getEvents = async (gender: CarromGender): Promise<ICarromEvent[]> => {
  const res = await fetch(`${BASE_URL}/carrom?gender=${gender}`);
  return parseResponse<ICarromEvent[]>(res, "Failed to fetch carrom events");
};

export const getEvent = async (
  event_id: number,
  gender: CarromGender
): Promise<ICarromEvent> => {
  const res = await fetch(`${BASE_URL}/carrom/${event_id}?gender=${gender}`);
  return parseResponse<ICarromEvent>(res, `Failed to fetch carrom event ${event_id}`);
};

export const createEvent = async (data: ICarromEvent): Promise<ICarromEvent> => {
  const res = await fetch(`${BASE_URL}/carrom`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return parseResponse<ICarromEvent>(res, "Failed to create carrom event");
};

export const updateEvent = async (
  event_id: number,
  data: ICarromEvent
): Promise<ICarromEvent> => {
  const res = await fetch(`${BASE_URL}/carrom/${event_id}?gender=${data.gender}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return parseResponse<ICarromEvent>(res, "Failed to update carrom event");
};

export const deleteEvent = async (
  event_id: number,
  gender: CarromGender
): Promise<void> => {
  const res = await fetch(`${BASE_URL}/carrom/${event_id}?gender=${gender}`, {
    method: "DELETE"
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.message || "Failed to delete carrom event");
  }
};
