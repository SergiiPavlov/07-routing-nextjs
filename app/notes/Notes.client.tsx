'use client';

import css from './NotesPage.module.css';
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchNotes, type FetchNotesResponse } from '@/lib/api';
import SearchBox from '@/components/SearchBox/SearchBox';
import Pagination from '@/components/Pagination/Pagination';
import NoteList from '@/components/NoteList/NoteList';
import Modal from '@/components/Modal/Modal';
import NoteForm from '@/components/NoteForm/NoteForm';
import { useDebounce } from 'use-debounce';
import { Toaster, toast } from 'react-hot-toast';

type NotesClientProps = {
  initialSearch: string;
  initialPage: number;
};

export default function NotesClient({ initialSearch, initialPage }: NotesClientProps) {
  const [search, setSearch] = useState(initialSearch ?? '');
  const [page, setPage] = useState<number>(initialPage ?? 1);
  const [isOpen, setIsOpen] = useState(false);
  const [searchSubmitTick, setSearchSubmitTick] = useState(0);

  // debounce поиска
  const [debouncedSearch] = useDebounce(search, 400);

  const queryKey = useMemo(
    () => ['notes', { search: debouncedSearch, page }],
    [debouncedSearch, page]
  );

  const { data, isPending, error } = useQuery<FetchNotesResponse>({
    queryKey,
    queryFn: (_ctx) => fetchNotes({ search: debouncedSearch, page, perPage: 12 }),
  });

  useEffect(() => {
    if (searchSubmitTick > 0 && data && Array.isArray(data.notes) && data.notes.length === 0) {
      toast.error('Нічого не знайдено за запитом');
    }
  }, [searchSubmitTick, data]);

  const totalPages = data?.totalPages ?? 1;
  const currentPage = page; // локальный page — для мгновенной подсветки активной страницы

  return (
    <div className={css.app}>
      <Toaster position="top-right" />

      <header className={css.toolbar}>
        <SearchBox
          value={search}
          onChange={(v: string) => {
            setSearch(v);
            setPage(1); // при новом поиске возвращаемся на первую страницу
          }}
          // ВАЖНО: передаём коллбек с параметром, как требует тип (value: string) => void
          onEnter={(_v: string) => setSearchSubmitTick((t) => t + 1)}
        />
        <button className={css.button} onClick={() => setIsOpen(true)}>
          Create note +
        </button>
      </header>

      {/* Пагинация НАД карточками */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p: number) => setPage(p)}
        />
      )}

      {/* Состояния по ТЗ */}
      {isPending && <p>Loading, please wait...</p>}
      {error && <p>Could not fetch the list of notes. {error instanceof Error ? error.message : ''}</p>}

      {/* Список заметок */}
      <NoteList notes={data?.notes ?? []} />

      {/* Модалка создания */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <NoteForm onCreated={() => setIsOpen(false)} onCancel={() => setIsOpen(false)} />
      </Modal>
    </div>
  );
}
