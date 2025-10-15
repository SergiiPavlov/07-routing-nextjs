import NotesClient from '../Notes.client';

interface NotesFilterPageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function NotesFilterPage({ params }: NotesFilterPageProps) {
  const { slug = [] } = await params;
  const initialTag = slug[0] ?? 'All';

  return <NotesClient initialTag={initialTag} />;
}
