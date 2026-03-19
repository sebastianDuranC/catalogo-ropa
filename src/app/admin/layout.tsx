import Link from 'next/link';
import classes from './layout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={classes.adminLayout}>
      <aside className={classes.sidebar}>
        <div className={classes.logo}>
          <h2>Catálogo Admin</h2>
        </div>
        <nav className={classes.nav}>
          <Link href="/admin" className={classes.link}>Productos</Link>
          <Link href="/admin/settings" className={classes.link}>Configuración</Link>
          <hr className={classes.divider} />
          <Link href="/" className={classes.link} target="_blank">Ver Catálogo</Link>
        </nav>
      </aside>
      <main className={classes.mainContent}>
        {children}
      </main>
    </div>
  );
}
