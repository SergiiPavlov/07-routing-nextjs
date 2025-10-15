import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type { Note, NoteTag } from '@/types/note';

/** Canonical list response used throughout the app */
export type NoteListResponse = {
  notes: Note[];
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
};

/** Raw API list response shape (server can return items or notes) */
type NoteListResponseServer = {
  items?: Note[];
  notes?: Note[];
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
};

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE ?? '').trim() || '/api/notehub';
const DIRECT_API = /^https?:\/\//i.test(BASE_URL);

/** Create axios instance once */
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** If we call the public API directly, attach Authorization from NEXT_PUBLIC_NOTEHUB_TOKEN */
if (DIRECT_API) {
  const token = (process.env.NEXT_PUBLIC_NOTEHUB_TOKEN ?? '').trim();
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
}

/** ———————————————————————————————————————————————————————
 * Normalizers (defensive in case of partial/malformed data)
 * ——————————————————————————————————————————————————————— */
export function normalizeNote(data: unknown): Note {
  const d = (data ?? {}) as Partial<Record<string, any>>;
  const safeTag: NoteTag =
    d.tag && ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'].includes(String(d.tag))
      ? (String(d.tag) as NoteTag)
      : 'Todo';

  return {
    id: String(d.id ?? ''),
    title: String(d.title ?? ''),
    content: String(d.content ?? ''),
    tag: safeTag,
    createdAt: String(d.createdAt ?? d.created_at ?? ''),
    updatedAt: String(d.updatedAt ?? d.updated_at ?? ''),
  };
}

export function normalizeFetchResponse(data: NoteListResponseServer): NoteListResponse {
  const raw = data?.items ?? data?.notes ?? [];
  const notes = raw.map(normalizeNote);
  const page = Number(data?.page ?? 1);
  const perPage = Number(data?.perPage ?? 12);
  const totalItems = Number(data?.totalItems ?? notes.length);
  const totalPages = Number(data?.totalPages ?? Math.max(1, Math.ceil(totalItems / Math.max(perPage, 1))));
  return { notes, page, perPage, totalItems, totalPages };
}

/** ———————————————————————————————————————————————————————
 * API functions (explicit Axios generics everywhere)
 * ——————————————————————————————————————————————————————— */

/** List notes with pagination, search and optional tag (omit tag when 'All') */
export async function fetchNotes(params: {
  page?: number;
  perPage?: number;
  search?: string;
  tag?: string | NoteTag;
} = {}): Promise<NoteListResponse> {
  const { page = 1, perPage = 12, search = '', tag } = params;
  const sendTag = tag && tag !== 'All' ? String(tag) : undefined;

  const res: AxiosResponse<NoteListResponseServer> = await api.get<NoteListResponseServer>('/notes', {
    params: {
      page,
      perPage,
      search: search || undefined,
      tag: sendTag,
    },
  });

  return normalizeFetchResponse(res.data);
}

/** Get a single note by id */
export async function fetchNoteById(id: string): Promise<Note> {
  const res: AxiosResponse<Note> = await api.get<Note>(`/notes/${id}`);
  return normalizeNote(res.data);
}

/** Create a new note */
export async function createNote(payload: { title: string; content: string; tag: NoteTag }): Promise<Note> {
  const res: AxiosResponse<Note> = await api.post<Note>('/notes', payload);
  return normalizeNote(res.data);
}

/** Update an existing note */
export async function updateNote(
  id: string,
  payload: Partial<{ title: string; content: string; tag: NoteTag }>
): Promise<Note> {
  const res: AxiosResponse<Note> = await api.patch<Note>(`/notes/${id}`, payload);
  return normalizeNote(res.data);
}

/** Delete a note and return the deleted note (reviewer requirement) */
export async function deleteNote(id: string): Promise<Note> {
  const res: AxiosResponse<Note> = await api.delete<Note>(`/notes/${id}`);
  return normalizeNote(res.data);
}

export type FetchNotesResponse = NoteListResponse;
