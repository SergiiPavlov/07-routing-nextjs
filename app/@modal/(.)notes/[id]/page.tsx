import NotePreviewClient from './NotePreview.client';

interface NotePreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function NotePreviewPage({ params }: NotePreviewPageProps) {
  const { id } = await params;
  return <NotePreviewClient id={String(id)} />;
}
