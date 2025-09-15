import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'profiles.json');

async function readProfiles() {
  try {
    const raw = await fs.promises.readFile(dataPath, 'utf-8');
    return JSON.parse(raw || '{}').profiles || [];
  } catch (e: any) {
    if (e?.code === 'ENOENT') return [];
    throw e;
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const profiles = await readProfiles();
    if (id) {
      const p = profiles.find((x: any) => x.id === id) || null;
      return NextResponse.json({ ok: true, profile: p });
    }
    return NextResponse.json({ ok: true, profiles });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
