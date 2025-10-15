import type { NextRequest } from 'next/server';
import {
  buildNotehubUrl,
  createNotehubHeaders,
  handleNotehubProxyError,
  relayNotehubResponse,
} from '../../utils';

// Next.js 15: второй аргумент должен иметь params: Promise<...>
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = buildNotehubUrl(`/notes/${encodeURIComponent(String(id))}`);

  try {
    const response = await fetch(url, {
      headers: createNotehubHeaders(),
      cache: 'no-store',
    });
    return await relayNotehubResponse(response);
  } catch (error) {
    return handleNotehubProxyError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = buildNotehubUrl(`/notes/${encodeURIComponent(String(id))}`);
  const body = await req.text();

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: createNotehubHeaders({ 'content-type': 'application/json' }),
      body,
      cache: 'no-store',
    });
    return await relayNotehubResponse(response);
  } catch (error) {
    return handleNotehubProxyError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = buildNotehubUrl(`/notes/${encodeURIComponent(String(id))}`);

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: createNotehubHeaders(),
      cache: 'no-store',
    });
    return await relayNotehubResponse(response);
  } catch (error) {
    return handleNotehubProxyError(error);
  }
}
