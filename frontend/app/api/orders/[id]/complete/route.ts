import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Order data interface
interface OrderData {
  id: string;
  orderNumber: string;
  clientEmail: string;
  clientName?: string;
  serviceProvider: string;
  serviceProviderEmail: string;
  serviceId: string;
  serviceTitle: string;
  serviceCategory: string;
  selectedTier: 'Basic' | 'Advanced' | 'Premium';
  projectName: string;
  projectDescription: string;
  timeline: string;
  deadline: number;
  basePrice: number;
  additionalServices: {
    fastDelivery: boolean;
    additionalRevision: boolean;
    extraChanges: boolean;
  };
  additionalCost: number;
  tax: number;
  totalAmount: number;
  paymentMethod: 'wallet' | 'card';
  escrowId: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  notes?: string;
  attachments?: string[];
}

// POST - Mark order as complete
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { 
      completedBy, 
      completionNotes, 
      paymentReleased = true,
      transactionId 
    } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Order ID is required'
      }, { status: 400 });
    }

    const ordersPath = path.join(process.cwd(), 'data', 'orders.json');
    
    let ordersData = { orders: [] };
    if (fs.existsSync(ordersPath)) {
      ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    }

    // Find the order by ID
    const orderIndex = ordersData.orders.findIndex((order: OrderData) => order.id === id);
    
    if (orderIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    const currentOrder = ordersData.orders[orderIndex];

    // Check if order can be completed
    if (currentOrder.status === 'completed') {
      return NextResponse.json({
        success: false,
        error: 'Order is already completed'
      }, { status: 400 });
    }

    if (currentOrder.status === 'cancelled') {
      return NextResponse.json({
        success: false,
        error: 'Cannot complete a cancelled order'
      }, { status: 400 });
    }

    if (currentOrder.status === 'disputed') {
      return NextResponse.json({
        success: false,
        error: 'Cannot complete a disputed order'
      }, { status: 400 });
    }

    // Update the order to completed status
    const completedAt = Date.now();
    const updatedOrder = {
      ...currentOrder,
      status: 'completed' as const,
      completedAt,
      updatedAt: completedAt,
      notes: completionNotes || currentOrder.notes || '',
      completionDetails: {
        completedBy: completedBy || 'Unknown',
        completedAt,
        paymentReleased,
        transactionId: transactionId || null
      }
    };

    ordersData.orders[orderIndex] = updatedOrder;

    // Save to file
    await fs.promises.writeFile(ordersPath, JSON.stringify(ordersData, null, 2));

    // Log the completion
    console.log(`Order ${id} marked as complete by ${completedBy || 'Unknown'}`);

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Order marked as complete successfully',
      completionDetails: {
        completedAt,
        completedBy: completedBy || 'Unknown',
        paymentReleased,
        transactionId
      }
    });
  } catch (error: any) {
    console.error('Complete order error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

// GET - Get completion status
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

    const ordersPath = path.join(process.cwd(), 'data', 'orders.json');
    
    let ordersData = { orders: [] };
    if (fs.existsSync(ordersPath)) {
      ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    }

    // Find the order by ID
    const order = ordersData.orders.find((order: OrderData) => order.id === id);
    
    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        completedAt: order.completedAt,
        completionDetails: order.completionDetails || null
      }
    });
  } catch (error: any) {
    console.error('Get order completion status error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
