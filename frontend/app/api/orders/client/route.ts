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

// GET - Get orders for a client
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientEmail = searchParams.get('clientEmail');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    if (!clientEmail) {
      return NextResponse.json({
        success: false,
        error: 'clientEmail parameter is required'
      }, { status: 400 });
    }

    const ordersPath = path.join(process.cwd(), 'data', 'orders.json');
    
    let orders: OrderData[] = [];
    if (fs.existsSync(ordersPath)) {
      const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
      orders = ordersData.orders || [];
    }

    // Filter orders by client email
    let filteredOrders = orders.filter(order => order.clientEmail === clientEmail);

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
      totalSpent: filteredOrders
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
      clientEmail
    });
  } catch (error: any) {
    console.error('Get client orders error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
