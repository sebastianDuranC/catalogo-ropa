'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import classes from './layout.module.css';

const navItems = [
  { href: '/admin', label: 'Productos', icon: '📦' },
  { href: '/admin/settings', label: 'Configuración', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close sidebar on outside click
  useEffect(() => {
    if (!sidebarOpen) return;
    const handle = (e: MouseEvent) => {
      const sidebar = document.getElementById('admin-sidebar');
      const toggle = document.getElementById('sidebar-toggle');
      if (sidebar && !sidebar.contains(e.target as Node) && toggle && !toggle.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [sidebarOpen]);

  return (
    <div className={classes.adminLayout}>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className={classes.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside id="admin-sidebar" className={`${classes.sidebar} ${sidebarOpen ? classes.sidebarOpen : ''}`}>
        <div className={classes.sidebarHeader}>
          <div className={classes.logoWrap}>
            <span className={classes.logoIcon}>👗</span>
            <div>
              <p className={classes.logoTitle}>Catálogo</p>
              <p className={classes.logoSub}>Panel de Admin</p>
            </div>
          </div>
          <button className={classes.closeBtn} onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú">✕</button>
        </div>

        <nav className={classes.nav}>
          <p className={classes.navSection}>MENÚ</p>
          {navItems.map(item => {
            const isActive = item.href === '/admin' ? pathname === '/admin' || pathname.startsWith('/admin/product') : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`${classes.link} ${isActive ? classes.linkActive : ''}`}>
                <span className={classes.linkIcon}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={classes.sidebarFooter}>
          <hr className={classes.divider} />
          <Link href="/" target="_blank" className={`${classes.link} ${classes.linkExternal}`}>
            <span className={classes.linkIcon}>🌐</span>
            Ver Catálogo
            <span className={classes.externalArrow}>↗</span>
          </Link>
        </div>
      </aside>

      {/* Main area */}
      <div className={classes.mainWrapper}>
        {/* Top bar (mobile) */}
        <header className={classes.topbar}>
          <button id="sidebar-toggle" className={classes.hamburger} onClick={() => setSidebarOpen(o => !o)} aria-label="Abrir menú">
            <span /><span /><span />
          </button>
          <span className={classes.topbarTitle}>Panel Admin</span>
          <Link href="/" target="_blank" className={`btn btn-secondary ${classes.topbarCatalogBtn}`} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
            Ver Catálogo ↗
          </Link>
        </header>

        <main className={classes.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
