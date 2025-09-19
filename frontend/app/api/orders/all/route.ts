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

// GET - Get all orders in the system
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const paymentMethod = searchParams.get('paymentMethod');
    const tier = searchParams.get('tier');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const includeStats = searchParams.get('includeStats') === 'true';
    const search = searchParams.get('search'); // Search in project name, service title, or emails

    const ordersPath = path.join(process.cwd(), 'data', 'orders.json');
    
    let orders: OrderData[] = [];
    if (fs.existsSync(ordersPath)) {
      const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
      orders = ordersData.orders || [];
    }

    // Apply filters
    let filteredOrders = orders;

    // Filter by status
    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    // Filter by category
    if (category) {
      filteredOrders = filteredOrders.filter(order => 
        order.serviceCategory.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Filter by payment method
    if (paymentMethod) {
      filteredOrders = filteredOrders.filter(order => order.paymentMethod === paymentMethod);
    }

    // Filter by tier
    if (tier) {
      filteredOrders = filteredOrders.filter(order => order.selectedTier === tier);
    }

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      filteredOrders = filteredOrders.filter(order => 
        order.projectName.toLowerCase().includes(searchLower) ||
        order.serviceTitle.toLowerCase().includes(searchLower) ||
        order.clientEmail.toLowerCase().includes(searchLower) ||
        order.serviceProviderEmail.toLowerCase().includes(searchLower) ||
        order.orderNumber.toLowerCase().includes(searchLower)
      );
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
        case 'projectName':
          aValue = a.projectName.toLowerCase();
          bValue = b.projectName.toLowerCase();
          break;
        case 'serviceTitle':
          aValue = a.serviceTitle.toLowerCase();
          bValue = b.serviceTitle.toLowerCase();
          break;
        case 'clientEmail':
          aValue = a.clientEmail.toLowerCase();
          bValue = b.clientEmail.toLowerCase();
          break;
        case 'serviceProviderEmail':
          aValue = a.serviceProviderEmail.toLowerCase();
          bValue = b.serviceProviderEmail.toLowerCase();
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (sortBy === 'projectName' || sortBy === 'serviceTitle' || sortBy === 'clientEmail' || sortBy === 'serviceProviderEmail') {
        // String comparison
        if (sortOrder === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      } else {
        // Numeric/date comparison
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      }
    });

    // Apply pagination
    const totalCount = filteredOrders.length;
    const paginatedOrders = filteredOrders.slice(offset, offset + limit);

    // Calculate comprehensive statistics
    const stats = {
      total: totalCount,
      pending: filteredOrders.filter(o => o.status === 'pending').length,
      confirmed: filteredOrders.filter(o => o.status === 'confirmed').length,
      in_progress: filteredOrders.filter(o => o.status === 'in_progress').length,
      completed: filteredOrders.filter(o => o.status === 'completed').length,
      cancelled: filteredOrders.filter(o => o.status === 'cancelled').length,
      disputed: filteredOrders.filter(o => o.status === 'disputed').length,
      
      // Financial statistics
      totalRevenue: filteredOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.totalAmount, 0),
      pendingRevenue: filteredOrders
        .filter(o => o.status === 'pending' || o.status === 'in_progress')
        .reduce((sum, o) => sum + o.totalAmount, 0),
      averageOrderValue: filteredOrders.length > 0 
        ? filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0) / filteredOrders.length 
        : 0,
      
      // Payment method statistics
      walletPayments: filteredOrders.filter(o => o.paymentMethod === 'wallet').length,
      cardPayments: filteredOrders.filter(o => o.paymentMethod === 'card').length,
      
      // Tier statistics
      basicTier: filteredOrders.filter(o => o.selectedTier === 'Basic').length,
      advancedTier: filteredOrders.filter(o => o.selectedTier === 'Advanced').length,
      premiumTier: filteredOrders.filter(o => o.selectedTier === 'Premium').length,
      
      // Category statistics
      categories: filteredOrders.reduce((acc, order) => {
        acc[order.serviceCategory] = (acc[order.serviceCategory] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      // Timeline statistics
      recentOrders: filteredOrders.filter(o => 
        Date.now() - o.createdAt < 7 * 24 * 60 * 60 * 1000 // Last 7 days
      ).length,
      
      // Overdue orders (past deadline)
      overdueOrders: filteredOrders.filter(o => 
        o.status !== 'completed' && o.status !== 'cancelled' && 
        o.deadline < Date.now()
      ).length
    };

    const response: any = {
      success: true,
      orders: paginatedOrders,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: Math.floor(offset / limit) + 1
      },
      filters: {
        status,
        category,
        paymentMethod,
        tier,
        search,
        sortBy,
        sortOrder
      }
    };

    // Include statistics if requested
    if (includeStats) {
      response.stats = stats;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Get all orders error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

// POST - Bulk operations on orders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, orderIds, updates } = body;

    if (!action) {
      return NextResponse.json({
        success: false,
        error: 'Action is required'
      }, { status: 400 });
    }

    const ordersPath = path.join(process.cwd(), 'data', 'orders.json');
    
    let ordersData = { orders: [] };
    if (fs.existsSync(ordersPath)) {
      ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    }

    let updatedCount = 0;
    const results = [];

    switch (action) {
      case 'bulkUpdate':
        if (!orderIds || !Array.isArray(orderIds) || !updates) {
          return NextResponse.json({
            success: false,
            error: 'orderIds array and updates object are required'
          }, { status: 400 });
        }

        for (const orderId of orderIds) {
          const orderIndex = ordersData.orders.findIndex((order: OrderData) => order.id === orderId);
          if (orderIndex !== -1) {
            ordersData.orders[orderIndex] = {
              ...ordersData.orders[orderIndex],
              ...updates,
              updatedAt: Date.now()
            };
            updatedCount++;
            results.push({ orderId, success: true });
          } else {
            results.push({ orderId, success: false, error: 'Order not found' });
          }
        }
        break;

      case 'bulkDelete':
        if (!orderIds || !Array.isArray(orderIds)) {
          return NextResponse.json({
            success: false,
            error: 'orderIds array is required'
          }, { status: 400 });
        }

        ordersData.orders = ordersData.orders.filter((order: OrderData) => {
          if (orderIds.includes(order.id)) {
            results.push({ orderId: order.id, success: true });
            updatedCount++;
            return false; // Remove from array
          }
          return true; // Keep in array
        });
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: bulkUpdate, bulkDelete'
        }, { status: 400 });
    }

    // Save updated data
    await fs.promises.writeFile(ordersPath, JSON.stringify(ordersData, null, 2));

    return NextResponse.json({
      success: true,
      action,
      updatedCount,
      results,
      message: `Bulk ${action} completed successfully`
    });
  } catch (error: any) {
    console.error('Bulk operations error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
