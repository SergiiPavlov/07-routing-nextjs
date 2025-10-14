import { NextRequest } from 'next/server';
import {
  buildNotehubUrl,
  createNotehubHeaders,
  handleNotehubProxyError,
  relayNotehubResponse,
} from '../utils';

export async function GET(req: NextRequest) {
  const url = buildNotehubUrl('/notes', req.nextUrl.searchParams);

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

export async function POST(req: NextRequest) {
  const url = buildNotehubUrl('/notes');
  const body = await req.text();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: createNotehubHeaders({ 'content-type': 'application/json' }),
      body,
      cache: 'no-store',
    });
    return await relayNotehubResponse(response);
  } catch (error) {
    return handleNotehubProxyError(error);
  }
}
