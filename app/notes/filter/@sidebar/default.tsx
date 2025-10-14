import Link from 'next/link';
import css from './SidebarNotes.module.css';

const TAGS = ['All', 'Todo', 'Work', 'Personal', 'Meeting', 'Shopping'] as const;

export default function SidebarNotes() {
  return (
    <nav aria-label="Filter notes by tag">
      <ul className={css.menuList}>
        {TAGS.map((tag) => (
          <li key={tag} className={css.menuItem}>
            <Link href={`/notes/filter/${encodeURIComponent(tag)}`} className={css.menuLink}>
              {tag === 'All' ? 'All notes' : tag}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
