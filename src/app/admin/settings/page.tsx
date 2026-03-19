'use client';
import { useState, useEffect } from 'react';
import { BusinessInfo, SocialLink } from '@/lib/db';

export default function Settings() {
  const [data, setData] = useState<BusinessInfo>({ 
    name: '', phone: '', logoText: '', heroTitle: '', heroSubtitle: '', socialLinks: [] 
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/business')
      .then(res => res.json())
      .then(res => {
        setData({
          ...res,
          socialLinks: res.socialLinks || []
        });
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    await fetch('/api/business', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    const newLinks = [...(data.socialLinks || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setData({ ...data, socialLinks: newLinks });
  };

  const addSocialLink = () => {
    setData({ ...data, socialLinks: [...(data.socialLinks || []), { url: '', iconUrl: '' }] });
  };

  const removeSocialLink = (index: number) => {
    const newLinks = [...(data.socialLinks || [])];
    newLinks.splice(index, 1);
    setData({ ...data, socialLinks: newLinks });
  };

  if (loading) return <p>Cargando configuración...</p>;

  return (
    <div>
      <h1 className="page-title">Configuración del Negocio</h1>
      
      <div className="card" style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          
          <h3>Información Base</h3>
          <div className="input-group" style={{ marginTop: '1rem' }}>
            <label>Logo Texto (El cuadro negro junto al nombre)</label>
            <input type="text" value={data.logoText || ''} onChange={e => setData({...data, logoText: e.target.value})} placeholder="Ej: M&E" />
          </div>

          <div className="input-group">
            <label>Nombre de la Tienda</label>
            <input required type="text" value={data.name || ''} onChange={e => setData({...data, name: e.target.value})} placeholder="Ej: Moda y Estilos" />
          </div>
          
          <div className="input-group">
            <label>Número de WhatsApp (con código de país, sin el +)</label>
            <input required type="text" value={data.phone || ''} onChange={e => setData({...data, phone: e.target.value})} placeholder="Ej: 59170000000" />
          </div>

          <hr style={{ margin: '2rem 0', borderColor: 'var(--border)' }} />
          
          <h3>Banner Principal (Hero)</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Texto grande oscuro en la parte superior.</p>
          
          <div className="input-group">
            <label>Título Principal</label>
            <input type="text" value={data.heroTitle || ''} onChange={e => setData({...data, heroTitle: e.target.value})} placeholder="Ej: Encuentra tu estilo único" />
          </div>

          <div className="input-group">
            <label>Subtítulo</label>
            <textarea rows={2} value={data.heroSubtitle || ''} onChange={e => setData({...data, heroSubtitle: e.target.value})} placeholder="Ropa de segunda mano de primera calidad..." />
          </div>

          <hr style={{ margin: '2rem 0', borderColor: 'var(--border)' }} />
          
          <h3>Redes Sociales (Iconos Circulares)</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Agrega links hacia tus redes sociales con foto de icono (formato circular).</p>

          {(data.socialLinks || []).map((link, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
               <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                 <input type="url" placeholder="URL al Perfil (ej. tiktok.com/...)" value={link.url} onChange={e => updateSocialLink(i, 'url', e.target.value)} required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', width: '100%' }} />
                 <input type="url" placeholder="URL de imagen del Logo Circular (PNG/JPG)" value={link.iconUrl} onChange={e => updateSocialLink(i, 'iconUrl', e.target.value)} required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', width: '100%' }} />
               </div>
               <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '50%', flexShrink: 0, overflow: 'hidden' }}>
                 {link.iconUrl && <img src={link.iconUrl} alt="Icon preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
               </div>
               <button type="button" onClick={() => removeSocialLink(i)} className="btn btn-danger" style={{ padding: '0.5rem 1rem' }}>Quitar</button>
            </div>
          ))}
          <button type="button" onClick={addSocialLink} className="btn btn-secondary" style={{ marginBottom: '2rem', display: 'block' }}>+ Agregar Red Social</button>
          
          <div style={{ display: 'flex', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <button type="submit" className="btn">Guardar Toda la Configuración</button>
            {saved && <span style={{ marginLeft: '1rem', color: '#10b981', fontWeight: 500 }}>¡Configuración guardada!</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
