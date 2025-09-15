import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const filePath = path.join(process.cwd(), 'data', 'services.json')
    const fileContent = await fs.readFile(filePath, 'utf8')
    const servicesData = JSON.parse(fileContent)

    const service = servicesData.services.find((s: any) => s.id === id)
    if (!service) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    return NextResponse.json({ success: true, service })
  } catch (err) {
    console.error('Failed to read service:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
