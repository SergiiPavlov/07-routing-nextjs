import { NextRequest } from 'next/server';
import {
  buildNotehubUrl,
  createNotehubHeaders,
  handleNotehubProxyError,
  relayNotehubResponse,
} from '../../utils';

type RouteContext = {
  params: { id: string };
};

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const url = buildNotehubUrl(`/notes/${encodeURIComponent(params.id)}`);

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

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const url = buildNotehubUrl(`/notes/${encodeURIComponent(params.id)}`);
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

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const url = buildNotehubUrl(`/notes/${encodeURIComponent(params.id)}`);

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
