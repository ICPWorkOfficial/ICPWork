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

// GET - Get orders for a service provider
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerEmail = searchParams.get('providerEmail');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    if (!providerEmail) {
      return NextResponse.json({
        success: false,
        error: 'providerEmail parameter is required'
      }, { status: 400 });
    }

    const ordersPath = path.join(process.cwd(), 'data', 'orders.json');
    
    let orders: OrderData[] = [];
    if (fs.existsSync(ordersPath)) {
      const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
      orders = ordersData.orders || [];
    }

    // Filter orders by service provider email
    let filteredOrders = orders.filter(order => order.serviceProvider === providerEmail);

    // Filter by status if provided
    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    // Sort orders
    filteredOrders.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'updatedAt':
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
        case 'totalAmount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'deadline':
          aValue = a.deadline;
          bValue = b.deadline;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const totalCount = filteredOrders.length;
    const paginatedOrders = filteredOrders.slice(offset, offset + limit);

    // Calculate summary statistics
    const stats = {
      total: totalCount,
      pending: filteredOrders.filter(o => o.status === 'pending').length,
      in_progress: filteredOrders.filter(o => o.status === 'in_progress').length,
      completed: filteredOrders.filter(o => o.status === 'completed').length,
      cancelled: filteredOrders.filter(o => o.status === 'cancelled').length,
      disputed: filteredOrders.filter(o => o.status === 'disputed').length,
      totalRevenue: filteredOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.totalAmount, 0)
    };

    return NextResponse.json({
      success: true,
      orders: paginatedOrders,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      },
      stats,
      providerEmail
    });
  } catch (error: any) {
    console.error('Get provider orders error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

// POST - Create a new order for a provider (same as main orders API)
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
      message: 'Order created successfully for provider'
    });
  } catch (error: any) {
    console.error('Create provider order error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
