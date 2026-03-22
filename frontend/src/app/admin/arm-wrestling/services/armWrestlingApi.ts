import { ArmWrestlingGender, IArmWrestlingEvent } from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

const parseResponse = async <T>(res: Response, fallbackMessage: string): Promise<T> => {
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(payload?.message || fallbackMessage);
  }
  return (payload?.data ?? payload) as T;
};

export const getEvents = async (gender: ArmWrestlingGender): Promise<IArmWrestlingEvent[]> => {
  const res = await fetch(`${BASE_URL}/arm-wrestling?gender=${gender}`);
  return parseResponse<IArmWrestlingEvent[]>(res, "Failed to fetch arm wrestling events");
};

export const getEvent = async (
  event_id: number,
  gender: ArmWrestlingGender
): Promise<IArmWrestlingEvent> => {
  const res = await fetch(`${BASE_URL}/arm-wrestling/${event_id}?gender=${gender}`);
  return parseResponse<IArmWrestlingEvent>(res, `Failed to fetch arm wrestling event ${event_id}`);
};

export const createEvent = async (data: IArmWrestlingEvent): Promise<IArmWrestlingEvent> => {
  const res = await fetch(`${BASE_URL}/arm-wrestling`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return parseResponse<IArmWrestlingEvent>(res, "Failed to create arm wrestling event");
};

export const updateEvent = async (
  event_id: number,
  data: IArmWrestlingEvent
): Promise<IArmWrestlingEvent> => {
  const res = await fetch(`${BASE_URL}/arm-wrestling/${event_id}?gender=${data.gender}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return parseResponse<IArmWrestlingEvent>(res, "Failed to update arm wrestling event");
};

export const deleteEvent = async (
  event_id: number,
  gender: ArmWrestlingGender
): Promise<void> => {
  const res = await fetch(`${BASE_URL}/arm-wrestling/${event_id}?gender=${gender}`, {
    method: "DELETE"
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.message || "Failed to delete arm wrestling event");
  }
};
