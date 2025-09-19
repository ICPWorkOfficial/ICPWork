import { HttpAgent, Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { Identity, Ed25519KeyIdentity } from '@dfinity/identity';

// Wallet connection types
export interface WalletConnection {
  principal: Principal;
  identity: Identity;
  isConnected: boolean;
  accountId?: string;
}

export interface WalletBalance {
  balance: string;
  currency: string;
  principal: string;
}

// Mock wallet service for development
export class WalletService {
  private static instance: WalletService;
  private connection: WalletConnection | null = null;
  private agent: HttpAgent | null = null;

  private constructor() {}

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  // Connect to wallet (mock implementation)
  public async connectWallet(): Promise<WalletConnection> {
    try {
      // In a real implementation, this would connect to Internet Identity or other wallets
      // For now, we'll create a mock connection using Ed25519KeyIdentity
      const identity = Ed25519KeyIdentity.generate();
      const principal = identity.getPrincipal();
      
      this.connection = {
        principal,
        identity,
        isConnected: true,
        accountId: principal.toText()
      };

      // Create agent with the identity
      this.agent = new HttpAgent({
        host: process.env.NODE_ENV === 'production' ? 'https://ic0.app' : 'http://localhost:4943',
        identity,
        verifyQuerySignatures: false,
        fetchRootKey: process.env.NODE_ENV !== 'production'
      });

      if (process.env.NODE_ENV !== 'production') {
        await this.agent.fetchRootKey();
      }

      return this.connection;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw new Error('Failed to connect wallet');
    }
  }

  // Disconnect wallet
  public disconnectWallet(): void {
    this.connection = null;
    this.agent = null;
  }

  // Get current connection
  public getConnection(): WalletConnection | null {
    return this.connection;
  }

  // Get wallet balance (mock implementation)
  public async getBalance(): Promise<WalletBalance> {
    if (!this.connection) {
      throw new Error('Wallet not connected');
    }

    // In a real implementation, this would query the ICP ledger
    // For now, return a mock balance
    return {
      balance: '10.5', // Mock balance in ICP
      currency: 'ICP',
      principal: this.connection.principal.toText()
    };
  }

  // Transfer ICP to escrow account
  public async transferToEscrow(amount: number, escrowCanisterId: string): Promise<string> {
    if (!this.connection || !this.agent) {
      throw new Error('Wallet not connected');
    }

    try {
      // In a real implementation, this would:
      // 1. Create a transfer transaction to the escrow canister
      // 2. Sign the transaction with the wallet
      // 3. Submit to the ICP network
      
      // For now, we'll simulate the transfer and call the escrow API
      console.log(`Transferring ${amount} ICP to escrow canister ${escrowCanisterId}`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock transaction ID
      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Call the escrow API to deposit funds
      const response = await fetch('/api/escrow/wallet-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          transactionId: transactionId,
          principal: this.connection.principal.toText()
        })
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to deposit funds to escrow');
      }
      
      return transactionId;
    } catch (error) {
      console.error('Transfer failed:', error);
      throw new Error('Transfer failed');
    }
  }

  // Get agent for canister interactions
  public getAgent(): HttpAgent | null {
    return this.agent;
  }

  // Check if wallet is connected
  public isConnected(): boolean {
    return this.connection?.isConnected || false;
  }

  // Get principal
  public getPrincipal(): Principal | null {
    return this.connection?.principal || null;
  }
}

// Export singleton instance
export const walletService = WalletService.getInstance();
