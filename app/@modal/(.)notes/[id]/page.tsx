'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import NotePreview from '@/components/NotePreview/NotePreview';

interface ModalNotePageProps {
  params: Promise<{ id: string }>;
}

export default async function ModalNotePage({ params }: ModalNotePageProps) {
  const { id } = await params;
  // Renders a client-driven preview; fetch happens inside NotePreview
  // We keep this as an async server boundary to comply with Next 15 params API
  return <NotePreview id={id} />;
}
