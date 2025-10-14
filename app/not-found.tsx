import css from './Home.module.css';

export default function NotFound() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 className={css.title}>404 - Page not found</h1>
      <p className={css.description}>Sorry, the page you are looking for does not exist.</p>
    </div>
  );
}
