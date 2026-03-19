import { NextResponse } from 'next/server';
import { getDB, saveBusinessInfo } from '@/lib/db';

export async function GET() {
  const db = await getDB();
  return NextResponse.json(db.business);
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    await saveBusinessInfo(data);
    const db = await getDB();
    return NextResponse.json(db.business);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update business data' }, { status: 500 });
  }
}
