import { NextResponse } from 'next/server'

// In-memory demo storage (resets on server restart)
const transactions: any[] = []

export async function GET() {
  return NextResponse.json({ transactions })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { from, to, amount, converted } = body
    const tx = {
      id: `tx_${Date.now()}_${Math.floor(Math.random() * 999)}`,
      from,
      to,
      amount,
      converted,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    transactions.unshift(tx)
    // for demo, auto-complete pending tx to done after short delay
    setTimeout(() => {
      const idx = transactions.findIndex((t) => t.id === tx.id)
      if (idx !== -1) transactions[idx] = { ...transactions[idx], status: 'done' }
    }, 3000)

    return NextResponse.json({ success: true, transaction: tx })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
