'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import classes from './page.module.css';

async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Variables de entorno de Cloudinary no configuradas.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'catalogo-ropa');

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Upload failed');
  }

  const data = await response.json();
  return data.secure_url;
}

function ProductFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [formData, setFormData] = useState({
    photo: '', name: '', description: '', size: '', color: '', price: '', category: ''
  });
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load categories and product (if editing)
  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {});

    if (id) {
      fetch(`/api/products/${id}`)
        .then(res => { if (!res.ok) throw new Error(); return res.json(); })
        .then(data => {
          setFormData({
            photo: data.photo || '', name: data.name || '',
            description: data.description || '', size: data.size || '',
            color: data.color || '', price: data.price?.toString() || '',
            category: data.category || ''
          });
          if (data.photo) setPreview(data.photo);
          setLoading(false);
        })
        .catch(() => { alert('Producto no encontrado'); router.push('/admin'); });
    }
  }, [id, router]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) { setUploadError('Solo se permiten imágenes.'); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadError('La imagen no puede superar los 10 MB.'); return; }

    setUploadError('');
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const url = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, photo: url }));
    } catch (err: any) {
      setUploadError(err.message || 'Error al subir la imagen.');
      setPreview(formData.photo);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return alert('Espera a que la foto termine de subir.');
    setSaving(true);
    const url = id ? `/api/products/${id}` : '/api/products';
    await fetch(url, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, price: Number(formData.price) || 0 })
    });
    setSaving(false);
    router.push('/admin');
  };

  if (loading) return <p style={{ padding: '2rem' }}>Cargando datos del producto...</p>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/admin" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>← Volver</Link>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{id ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h1>
      </div>
      
      <div className="card" style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit} className={classes.formGrid}>

          {/* Upload foto */}
          <div className={classes.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label>Foto del Producto</label>
            <div className={classes.uploadArea} onClick={() => !uploading && fileInputRef.current?.click()}>
              {preview ? (
                <img src={preview} alt="Vista previa" className={classes.previewImage} />
              ) : (
                <div className={classes.uploadPlaceholder}>
                  <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#94a3b8">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p>Haz clic para subir una foto</p>
                  <span>JPG, PNG o WEBP · Máx. 10 MB</span>
                </div>
              )}
              {uploading && (
                <div className={classes.uploadOverlay}>
                  <div className={classes.spinner}></div>
                  <p>Subiendo imagen...</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            {uploadError && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
                ⚠️ {uploadError}
              </p>
            )}
            {preview && !uploading && (
              <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} style={{ marginTop: '0.5rem', width: 'fit-content', fontSize: '0.875rem', padding: '0.45rem 0.85rem' }}>
                Cambiar foto
              </button>
            )}
          </div>

          <div className={classes.inputGroup}>
            <label>Nombre del Producto *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej: Camiseta Básica" />
          </div>

          {/* Categoría como SELECT */}
          <div className={classes.inputGroup}>
            <label>Categoría *</label>
            {categories.length > 0 ? (
              <div className={classes.selectWrapper}>
                <select
                  required
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="" disabled>— Selecciona una categoría —</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #fde68a', backgroundColor: '#fffbeb', fontSize: '0.875rem', color: '#92400e' }}>
                ⚠️ Debes crear categorías primero en{' '}
                <Link href="/admin/categories" style={{ fontWeight: 700, textDecoration: 'underline', color: '#4338ca' }}>Gestión de Categorías</Link>
              </div>
            )}
          </div>

          <div className={classes.inputGroup}>
            <label>Precio (Bs.) *</label>
            <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="25.50" />
          </div>
          <div className={classes.inputGroup}>
            <label>Talla *</label>
            <input required type="text" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} placeholder="Ej: M, L, Unica" />
          </div>
          <div className={classes.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label>Color *</label>
            <input required type="text" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} placeholder="Ej: Azul Clásico" />
          </div>
          <div className={classes.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label>Descripción *</label>
            <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Detalles de la prenda..." />
          </div>
          
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="submit" className="btn" disabled={uploading || saving} style={{ padding: '0.75rem 2rem', opacity: (uploading || saving) ? 0.7 : 1 }}>
              {saving ? 'Guardando...' : id ? 'Actualizar Producto' : 'Guardar Producto'}
            </button>
            <Link href="/admin" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductForm() {
  return (
    <Suspense fallback={<p style={{ padding: '2rem' }}>Cargando página...</p>}>
      <ProductFormContent />
    </Suspense>
  );
}
