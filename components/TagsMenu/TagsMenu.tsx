'use client';
import Link from 'next/link';
import css from './TagsMenu.module.css';
import type { NoteTag } from '@/types/note';

// Поддерживаемое множество тегов (совпадает с типом NoteTag)
const NOTE_TAGS: NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'];

const ALL = 'All';

export default function TagsMenu() {
  const tags = [ALL, ...NOTE_TAGS];
  return (
    <div className={css.menuContainer}>
      <button className={css.menuButton}>Notes ▾</button>
      <ul className={css.menuList}>
        {tags.map(tag => (
          <li key={tag} className={css.menuItem}>
            <Link
              href={`/notes/filter/${encodeURIComponent(tag)}`}
              className={css.menuLink}
            >
              {tag === ALL ? 'All notes' : tag}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
