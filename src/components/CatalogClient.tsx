'use client';

import { useState } from 'react';
import { BusinessInfo, Product } from '@/lib/db';
import classes from '@/app/page.module.css';

/** Inserta la transformación e_background_removal en una URL de Cloudinary */
function withBgRemoval(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  // URL pattern: .../image/upload/v1234/folder/file.jpg
  // Insert transformation after /upload/
  return url.replace('/image/upload/', '/image/upload/e_background_removal/');
}

export default function CatalogClient({ business, products }: { business: BusinessInfo, products: Product[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Extraer categorías únicas
  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filteredProducts = selectedCategory === 'Todos'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className={classes.catalogPage}>
      <header className={classes.header}>
        <div className="container">
          <div className={classes.headerContent}>
            <div className={classes.brandWrap}>
              {business.logoText && <span className={classes.logoBox}>{business.logoText}</span>}
              <h1 className={classes.businessName}>{business.name || 'Mi Catálogo'}</h1>
            </div>
            {business.socialLinks && business.socialLinks.length > 0 && (
              <div className={classes.socialIconsRow}>
                {business.socialLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noreferrer" className={classes.socialIconLink}>
                    {link.iconUrl ? (
                      <img src={link.iconUrl} alt="Social Icon" />
                    ) : (
                      <span>🔗</span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: '0 1rem 3rem 1rem' }}>

        {/* HERO BANNER */}
        <div className={classes.heroBanner}>
          <h2 className={classes.heroTitle}>{business.heroTitle || 'Encuentra tu estilo único'}</h2>
          {(business.heroSubtitle || 'Ropa de calidad. Moda sostenible y elegante o a precios increíbles.') && (
            <p className={classes.heroSubtitle}>{business.heroSubtitle}</p>
          )}
        </div>

        {/* PILLS */}
        {categories.length > 1 && (
          <div className={classes.pillsContainer}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`${classes.pill} ${selectedCategory === cat ? classes.pillActive : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* GRID */}
        {filteredProducts.length === 0 ? (
          <p className={classes.emptyState}>No encontramos prendas en esta categoría.</p>
        ) : (
          <div className={classes.grid}>
            {filteredProducts.map(product => {
              const strPrice = `Bs. ${product.price.toFixed(2)}`;
              const photoLine = product.photo ? `\n\n🖼 Foto del producto: ${product.photo}` : '';
              const message = `¡Hola! 👋 Estoy interesado/a en este producto de *${business.name}*:\n\n👗*${product.name}*\n📋 Categoría: ${product.category}\n📏 Talla: ${product.size}\n🎨 Color: ${product.color}\n💵 Precio: ${strPrice}${photoLine}\n\n¿Está disponible?`;
              const whatsappUrl = `https://wa.me/${business.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

              return (
                <article key={product.id} className={classes.productCard}>
                  <div className={classes.imageWrapper}>
                    <img src={withBgRemoval(product.photo)} alt={product.name} loading="lazy" />
                  </div>
                  <div className={classes.productInfo}>
                    <p className={classes.cardCategory}>{product.category}</p>
                    <h3 className={classes.productName}>{product.name}</h3>
                    <p className={classes.productDescription}>{product.description}</p>
                    <div className={classes.sizeInfo}>Talla: <strong>{product.size}</strong></div>

                    <div className={classes.cardPriceRow}>
                      <div className={classes.colorWrapper}>
                        <span className={classes.colorDot}></span>
                        <span className={classes.colorText}>{product.color}</span>
                      </div>
                      <span className={classes.cardPriceBold}>{strPrice}</span>
                    </div>

                    <a href={whatsappUrl} target="_blank" rel="noreferrer" className={`btn ${classes.buyBtn}`}>
                      Comprar por WhatsApp
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <footer className={classes.footer}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          {business.socialLinks && business.socialLinks.length > 0 && (
            <div className={classes.socialIconsRow}>
              {business.socialLinks.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noreferrer" className={classes.socialIconLink}>
                  {link.iconUrl && <img src={link.iconUrl} alt="Social Icon" />}
                </a>
              ))}
            </div>
          )}
          <p>&copy; {new Date().getFullYear()} {business.name}. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
