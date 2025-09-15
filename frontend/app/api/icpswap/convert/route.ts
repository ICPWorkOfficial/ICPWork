import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { from, to, amount } = body

    // Demo conversion logic: pick a pseudo-rate based on currency pair
    const baseRate = 400.8989
    // simple modifier for demo
    const modifier = (from.charCodeAt(0) % 10 + to.charCodeAt(0) % 10) / 100
    const rate = baseRate * (1 + modifier)
    const parsed = parseFloat(amount) || 0
    const converted = +(parsed * rate).toFixed(6)

    return NextResponse.json({ success: true, rate, converted })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
