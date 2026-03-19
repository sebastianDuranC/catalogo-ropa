import { getDB } from '@/lib/db';
import CatalogClient from '@/components/CatalogClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const db = await getDB();
  return {
    title: `${db.business.name} | Catálogo Exclusivo`,
    description: `Visita ${db.business.name} y descubre prendas exclusivas. Solicita tu pedido directamente por WhatsApp.`,
  };
}

export default async function Home() {
  const db = await getDB();
  return <CatalogClient business={db.business} products={db.products} />;
}
