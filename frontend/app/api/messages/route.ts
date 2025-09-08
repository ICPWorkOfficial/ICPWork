import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'messages.json');

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const contactId = url.searchParams.get('contactId');
    let raw = '[]';
    try { raw = await fs.promises.readFile(dataPath, 'utf-8'); } catch (e: any) { if (e?.code === 'ENOENT') raw = '[]'; else throw e; }
    const data = JSON.parse(raw || '[]');
    const contacts = data.contacts || [];
    const messages = data.messages || [];
    if (contactId) {
      const msgs = messages.filter((m: any) => m.to === contactId || m.from === contactId || (m.to === 'me' && m.from === contactId) || (m.from === 'me' && m.to === contactId));
      return NextResponse.json({ ok: true, messages: msgs });
    }
    return NextResponse.json({ ok: true, contacts });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { contactId, from, text } = body || {};
    if (!contactId || !text) return NextResponse.json({ ok: false, error: 'missing fields' }, { status: 400 });
    let raw = '[]';
    try { raw = await fs.promises.readFile(dataPath, 'utf-8'); } catch (e: any) { if (e?.code === 'ENOENT') raw = '[]'; else throw e; }
    const data = JSON.parse(raw || '{}');
    data.messages = data.messages || [];
    const nextId = Date.now().toString();
    const item = { id: nextId, from: from || 'me', to: contactId, text, createdAt: new Date().toISOString() };
    data.messages.push(item);
    await fs.promises.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
