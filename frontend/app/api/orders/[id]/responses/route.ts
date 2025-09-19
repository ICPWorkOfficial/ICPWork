import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Order response interface
interface OrderResponse {
  id: string;
  orderId: string;
  senderEmail: string;
  senderName: string;
  message: string;
  type: 'message' | 'completion' | 'dispute' | 'update';
  createdAt: number;
  attachments?: string[];
}

// GET - Get responses for an order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Order ID is required'
      }, { status: 400 });
    }

    const responsesPath = path.join(process.cwd(), 'data', 'order-responses.json');
    
    let responses: OrderResponse[] = [];
    if (fs.existsSync(responsesPath)) {
      const responsesData = JSON.parse(fs.readFileSync(responsesPath, 'utf8'));
      responses = responsesData.responses || [];
    }

    // Filter responses for this order
    const orderResponses = responses.filter(response => response.orderId === id);
    
    // Sort by creation date (newest first)
    orderResponses.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json({
      success: true,
      responses: orderResponses,
      count: orderResponses.length
    });
  } catch (error: any) {
    console.error('Get order responses error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

// POST - Create a new response for an order
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { message, type, senderEmail, senderName, attachments } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Order ID is required'
      }, { status: 400 });
    }

    if (!message || !type || !senderEmail || !senderName) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: message, type, senderEmail, senderName'
      }, { status: 400 });
    }

    // Generate response ID
    const responseId = `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newResponse: OrderResponse = {
      id: responseId,
      orderId: id,
      senderEmail,
      senderName,
      message,
      type,
      createdAt: Date.now(),
      attachments: attachments || []
    };

    // Load existing responses
    const responsesPath = path.join(process.cwd(), 'data', 'order-responses.json');
    let responsesData = { responses: [] };
    
    if (fs.existsSync(responsesPath)) {
      responsesData = JSON.parse(fs.readFileSync(responsesPath, 'utf8'));
    }

    // Add new response
    responsesData.responses.push(newResponse);

    // Save to file
    await fs.promises.writeFile(responsesPath, JSON.stringify(responsesData, null, 2));

    return NextResponse.json({
      success: true,
      response: newResponse,
      message: 'Response created successfully'
    });
  } catch (error: any) {
    console.error('Create order response error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
