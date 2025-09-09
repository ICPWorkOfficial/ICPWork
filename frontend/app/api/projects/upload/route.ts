import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'node';

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

async function ensureUploads() {
  try {
    await fs.promises.mkdir(uploadsDir, { recursive: true });
  } catch (e) {
    // ignore
  }
}

export async function POST(req: Request) {
  try {
    await ensureUploads();

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ ok: false, error: 'Expected multipart/form-data' }, { status: 400 });
    }

    // Use web API to parse multipart form data (available in Next.js edge/Node runtimes)
    // Convert Request to formData
    // Note: This is a demo handler. For production, use a proper multipart parser and validation.
    const formData = await (req as any).formData();
    const files: string[] = [];

    for (const entry of formData.entries()) {
      const [key, value] = entry as [string, any];
      if (value && typeof value === 'object' && typeof value.name === 'string' && typeof value.arrayBuffer === 'function') {
        const filename = `${Date.now()}-${value.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const buffer = Buffer.from(await value.arrayBuffer());
        const outPath = path.join(uploadsDir, filename);
        await fs.promises.writeFile(outPath, buffer);
        files.push(`/uploads/${filename}`);
      }
    }

    return NextResponse.json({ ok: true, files });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
