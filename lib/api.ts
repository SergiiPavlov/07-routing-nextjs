import axios, { AxiosResponse } from 'axios';
import type { Note, NoteTag } from '@/types/note';

export type NoteListResponse = {
  notes: Note[];
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
};

const resolvedBaseURL = process.env.NEXT_PUBLIC_API_BASE?.trim() || '/api/notehub';

const defaultHeaders: Record<string, string> = {};
// Якщо йдемо напряму на публічний API — додаємо токен
if (!resolvedBaseURL.startsWith('/api')) {
  defaultHeaders.Authorization = `Bearer ${process.env.NEXT_PUBLIC_NOTEHUB_TOKEN ?? ''}`;
}

export const api = axios.create({
  baseURL: resolvedBaseURL,
  headers: defaultHeaders,
});

// ———————————————————————————————————————————————————————————————————
// НОРМАЛІЗАТОРИ (без any в сигнатурах)
export function normalizeNote(data: unknown): Note {
  const d = data as Record<string, unknown>;
  return {
    id: String(d?.id ?? (d as any)?._id ?? ''),
    title: String(d?.title ?? ''),
    content: String(d?.content ?? ''),
    tag: (d?.tag as NoteTag) ?? 'Todo',
    createdAt: String(d?.createdAt ?? ''),
    updatedAt: String(d?.updatedAt ?? ''),
  };
}

export function normalizeFetchResponse(data: unknown): NoteListResponse {
  const d = data as Record<string, unknown>;
  const rawItems =
    Array.isArray((d as any)?.items) ? (d as any).items :
    Array.isArray((d as any)?.notes) ? (d as any).notes : [];

  const notes: Note[] = rawItems.map(normalizeNote);

  const page = Number(d?.page ?? 1);
  const perPage = Number(d?.perPage ?? 12);
  const totalItems = Number(d?.totalItems ?? (d as any)?.total ?? notes.length);
  const totalPages = Number(d?.totalPages ?? Math.max(1, Math.ceil(totalItems / Math.max(perPage, 1))));

  return { page, perPage, totalItems, totalPages, notes };
}

// ———————————————————————————————————————————————————————————————————
// API-ФУНКЦІЇ (з явними дженериками Axios)

export async function fetchNotes(params: {
  page?: number;
  perPage?: number;
  search?: string;
  tag?: string | NoteTag;
} = {}): Promise<NoteListResponse> {
  const { page = 1, perPage = 12, search = '', tag } = params;
  const q: Record<string, string | number> = { page, perPage };
  if (search && search.trim()) q.search = search.trim();
  if (tag && tag !== 'All') q.tag = String(tag);

  const res: AxiosResponse<unknown> = await api.get<unknown>('/notes', { params: q });
  return normalizeFetchResponse(res.data);
}

export async function fetchNoteById(id: string): Promise<Note> {
  const res: AxiosResponse<Note> = await api.get<Note>(`/notes/${id}`);
  return normalizeNote(res.data);
}

export async function createNote(payload: {
  title: string;
  content: string;
  tag: NoteTag;
}): Promise<Note> {
  const res: AxiosResponse<Note> = await api.post<Note>('/notes', payload);
  return normalizeNote(res.data);
}

export async function updateNote(
  id: string,
  payload: Partial<{ title: string; content: string; tag: NoteTag }>
): Promise<Note> {
  const res: AxiosResponse<Note> = await api.patch<Note>(`/notes/${id}`, payload);
  return normalizeNote(res.data);
}

// ⬇️ РЕВ’ЮВЕР-ВИМОГА: deleteNote має повертати об’єкт видаленої нотатки
export async function deleteNote(id: string): Promise<Note> {
  const res: AxiosResponse<Note> = await api.delete<Note>(`/notes/${id}`);
  return normalizeNote(res.data);
}

export type FetchNotesResponse = NoteListResponse;
