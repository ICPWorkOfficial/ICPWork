import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'projects.json');

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    let raw = '{}';
    try { raw = await fs.promises.readFile(dataPath, 'utf-8'); } catch (e: any) { if (e?.code === 'ENOENT') raw = '{}'; else throw e; }
    const data = JSON.parse(raw || '{}');
    const projects = data.projects || [];
    if (id) {
      const p = projects.find((x: any) => x.id === id);
      return NextResponse.json({ ok: true, project: p });
    }
    return NextResponse.json({ ok: true, projects });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, files } = body || {};
    if (!id) return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 });

    let raw = '{}';
    try { raw = await fs.promises.readFile(dataPath, 'utf-8'); } catch (e: any) { if (e?.code === 'ENOENT') raw = '{}'; else throw e; }
    const data = JSON.parse(raw || '{}');
    const projects = data.projects || [];
    const idx = projects.findIndex((x: any) => x.id === id);
    if (idx === -1) return NextResponse.json({ ok: false, error: 'project not found' }, { status: 404 });

    if (status) projects[idx].status = status;
    if (files && Array.isArray(files)) {
      projects[idx].files = Array.from(new Set([...(projects[idx].files || []), ...files]));
    }

    data.projects = projects;
    await fs.promises.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    return NextResponse.json({ ok: true, project: projects[idx] });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
