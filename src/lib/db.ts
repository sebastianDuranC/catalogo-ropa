import { neon } from '@neondatabase/serverless';

export interface SocialLink {
  url: string;
  iconUrl: string;
}

export interface BusinessInfo {
  name: string;
  phone: string;
  social?: string;
  socialLinks?: SocialLink[];
  logoText?: string;
  heroTitle?: string;
  heroSubtitle?: string;
}

export interface Product {
  id: string;
  photo: string;
  name: string;
  description: string;
  size: string;
  color: string;
  price: number;
  category: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface DBType {
  business: BusinessInfo;
  products: Product[];
}

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set.');
  return neon(url);
}

async function ensureTablesExist(): Promise<void> {
  const sql = getSQL();
  await sql`
    CREATE TABLE IF NOT EXISTS business (
      id SERIAL PRIMARY KEY,
      name TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      social TEXT DEFAULT '',
      logo_text TEXT DEFAULT '',
      hero_title TEXT DEFAULT '',
      hero_subtitle TEXT DEFAULT '',
      social_links JSONB DEFAULT '[]'
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      photo TEXT DEFAULT '',
      name TEXT DEFAULT '',
      description TEXT DEFAULT '',
      size TEXT DEFAULT '',
      color TEXT DEFAULT '',
      price NUMERIC DEFAULT 0,
      category TEXT DEFAULT 'General'
    )
  `;
  // Insert default business row if none exists
  const existing = await sql`SELECT id FROM business LIMIT 1`;
  if (existing.length === 0) {
    await sql`INSERT INTO business (name, phone) VALUES ('Mi Catálogo', '')`;
  }
}

// ─── BUSINESS ─────────────────────────────────────────────────

export async function getDB(): Promise<DBType> {
  const sql = getSQL();
  await ensureTablesExist();

  const [businessRows, productRows] = await Promise.all([
    sql`SELECT * FROM business LIMIT 1`,
    sql`SELECT * FROM products ORDER BY name ASC`
  ]);

  const row = businessRows[0] || {};
  const business: BusinessInfo = {
    name: row.name || '',
    phone: row.phone || '',
    social: row.social || '',
    logoText: row.logo_text || '',
    heroTitle: row.hero_title || '',
    heroSubtitle: row.hero_subtitle || '',
    socialLinks: Array.isArray(row.social_links) ? row.social_links : []
  };

  const products: Product[] = productRows.map((p: any) => ({
    id: p.id,
    photo: p.photo || '',
    name: p.name || '',
    description: p.description || '',
    size: p.size || '',
    color: p.color || '',
    price: Number(p.price) || 0,
    category: p.category || 'General'
  }));

  return { business, products };
}

export async function saveBusinessInfo(data: Partial<BusinessInfo>): Promise<void> {
  const sql = getSQL();
  await ensureTablesExist();
  
  await sql`
    UPDATE business SET
      name = ${data.name ?? ''},
      phone = ${data.phone ?? ''},
      social = ${data.social ?? ''},
      logo_text = ${data.logoText ?? ''},
      hero_title = ${data.heroTitle ?? ''},
      hero_subtitle = ${data.heroSubtitle ?? ''},
      social_links = ${JSON.stringify(data.socialLinks ?? [])}::jsonb
    WHERE id = (SELECT id FROM business LIMIT 1)
  `;
}

// ─── CATEGORIES ───────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const sql = getSQL();
  await ensureTablesExist();
  const rows = await sql`SELECT * FROM categories ORDER BY name ASC`;
  return rows.map((c: any) => ({ id: c.id, name: c.name }));
}

export async function createCategory(name: string): Promise<Category> {
  const sql = getSQL();
  await ensureTablesExist();
  const rows = await sql`
    INSERT INTO categories (name) VALUES (${name})
    ON CONFLICT (name) DO NOTHING
    RETURNING id, name
  `;
  if (rows.length === 0) {
    // Already existed, return it
    const existing = await sql`SELECT id, name FROM categories WHERE name = ${name}`;
    return { id: existing[0].id, name: existing[0].name };
  }
  return { id: rows[0].id, name: rows[0].name };
}

export async function updateCategory(id: number, name: string): Promise<Category | null> {
  const sql = getSQL();
  const rows = await sql`
    UPDATE categories SET name = ${name} WHERE id = ${id} RETURNING id, name
  `;
  if (!rows.length) return null;
  return { id: rows[0].id, name: rows[0].name };
}

export async function deleteCategory(id: number): Promise<boolean> {
  const sql = getSQL();
  const result = await sql`DELETE FROM categories WHERE id = ${id} RETURNING id`;
  return result.length > 0;
}

// ─── PRODUCTS ─────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const sql = getSQL();
  await ensureTablesExist();
  const rows = await sql`SELECT * FROM products ORDER BY name ASC`;
  return rows.map((p: any) => ({
    id: p.id,
    photo: p.photo || '',
    name: p.name || '',
    description: p.description || '',
    size: p.size || '',
    color: p.color || '',
    price: Number(p.price) || 0,
    category: p.category || 'General'
  }));
}

export async function getProductById(id: string): Promise<Product | null> {
  const sql = getSQL();
  await ensureTablesExist();
  const rows = await sql`SELECT * FROM products WHERE id = ${id}`;
  if (!rows.length) return null;
  const p = rows[0];
  return {
    id: p.id,
    photo: p.photo || '',
    name: p.name || '',
    description: p.description || '',
    size: p.size || '',
    color: p.color || '',
    price: Number(p.price) || 0,
    category: p.category || 'General'
  };
}

export async function createProduct(data: Omit<Product, 'id'> & { id: string }): Promise<Product> {
  const sql = getSQL();
  await ensureTablesExist();
  await sql`
    INSERT INTO products (id, photo, name, description, size, color, price, category)
    VALUES (${data.id}, ${data.photo}, ${data.name}, ${data.description}, ${data.size}, ${data.color}, ${data.price}, ${data.category})
  `;
  return data as Product;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  const sql = getSQL();
  await ensureTablesExist();
  await sql`
    UPDATE products SET
      photo = COALESCE(${data.photo ?? null}, photo),
      name = COALESCE(${data.name ?? null}, name),
      description = COALESCE(${data.description ?? null}, description),
      size = COALESCE(${data.size ?? null}, size),
      color = COALESCE(${data.color ?? null}, color),
      price = COALESCE(${data.price ?? null}, price),
      category = COALESCE(${data.category ?? null}, category)
    WHERE id = ${id}
  `;
  return getProductById(id);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const sql = getSQL();
  await ensureTablesExist();
  const result = await sql`DELETE FROM products WHERE id = ${id} RETURNING id`;
  return result.length > 0;
}

// Legacy compat
export async function saveDB(_data: DBType): Promise<void> {
  throw new Error('saveDB is deprecated.');
}
