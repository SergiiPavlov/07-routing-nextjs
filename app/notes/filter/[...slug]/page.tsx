import NotesClient from './Notes.client';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { fetchNotes } from '@/lib/api';
import type { NoteTag } from '@/types/note';

const TAGS: readonly NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'] as const;

interface NotesFilterPageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function NotesFilterPage({ params }: NotesFilterPageProps) {
  const { slug = [] } = await params;
  const initialTag = slug[0] ?? 'All';

  // 'All' не відправляємо на бекенд
  const tagForQuery = (TAGS as readonly string[]).includes(initialTag) ? (initialTag as NoteTag) : undefined;

  // SSR prefetch
  const qc = new QueryClient();
  const queryKey = ['notes', { search: '', page: 1, tag: initialTag ?? 'All' }];

  await qc.prefetchQuery({
    queryKey,
    queryFn: () =>
      fetchNotes({
        search: '',
        page: 1,
        perPage: 12,
        tag: tagForQuery,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <NotesClient initialTag={initialTag} />
    </HydrationBoundary>
  );
}
