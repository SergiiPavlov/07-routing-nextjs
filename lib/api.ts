import axios from 'axios';
import type { Note, NoteTag } from '@/types/note';

export type NoteListResponse = {
  notes: Note[];
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || 'https://goit-notehub.ivariv.dev',
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_NOTEHUB_TOKEN ?? ''}`,
  },
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

export async function fetchNotes(params: FetchNotesParams = {}): Promise<NoteListResponse> {
  const { search = '', page = 1, perPage = 12, tag } = params;
  const query: Record<string, string | number> = { page, perPage };
  if (search.trim()) query.search = search.trim();
  if (tag && (tag as unknown as string) !== 'All') (query as any).tag = tag;

  const res = await api.get('/notes', { params: query });
  return normalizeFetchResponse(res.data);
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
