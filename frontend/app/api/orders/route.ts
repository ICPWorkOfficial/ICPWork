import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Order data structure
export interface OrderData {
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
  deadline: number; // timestamp
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

// GET - Get orders for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    const userType = searchParams.get('userType'); // 'client' or 'provider'
    const status = searchParams.get('status');

    if (!userEmail) {
      return NextResponse.json({
        success: false,
        error: 'userEmail parameter is required'
      }, { status: 400 });
    }

    const ordersPath = path.join(process.cwd(), 'data', 'orders.json');
    
    let orders: OrderData[] = [];
    if (fs.existsSync(ordersPath)) {
      const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
      orders = ordersData.orders || [];
    }

    // Filter orders based on user type and email
    let filteredOrders = orders;
    
    if (userType === 'client') {
      filteredOrders = orders.filter(order => order.clientEmail === userEmail);
    } else if (userType === 'provider') {
      filteredOrders = orders.filter(order => order.serviceProviderEmail === userEmail);
    } else {
      // If no userType specified, return both client and provider orders
      filteredOrders = orders.filter(order => 
        order.clientEmail === userEmail || order.serviceProviderEmail === userEmail
      );
    }

    // Filter by status if provided
    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    // Sort by creation date (newest first)
    filteredOrders.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json({
      success: true,
      orders: filteredOrders,
      count: filteredOrders.length
    });
  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

// POST - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientEmail,
      clientName,
      serviceProvider,
      serviceProviderEmail,
      serviceId,
      serviceTitle,
      serviceCategory,
      selectedTier,
      projectName,
      projectDescription,
      timeline,
      deadline,
      basePrice,
      additionalServices,
      additionalCost,
      tax,
      totalAmount,
      paymentMethod,
      escrowId,
      notes
    } = body;

    // Validate required fields
    if (!clientEmail || !serviceProviderEmail || !serviceId || !serviceTitle || 
        !selectedTier || !projectName || !deadline || !basePrice || !totalAmount || 
        !paymentMethod || !escrowId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Generate order ID and order number
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;

    const newOrder: OrderData = {
      id: orderId,
      orderNumber,
      clientEmail,
      clientName: clientName || '',
      serviceProvider,
      serviceProviderEmail,
      serviceId,
      serviceTitle,
      serviceCategory: serviceCategory || 'General',
      selectedTier,
      projectName,
      projectDescription: projectDescription || '',
      timeline: timeline || '7 days',
      deadline,
      basePrice,
      additionalServices: additionalServices || {
        fastDelivery: false,
        additionalRevision: false,
        extraChanges: false
      },
      additionalCost: additionalCost || 0,
      tax: tax || 0,
      totalAmount,
      paymentMethod,
      escrowId,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      notes: notes || '',
      attachments: []
    };

    // Load existing orders
    const ordersPath = path.join(process.cwd(), 'data', 'orders.json');
    let ordersData = { orders: [] };
    
    if (fs.existsSync(ordersPath)) {
      ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    }

    // Add new order
    ordersData.orders.push(newOrder);

    // Save to file
    await fs.promises.writeFile(ordersPath, JSON.stringify(ordersData, null, 2));

    return NextResponse.json({
      success: true,
      order: newOrder,
      message: 'Order created successfully'
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
