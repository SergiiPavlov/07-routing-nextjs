// app/notes/[id]/page.tsx
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { fetchNoteById } from '@/lib/api';
import NoteDetailsClient from './NoteDetails.client';

export default async function NoteDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ якщо ваш проект теж вимагає await для params
  const idNum = Number(id);
  const keyId = Number.isFinite(idNum) ? idNum : id;

  const qc = new QueryClient();
  await qc.prefetchQuery({
    queryKey: ['note', { id: keyId }],
    queryFn: () => fetchNoteById(id), // в API — рядковий id
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <NoteDetailsClient />
    </HydrationBoundary>
  );
}
