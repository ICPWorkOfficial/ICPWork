import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // In a real app you'd persist the service; here we just return a demo id
    const id = `svc_${Date.now()}`
    return NextResponse.json({ success: true, id })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
