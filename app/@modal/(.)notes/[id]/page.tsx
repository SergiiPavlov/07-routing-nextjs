'use client';

import Modal from '@/components/Modal/Modal';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchNoteById } from '@/lib/api';

export default function NotePreviewIntercept() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { data: note, isLoading, error } = useQuery({
    queryKey: ['note', id],
    queryFn: () => fetchNoteById(id),
    refetchOnMount: false,
  });

  const onClose = () => router.back();

  return (
    <Modal isOpen={true} onClose={onClose}>
      {isLoading ? (
        <p>Loading...</p>
      ) : error || !note ? (
        <p>Something went wrong.</p>
      ) : (
        <div>
          <h2>{note.title}</h2>
          <p>{note.content || 'No content'}</p>
          <p><em>Tag: {note.tag}</em></p>
        </div>
      )}
    </Modal>
  );
}
