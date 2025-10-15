'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { Toaster, toast } from 'react-hot-toast';
import css from '../NotesPage.module.css';
import SearchBox from '@/components/SearchBox/SearchBox';
import Pagination from '@/components/Pagination/Pagination';
import NoteList from '@/components/NoteList/NoteList';
import Modal from '@/components/Modal/Modal';
import NoteForm from '@/components/NoteForm/NoteForm';
import { fetchNotes, type FetchNotesResponse } from '@/lib/api';
import type { NoteTag } from '@/types/note';

const PER_PAGE = 12;
const AVAILABLE_TAGS: NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'];

type NotesClientProps = {
  initialTag?: string | null;
};

function isNoteTag(tag: string | null | undefined): tag is NoteTag {
  return Boolean(tag && AVAILABLE_TAGS.includes(tag as NoteTag));
}

export default function NotesClient({ initialTag }: NotesClientProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchSubmitTick, setSearchSubmitTick] = useState(0);
  const [debouncedSearch] = useDebounce(search, 400);

  const tagForQuery = useMemo<NoteTag | undefined>(
    () => (isNoteTag(initialTag) ? initialTag : undefined),
    [initialTag]
  );

  // при зміні тега — скидаємо пошук і сторінку
  useEffect(() => {
    setPage(1);
    setSearch('');
  }, [tagForQuery]);

  const queryKey = useMemo(
    () => ['notes', { search: debouncedSearch, page, tag: tagForQuery ?? 'All' }],
    [debouncedSearch, page, tagForQuery]
  );

  const { data, isPending, error } = useQuery<FetchNotesResponse>({
    queryKey,
    queryFn: () =>
      fetchNotes({
        search: debouncedSearch,
        page,
        perPage: PER_PAGE,
        tag: tagForQuery, // 'All' не відправляємо
      }),
    // v5-еквівалент старого keepPreviousData: true
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (searchSubmitTick > 0 && data && data.notes.length === 0) {
      toast.error('Nothing was found for your request.');
    }
  }, [searchSubmitTick, data]);

  const totalPages = data?.totalPages ?? 1;

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSearchSubmit = (_value: string) => {
    setSearchSubmitTick((tick) => tick + 1);
  };

  const closeModal = () => setIsCreateOpen(false);

  return (
    <div className={css.app}>
      <Toaster position="top-right" />

      <header className={css.toolbar}>
        <SearchBox value={search} onChange={handleSearchChange} onEnter={handleSearchSubmit} />
        <button type="button" className={css.button} onClick={() => setIsCreateOpen(true)}>
          Create note +
        </button>
      </header>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />

      {isPending && <p>Loading, please wait...</p>}
      {error && (
        <p>
          Could not fetch the list of notes.
          {error instanceof Error ? ` ${error.message}` : ''}
        </p>
      )}

      <NoteList notes={data?.notes ?? []} />

      <Modal isOpen={isCreateOpen} onClose={closeModal}>
        <NoteForm onCreated={closeModal} onCancel={closeModal} />
      </Modal>
    </div>
  );
}
