'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/lib/db';
import classes from './page.module.css';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() })
    });
    setNewName('');
    setSaving(false);
    fetchCategories();
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;
    setSaving(true);
    await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingName.trim() })
    });
    setEditingId(null);
    setEditingName('');
    setSaving(false);
    fetchCategories();
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar la categoría "${name}"?\nLos productos con esta categoría NO se eliminarán, solo perderán la referencia.`)) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  return (
    <div>
      <div className={classes.headerRow}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Categorías</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gestiona las categorías disponibles para tus productos</p>
        </div>
      </div>

      {/* Formulario para agregar */}
      <div className="card" style={{ maxWidth: 500, marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.25rem', fontSize: '1.1rem', fontWeight: 700 }}>Nueva Categoría</h2>
        <form onSubmit={handleAdd} className={classes.addForm}>
          <input
            required
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Ej: Vestidos, Chaquetas, Accesorios..."
            style={{ flex: 1, padding: '0.75rem 1rem', border: '1.5px solid var(--border)', borderRadius: '0.6rem', fontSize: '1rem', fontFamily: 'inherit' }}
          />
          <button type="submit" className="btn" disabled={saving} style={{ padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}>
            {saving ? 'Guardando...' : '+ Agregar'}
          </button>
        </form>
      </div>

      {/* Lista */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', maxWidth: 700 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
          <h2 style={{ fontWeight: 700, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
            CATEGORÍAS EXISTENTES ({categories.length})
          </h2>
        </div>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</p>
        ) : categories.length === 0 ? (
          <p style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Aún no hay categorías. ¡Agrega la primera arriba!
          </p>
        ) : (
          <ul className={classes.categoryList}>
            {categories.map(cat => (
              <li key={cat.id} className={classes.categoryItem}>
                {editingId === cat.id ? (
                  <div className={classes.editRow}>
                    <input
                      type="text"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleUpdate(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                      autoFocus
                      style={{ flex: 1, padding: '0.6rem 0.85rem', border: '1.5px solid #4338ca', borderRadius: '0.5rem', fontSize: '0.95rem', fontFamily: 'inherit' }}
                    />
                    <button className="btn" onClick={() => handleUpdate(cat.id)} disabled={saving} style={{ padding: '0.6rem 1.1rem', fontSize: '0.875rem' }}>✓ Guardar</button>
                    <button className="btn btn-secondary" onClick={() => setEditingId(null)} style={{ padding: '0.6rem 0.85rem', fontSize: '0.875rem' }}>✕</button>
                  </div>
                ) : (
                  <div className={classes.viewRow}>
                    <div className={classes.catInfo}>
                      <span className={classes.catDot}></span>
                      <span className={classes.catName}>{cat.name}</span>
                    </div>
                    <div className={classes.catActions}>
                      <button className="btn btn-secondary" onClick={() => startEdit(cat)} style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}>Editar</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(cat.id, cat.name)} style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}>Eliminar</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
