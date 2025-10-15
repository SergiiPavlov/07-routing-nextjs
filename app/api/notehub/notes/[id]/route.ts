import { NextResponse } from 'next/server';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? '').trim() || 'https://notehub-public.goit.study/api';
const TOKEN = (process.env.NEXT_PUBLIC_NOTEHUB_TOKEN ?? '').trim();

/** Добавляем Authorization ТОЛЬКО при прямом доступе к публичному API и наличии токена */
function withAuth(init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers);
  if (!API_BASE.startsWith('/api') && TOKEN) {
    headers.set('Authorization', `Bearer ${TOKEN}`);
  }
  return { ...init, headers };
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const res = await fetch(`${API_BASE}/notes/${id}`, withAuth());
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${API_BASE}/notes/${id}`, withAuth({
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }));
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const res = await fetch(`${API_BASE}/notes/${id}`, withAuth({ method: 'DELETE' }));
  // сервер может вернуть пустое тело — аккуратно формируем ответ
  let payload: any = { success: res.ok };
  try {
    const text = await res.text();
    if (text) payload = JSON.parse(text);
  } catch {}
  return NextResponse.json(payload, { status: res.status });
}
