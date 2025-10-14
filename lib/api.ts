import axios from 'axios';
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
if (!resolvedBaseURL.startsWith('/api')) {
  defaultHeaders.Authorization = `Bearer ${process.env.NEXT_PUBLIC_NOTEHUB_TOKEN ?? ''}`;
}

export const api = axios.create({
  baseURL: resolvedBaseURL,
  headers: defaultHeaders,
});

export function normalizeNote(data: any): Note {
  return {
    id: String(data.id),
    title: String(data.title ?? ''),
    content: String(data.content ?? ''),
    tag: (data.tag as NoteTag) ?? 'Todo',
    createdAt: String(data.createdAt ?? ''),
    updatedAt: String(data.updatedAt ?? ''),
  };
}

export function normalizeFetchResponse(data: any): NoteListResponse {
  const src = Array.isArray(data?.items) ? data.items : Array.isArray(data?.notes) ? data.notes : [];
  const notes: Note[] = src.map(normalizeNote);
  const page = Number(data?.page ?? 1);
  const perPage = Number(data?.perPage ?? 12);
  const totalPages = Number(data?.totalPages ?? 1);
  const totalItems = Number(data?.totalItems ?? notes.length);
  return { page, perPage, totalPages, totalItems, notes };
}

export type FetchNotesParams = {
  search?: string;
  page?: number;
  perPage?: number;
  tag?: NoteTag; // 'All' НЕ отправляем
};

export async function fetchNotes(params: { page?: number; perPage?: number; search?: string; tag?: string } = {}) {
  const { page = 1, perPage = 12, search = '', tag } = params;
  const q: Record<string, any> = { page, perPage };
  if (search && search.trim()) q.search = search.trim();
  if (tag && tag !== 'All') q.tag = tag;
  const res = await api.get('/notes', { params: q });
  const data = res.data;
  const items = Array.isArray(data?.items) ? data.items : Array.isArray(data?.notes) ? data.notes : [];
  const totalItems = Number(data?.totalItems ?? data?.total ?? items.length);
  const totalPages = Number(data?.totalPages ?? Math.max(1, Math.ceil(totalItems / perPage)));
  return {
    notes: items.map((n: any) => ({
      id: String(n.id ?? n._id ?? ''),
      title: String(n.title ?? ''),
      content: String(n.content ?? ''),
      tag: String(n.tag ?? 'Todo'),
      createdAt: String(n.createdAt ?? n.created_at ?? ''),
      updatedAt: String(n.updatedAt ?? n.updated_at ?? ''),
    })),
    page,
    perPage,
    totalPages,
    totalItems,
  };
}

export async function fetchNoteById(id: string): Promise<Note> {
  const res = await api.get(`/notes/${id}`);
  return normalizeNote(res.data);
}

export async function createNote(payload: { title: string; content: string; tag: NoteTag }): Promise<Note> {
  const res = await api.post('/notes', payload);
  return normalizeNote(res.data);
}

export async function updateNote(
  id: string,
  payload: Partial<{ title: string; content: string; tag: NoteTag }>
): Promise<Note> {
  const res = await api.patch(`/notes/${id}`, payload);
  return normalizeNote(res.data);
}

export async function deleteNote(id: string): Promise<{ success: boolean }> {
  await api.delete(`/notes/${id}`);
  return { success: true };
}

export type FetchNotesResponse = NoteListResponse;
