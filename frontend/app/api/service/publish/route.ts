import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const id = `svc_${Date.now()}`

    // Read existing services
    const filePath = path.join(process.cwd(), 'data', 'services.json')
    const fileContent = await fs.readFile(filePath, 'utf8')
    const servicesData = JSON.parse(fileContent)

    const newService = { id, ...body, createdAt: new Date().toISOString() }
    servicesData.services.push(newService)

    await fs.writeFile(filePath, JSON.stringify(servicesData, null, 2))

    return NextResponse.json({ success: true, id })
  } catch (err) {
    console.error('Failed to publish service:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
