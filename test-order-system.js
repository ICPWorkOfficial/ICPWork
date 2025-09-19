const fs = require('fs');
const path = require('path');

// Test the order system
async function testOrderSystem() {
  console.log('🧪 Testing Order System...\n');

  try {
    // Test 1: Create a new order
    console.log('1. Testing order creation...');
    const orderData = {
      clientEmail: 'test@example.com',
      clientName: 'Test Client',
      serviceProvider: 'John Doe',
      serviceProviderEmail: 'john@example.com',
      serviceId: 'svc_123',
      serviceTitle: 'Web Development Service',
      serviceCategory: 'Web Development',
      selectedTier: 'Premium',
      projectName: 'E-commerce Website',
      projectDescription: 'Build a modern e-commerce website with React and Node.js',
      timeline: '14 days',
      deadline: Date.now() + (14 * 24 * 60 * 60 * 1000),
      basePrice: 500,
      additionalServices: {
        fastDelivery: true,
        additionalRevision: false,
        extraChanges: true
      },
      additionalCost: 20,
      tax: 52,
      totalAmount: 572,
      paymentMethod: 'wallet',
      escrowId: 'escrow_123',
      notes: 'Test order creation'
    };

    const createResponse = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    const createResult = await createResponse.json();
    
    if (createResult.success) {
      console.log('✅ Order created successfully');
      console.log(`   Order ID: ${createResult.order.id}`);
      console.log(`   Order Number: ${createResult.order.orderNumber}`);
      console.log(`   Total Amount: $${createResult.order.totalAmount}`);
      
      const orderId = createResult.order.id;

      // Test 2: Get orders for client
      console.log('\n2. Testing order retrieval...');
      const getResponse = await fetch('http://localhost:3000/api/orders?userEmail=test@example.com&userType=client');
      const getResult = await getResponse.json();
      
      if (getResult.success) {
        console.log('✅ Orders retrieved successfully');
        console.log(`   Found ${getResult.count} orders`);
        
        if (getResult.orders.length > 0) {
          const order = getResult.orders[0];
          console.log(`   Latest order: ${order.projectName} - $${order.totalAmount}`);
        }
      } else {
        console.log('❌ Failed to retrieve orders:', getResult.error);
      }

      // Test 3: Get specific order
      console.log('\n3. Testing specific order retrieval...');
      const specificResponse = await fetch(`http://localhost:3000/api/orders/${orderId}?userEmail=test@example.com`);
      const specificResult = await specificResponse.json();
      
      if (specificResult.success) {
        console.log('✅ Specific order retrieved successfully');
        console.log(`   Order: ${specificResult.order.projectName}`);
        console.log(`   Status: ${specificResult.order.status}`);
        console.log(`   Provider: ${specificResult.order.serviceProvider}`);
      } else {
        console.log('❌ Failed to retrieve specific order:', specificResult.error);
      }

      // Test 4: Update order status
      console.log('\n4. Testing order status update...');
      const updateResponse = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'confirmed',
          notes: 'Order confirmed by provider',
          userEmail: 'test@example.com'
        })
      });

      const updateResult = await updateResponse.json();
      
      if (updateResult.success) {
        console.log('✅ Order status updated successfully');
        console.log(`   New status: ${updateResult.order.status}`);
        console.log(`   Updated notes: ${updateResult.order.notes}`);
      } else {
        console.log('❌ Failed to update order status:', updateResult.error);
      }

    } else {
      console.log('❌ Failed to create order:', createResult.error);
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 Order system test completed!');
}

// Check if the server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/orders');
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Order System Test\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Server is not running. Please start the development server first:');
    console.log('   cd frontend && npm run dev');
    return;
  }

  await testOrderSystem();
}

main().catch(console.error);
