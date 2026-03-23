import { ChessGender, IChessEvent } from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

const parseResponse = async <T>(res: Response, fallbackMessage: string): Promise<T> => {
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(payload?.message || fallbackMessage);
  }
  return (payload?.data ?? payload) as T;
};

export const getEvents = async (gender: ChessGender): Promise<IChessEvent[]> => {
  const res = await fetch(`${BASE_URL}/chess?gender=${gender}`);
  return parseResponse<IChessEvent[]>(res, "Failed to fetch chess events");
};

export const getEvent = async (
  event_id: number,
  gender: ChessGender
): Promise<IChessEvent> => {
  const res = await fetch(`${BASE_URL}/chess/${event_id}?gender=${gender}`);
  return parseResponse<IChessEvent>(res, `Failed to fetch chess event ${event_id}`);
};

export const createEvent = async (data: IChessEvent): Promise<IChessEvent> => {
  const res = await fetch(`${BASE_URL}/chess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return parseResponse<IChessEvent>(res, "Failed to create chess event");
};

export const updateEvent = async (
  event_id: number,
  data: IChessEvent
): Promise<IChessEvent> => {
  const res = await fetch(`${BASE_URL}/chess/${event_id}?gender=${data.gender}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return parseResponse<IChessEvent>(res, "Failed to update chess event");
};

export const deleteEvent = async (
  event_id: number,
  gender: ChessGender
): Promise<void> => {
  const res = await fetch(`${BASE_URL}/chess/${event_id}?gender=${gender}`, {
    method: "DELETE"
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.message || "Failed to delete chess event");
  }
};
