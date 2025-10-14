export default async function NotesFilterPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  const initialTag = slug[0] ?? 'All';
  const NotesClient = (await import('../Notes.client')).default;
  return <NotesClient initialTag={initialTag} />;
}
