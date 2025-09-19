# ICP Wallet Integration Guide

## Overview

This guide explains how to use ICP wallets to fund escrow accounts in the ICP Work platform. The system supports both wallet-based and traditional card payments for funding escrow agreements.

## Features

### 🔗 **Wallet Connection**
- Connect to ICP wallets (Internet Identity, Plug, etc.)
- Display wallet balance and principal ID
- Secure wallet authentication

### 💰 **Escrow Funding**
- Transfer ICP directly from wallet to escrow account
- Automatic 10% platform fee deduction
- Real-time balance updates
- Transaction confirmation

### 🛡️ **Security Features**
- Funds held in escrow until project completion
- Automatic dispute resolution for overdue projects
- Full refund protection for client cancellations
- Transparent fee structure

## How to Use

### 1. **Connect Your Wallet**

1. Navigate to the checkout page (`/client-dashboard/checkout`)
2. In the sidebar, you'll see the "Connect Wallet" section
3. Click "Connect Wallet" button
4. Follow the wallet connection prompts
5. Your wallet balance and principal ID will be displayed

### 2. **Fund Escrow Account**

1. Select "ICP Wallet (Recommended)" as your payment method
2. The wallet funding section will appear
3. Enter the amount you want to fund (or use the pre-filled amount)
4. Click "Fund Escrow Account"
5. Confirm the transaction in your wallet
6. Wait for transaction confirmation

### 3. **Complete Checkout**

1. After successful funding, the system will automatically proceed
2. Fill in your project details
3. Submit the form to create the escrow agreement
4. You'll be redirected to the success page with escrow details

## Technical Implementation

### **Wallet Service (`lib/wallet-service.ts`)**

```typescript
// Connect to wallet
const connection = await walletService.connectWallet();

// Get balance
const balance = await walletService.getBalance();

// Transfer to escrow
const transactionId = await walletService.transferToEscrow(amount, canisterId);
```

### **API Endpoints**

- `POST /api/escrow/wallet-deposit` - Deposit funds from wallet
- `GET /api/escrow/balance` - Check escrow balance
- `POST /api/escrow/create` - Create escrow agreement

### **Components**

- `WalletConnection` - Wallet connection and status display
- `WalletFunding` - Funding interface with amount input
- `CheckoutPage` - Integrated checkout with wallet support

## Payment Flow

### **Wallet Payment Flow:**
1. **Connect Wallet** → User connects ICP wallet
2. **Fund Escrow** → Transfer ICP to escrow account
3. **Create Agreement** → Set up escrow with project details
4. **Project Work** → Freelancer completes work
5. **Approval** → Both parties approve completion
6. **Release Funds** → Freelancer receives payment (minus 10% fee)

### **Card Payment Flow:**
1. **Select Card** → Choose credit/debit card option
2. **Process Payment** → Traditional payment processing
3. **Create Agreement** → Set up escrow with project details
4. **Project Work** → Freelancer completes work
5. **Approval** → Both parties approve completion
6. **Release Funds** → Freelancer receives payment (minus 10% fee)

## Fee Structure

### **Platform Fees:**
- **10% platform fee** on all transactions
- **Automatic deduction** from total amount
- **Transparent display** in checkout summary

### **Example Calculation:**
- Service Price: $100
- Platform Fee (10%): $10
- **Total Amount**: $110
- **Freelancer Receives**: $90 (after platform fee)

## Security & Dispute Resolution

### **Escrow Protection:**
- Funds held securely until project completion
- No release without mutual approval
- Automatic dispute resolution for overdue projects

### **Refund Scenarios:**
- **Client Cancellation**: Full refund (including platform fee)
- **Dispute (Client Wins)**: Full refund (including platform fee)
- **Dispute (Freelancer Wins)**: Net amount to freelancer
- **Project Completion**: Net amount to freelancer

### **Dispute Resolution:**
- **Automatic Overdue Detection**: Projects past deadline enter dispute
- **Arbitrator System**: Third-party dispute resolution
- **Fair Resolution**: Evidence-based decision making

## Development Notes

### **Current Implementation:**
- **Mock Wallet**: Uses anonymous identity for development
- **Simulated Transactions**: Mock transaction IDs and confirmations
- **Local Testing**: Works with local ICP network

### **Production Requirements:**
- **Real Wallet Integration**: Internet Identity, Plug, Stoic, etc.
- **ICP Ledger Integration**: Real transaction verification
- **Network Configuration**: Mainnet or testnet deployment

### **Wallet Support:**
- **Internet Identity**: Primary authentication method
- **Plug Wallet**: Browser extension wallet
- **Stoic Wallet**: Web-based wallet
- **NFID**: Identity and wallet solution

## Troubleshooting

### **Common Issues:**

1. **Wallet Not Connecting**
   - Check browser wallet extension
   - Verify network connection
   - Try refreshing the page

2. **Insufficient Balance**
   - Check wallet balance
   - Ensure enough ICP for transaction + fees
   - Consider funding wallet first

3. **Transaction Failed**
   - Verify network status
   - Check transaction details
   - Try again with higher gas limit

4. **Escrow Creation Failed**
   - Ensure wallet funding completed
   - Check all required fields filled
   - Verify freelancer principal ID

### **Support:**
- Check browser console for error messages
- Verify wallet connection status
- Contact support with transaction IDs

## Future Enhancements

### **Planned Features:**
- **Multi-token Support**: Support for other ICP tokens
- **Batch Payments**: Multiple project funding
- **Payment Scheduling**: Recurring payment support
- **Advanced Analytics**: Payment history and insights

### **Integration Opportunities:**
- **DeFi Protocols**: Integration with lending/borrowing
- **NFT Payments**: Support for NFT-based services
- **Cross-chain**: Multi-blockchain support
- **Mobile Wallets**: Mobile app integration

## Conclusion

The ICP wallet integration provides a secure, transparent, and efficient way to fund escrow accounts for freelance projects. With automatic fee management, dispute resolution, and comprehensive security features, it ensures fair transactions for both clients and freelancers.

For technical support or feature requests, please contact the development team or create an issue in the project repository.
