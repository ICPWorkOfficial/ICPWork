import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'messages.json');

function isValidEmail(email: any) {
  return typeof email === 'string' && /\S+@\S+\.\S+/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, memberType, companyWebsite } = body || {};
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: 'invalid email' }, { status: 400 });
    }

    let raw = '{}';
    try { raw = await fs.promises.readFile(dataPath, 'utf-8'); } catch (e: any) { if (e?.code === 'ENOENT') raw = '{}'; else throw e; }
    const data = JSON.parse(raw || '{}');
    data.contacts = data.contacts || [];

    // Avoid duplicate by email
    const existing = data.contacts.find((c: any) => c.email === email);
    if (existing) {
      // mark as invited again
      existing.invited = true;
      existing.invitedAt = new Date().toISOString();
      await fs.promises.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8');
      return NextResponse.json({ ok: true, item: existing }, { status: 200 });
    }

    const id = 'c-' + Date.now().toString();
    const name = String(email).split('@')[0];
    const contact = {
      id,
      name,
      email,
      memberType: memberType || 'Freelancer',
      companyWebsite: companyWebsite || '',
      invited: true,
      invitedAt: new Date().toISOString(),
      lastMessage: '',
      unread: 0
    };

    data.contacts.unshift(contact);
    await fs.promises.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    return NextResponse.json({ ok: true, item: contact }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
