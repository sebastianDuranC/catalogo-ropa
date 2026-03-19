import { NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const newProduct = await createProduct({
      id: randomUUID(),
      photo: data.photo || '',
      name: data.name || '',
      description: data.description || '',
      size: data.size || '',
      color: data.color || '',
      price: Number(data.price) || 0,
      category: data.category || 'General'
    });
    
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}
