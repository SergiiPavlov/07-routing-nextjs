'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Modal from '@/components/Modal/Modal';
import NotePreview from '@/components/NotePreview/NotePreview';
import { fetchNoteById } from '@/lib/api';

export default async function NotePreviewIntercept() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const numericId = Number(id);
  const keyId = Number.isFinite(numericId) ? numericId : id;

  const { data: note, isPending, error } = useQuery({
    queryKey: ['note', { id: keyId }],
    queryFn: () => fetchNoteById(id),
    refetchOnMount: false,
  });

  const handleClose = () => router.back();

  return (
    <Modal isOpen onClose={handleClose}>
      {isPending ? (
        <p>Loading...</p>
      ) : error || !note ? (
        <p>Something went wrong.</p>
      ) : (
        <NotePreview note={note} onClose={handleClose} />
      )}
    </Modal>
  );
}
