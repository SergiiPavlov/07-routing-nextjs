import NotesClient from '../Notes.client';

interface NotesFilterPageProps {
  params: { slug?: string[] };
}

export default function NotesFilterPage({ params }: NotesFilterPageProps) {
  const { slug = [] } = params;
  const initialTag = slug[0] ?? 'All';

  return <NotesClient initialTag={initialTag} />;
}
