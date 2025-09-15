import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, name } = body
    // For demo purposes we just log and return success. In a real app you'd
    // remove the user from the database here.
    console.log('Delete user request:', { id, name })
    return NextResponse.json({ ok: true, id, name })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
