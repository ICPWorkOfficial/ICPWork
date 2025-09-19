import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { OrderData } from '../route';

// GET - Get specific order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

    const ordersPath = path.join(process.cwd(), 'data', 'orders.json');
    
    if (!fs.existsSync(ordersPath)) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    const orders: OrderData[] = ordersData.orders || [];
    
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    // Check if user has access to this order
    if (userEmail && order.clientEmail !== userEmail && order.serviceProviderEmail !== userEmail) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized access to order'
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      order
    });
  } catch (error: any) {
    console.error('Get order error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

// PUT - Update order status or details
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const body = await request.json();
    const { status, notes, attachments, userEmail } = body;

    const ordersPath = path.join(process.cwd(), 'data', 'orders.json');
    
    if (!fs.existsSync(ordersPath)) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    const orders: OrderData[] = ordersData.orders || [];
    
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    const order = orders[orderIndex];

    // Check if user has permission to update this order
    if (userEmail && order.clientEmail !== userEmail && order.serviceProviderEmail !== userEmail) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized to update this order'
      }, { status: 403 });
    }

    // Update order fields
    if (status) {
      order.status = status;
      if (status === 'completed') {
        order.completedAt = Date.now();
      }
    }
    
    if (notes !== undefined) {
      order.notes = notes;
    }
    
    if (attachments !== undefined) {
      order.attachments = attachments;
    }

    order.updatedAt = Date.now();

    // Save updated orders
    await fs.promises.writeFile(ordersPath, JSON.stringify(ordersData, null, 2));

    return NextResponse.json({
      success: true,
      order: order,
      message: 'Order updated successfully'
    });
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE - Cancel order (only if status is pending)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json({
        success: false,
        error: 'userEmail parameter is required'
      }, { status: 400 });
    }

    const ordersPath = path.join(process.cwd(), 'data', 'orders.json');
    
    if (!fs.existsSync(ordersPath)) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    const orders: OrderData[] = ordersData.orders || [];
    
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    const order = orders[orderIndex];

    // Check if user has permission to cancel this order
    if (order.clientEmail !== userEmail) {
      return NextResponse.json({
        success: false,
        error: 'Only the client can cancel this order'
      }, { status: 403 });
    }

    // Only allow cancellation if order is pending
    if (order.status !== 'pending') {
      return NextResponse.json({
        success: false,
        error: 'Order can only be cancelled if status is pending'
      }, { status: 400 });
    }

    // Update order status to cancelled
    order.status = 'cancelled';
    order.updatedAt = Date.now();

    // Save updated orders
    await fs.promises.writeFile(ordersPath, JSON.stringify(ordersData, null, 2));

    return NextResponse.json({
      success: true,
      order: order,
      message: 'Order cancelled successfully'
    });
  } catch (error: any) {
    console.error('Cancel order error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
