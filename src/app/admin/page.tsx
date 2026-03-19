'use client';
import { useState, useEffect } from 'react';
import { Product } from '@/lib/db';
import classes from './page.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Filtros y paginación
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filteredProducts = selectedCategory === 'Todos' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className={classes.dashboard}>
      
      <div className={classes.headerRow}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Catálogo Actual</h1>
        <Link href="/admin/product" className="btn" style={{ fontWeight: 600, padding: '0.6rem 1.25rem' }}>+ Añadir Nuevo Producto</Link>
      </div>

      <div className={classes.filtersRow}>
        <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Filtro de categorías:</span>
        <div className={classes.pillsContainer}>
          {categories.map(cat => (
             <button 
                key={cat} 
                className={`${classes.pill} ${selectedCategory === cat ? classes.pillActive : ''}`}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
              >
                {cat}
              </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Cargando productos...</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>FOTO</th>
                  <th>CATEGORÍA</th>
                  <th>NOMBRE</th>
                  <th>PRECIO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map(p => (
                  <tr key={p.id}>
                    <td>
                      {p.photo ? (
                        <img src={p.photo} alt={p.name} className={classes.thumb} />
                      ) : (
                        <div className={classes.thumbPlaceholder}></div>
                      )}
                    </td>
                    <td><span className={classes.categoryBadge}>{p.category}</span></td>
                    <td style={{ fontWeight: 500, color: 'var(--foreground)' }}>{p.name}</td>
                    <td>Bs. {p.price.toFixed(2)}</td>
                    <td>
                      <div className={classes.actions}>
                        <button className="btn btn-secondary" onClick={() => router.push(`/admin/product?id=${p.id}`)}>Editar</button>
                        <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No se encontraron productos en esta categoría o el catálogo está vacío.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className={classes.pagination}>
                <button 
                  className={`btn btn-secondary`} 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={currentPage === 1 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  Anterior
                </button>
                <span className={classes.pageInfo}>Página <strong>{currentPage}</strong> de {totalPages}</span>
                <button 
                  className={`btn btn-secondary`} 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={currentPage === totalPages ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
