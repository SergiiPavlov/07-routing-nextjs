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

// При прямом обращении к публичному API добавляем Authorization ТОЛЬКО если токен реально есть
if (!resolvedBaseURL.startsWith('/api')) {
  const token = process.env.NEXT_PUBLIC_NOTEHUB_TOKEN?.trim();
  if (token) defaultHeaders.Authorization = `Bearer ${token}`;
}

export const api = axios.create({
  baseURL: resolvedBaseURL,
  headers: defaultHeaders,
});

export function normalizeNote(data: any): Note {
  return {
    id: String(data?.id ?? data?._id ?? ''),
    title: String(data?.title ?? ''),
    content: String(data?.content ?? ''),
    tag: (data?.tag as NoteTag) ?? 'Todo',
    createdAt: String(data?.createdAt ?? data?.created_at ?? ''),
    updatedAt: String(data?.updatedAt ?? data?.updated_at ?? ''),
  };
}

export type FetchNotesResponse = NoteListResponse;

export type FetchNotesParams = {
  search?: string;
  page?: number;
  perPage?: number;
  tag?: NoteTag | 'All'; // 'All' НЕ отправляем на бэкенд
};

export async function fetchNotes({
  page = 1,
  perPage = 12,
  search = '',
  tag,
}: FetchNotesParams = {}): Promise<FetchNotesResponse> {
  const params: Record<string, any> = { page, perPage };

  if (search && search.trim()) params.search = search.trim();
  if (tag && tag !== 'All') params.tag = tag;

  const res = await api.get('/notes', { params });
  const data = res.data ?? {};

  const items = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.notes)
      ? data.notes
      : [];

  const totalItems = Number(data?.totalItems ?? data?.total ?? items.length);
  const totalPages = Number(data?.totalPages ?? Math.max(1, Math.ceil(totalItems / perPage)));

  return {
    notes: items.map(normalizeNote),
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
