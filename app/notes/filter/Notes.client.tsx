'use client';

import css from './NotesPage.module.css';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchNotes, type FetchNotesResponse } from '@/lib/api';
import SearchBox from '@/components/SearchBox/SearchBox';
import Pagination from '@/components/Pagination/Pagination';
import NoteList from '@/components/NoteList/NoteList';
import { useDebounce } from 'use-debounce';
import { Toaster } from 'react-hot-toast';

type Props = {
  initialTag?: string | null;
};

export default function NotesClient({ initialTag }: Props) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [debounced] = useDebounce(search, 300);

  const tagForQuery = useMemo(() => {
    if (!initialTag) return undefined;
    if (initialTag === 'All') return undefined;
    return initialTag as any;
  }, [initialTag]);

  const { data, isLoading, error } = useQuery<FetchNotesResponse>({
    queryKey: ['notes', { search: debounced, page, tag: tagForQuery }],
    queryFn: () => fetchNotes({ search: debounced, page, perPage: 12, tag: tagForQuery as any }),
    keepPreviousData: true,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className={css.container}>
      <h1 className={css.title}>Notes</h1>
      <Toaster />
      <SearchBox value={search} onChange={setSearch} placeholder="Search notes..." />
      {error ? (
        <p className={css.error}>Something went wrong.</p>
      ) : isLoading ? (
        <p>Loading, please wait...</p>
      ) : (
        <NoteList notes={items} />
      )}
      <Pagination
        total={total}
        page={page}
        perPage={12}
        onPageChange={setPage}
      />
    </div>
  );
}
