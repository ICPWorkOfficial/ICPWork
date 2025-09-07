import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'demo-data.json');

export async function GET() {
  try {
    let raw = '[]';
    try {
      raw = await fs.promises.readFile(dataPath, 'utf-8');
    } catch (e: any) {
      if (e?.code === 'ENOENT') {
        // no data file yet, return empty profile
        return NextResponse.json({ ok: true, profile: {} });
      }
      throw e;
    }

    const data = JSON.parse(raw || '[]');
    if (!Array.isArray(data)) {
      return NextResponse.json({ ok: true, profile: {} });
    }

    // Sort by createdAt ascending so later items overwrite earlier ones
    data.sort((a: any, b: any) => {
      const ta = a?.createdAt ? Date.parse(a.createdAt) : 0;
      const tb = b?.createdAt ? Date.parse(b.createdAt) : 0;
      return ta - tb;
    });

    // Merge strategy: last write wins. Preserve nested objects (shallow merge for address).
    const profile: Record<string, any> = {};

    for (const item of data) {
      // skip internal fields
      const clone = { ...item };
      delete clone.id;
      delete clone.createdAt;
      // merge address specially
      if (clone.address && typeof clone.address === 'object') {
        profile.address = { ...(profile.address || {}), ...clone.address };
        delete clone.address;
      }
      // merge skills (overwrite with latest array)
      if (clone.skills) {
        profile.skills = clone.skills;
        delete clone.skills;
      }
      // merge remaining top-level fields (role, name, companyName, companyWebsite, phone, linkedin, resumeFileName, etc.)
      for (const k of Object.keys(clone)) {
        profile[k] = clone[k];
      }
    }

    return NextResponse.json({ ok: true, profile });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
