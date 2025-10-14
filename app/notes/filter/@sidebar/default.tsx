import css from './SidebarNotes.module.css';

const TAGS = ['All', 'Todo', 'Work', 'Personal', 'Meeting', 'Shopping'] as const;

export default function SidebarNotesDefault() {
  return (
    <nav aria-label="Filter by tag">
      <ul className={css.menuList}>
        {TAGS.map(tag => (
          <li key={tag} className={css.menuItem}>
            <a href={`/notes/filter/${encodeURIComponent(tag)}`} className={css.menuLink}>
              {tag === 'All' ? 'All notes' : tag}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
