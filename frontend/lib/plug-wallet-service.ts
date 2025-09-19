// Enhanced Plug Wallet Service with proper error handling

import { Principal } from '@dfinity/principal';

export interface PlugWalletInfo {
  principal: Principal;
  accountId: string;
  balance: number;
  connected: boolean;
}

class PlugWalletService {
  private static instance: PlugWalletService;
  private connection: PlugWalletInfo | null = null;

  private constructor() {}

  public static getInstance(): PlugWalletService {
    if (!PlugWalletService.instance) {
      PlugWalletService.instance = new PlugWalletService();
    }
    return PlugWalletService.instance;
  }

  // Check if Plug wallet is available
  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.ic?.plug;
  }

  // Check if already connected
  async isConnected(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    
    try {
      return await window.ic.plug.isConnected();
    } catch (error) {
      console.error('Error checking Plug connection:', error);
      return false;
    }
  }

  // Connect to Plug wallet
  async connect(): Promise<PlugWalletInfo> {
    if (!this.isAvailable()) {
      throw new Error('Plug wallet not installed. Please install from https://plugwallet.ooo/');
    }

    try {
      // Check if already connected
      const connected = await this.isConnected();
      if (!connected) {
        // Connect without whitelist to avoid Principal validation issues
        await window.ic.plug.requestConnect();
      }

      // Get wallet information
      const principal = await window.ic.plug.getPrincipal();
      
      // Validate Principal
      if (!principal) {
        throw new Error('No Principal received from Plug wallet');
      }

      // Convert to Principal object for validation
      let principalObj: Principal;
      try {
        principalObj = Principal.fromText(principal.toString());
      } catch (error) {
        throw new Error(`Invalid Principal format: ${principal}`);
      }

      // Get account ID - use principal as fallback since getAccountId might not be available
      let accountId: string;
      try {
        // Try to get account ID if method exists
        if (typeof window.ic.plug.getAccountId === 'function') {
          accountId = await window.ic.plug.getAccountId();
        } else {
          // Fallback to principal string
          accountId = principal.toString();
        }
      } catch (error) {
        // Fallback to principal string
        accountId = principal.toString();
      }

      // Get balance
      const balance = await this.getBalance();

      this.connection = {
        principal: principalObj,
        accountId: accountId,
        balance,
        connected: true
      };

      return this.connection;
    } catch (error: any) {
      console.error('Plug wallet connection error:', error);
      throw new Error(`Failed to connect to Plug wallet: ${error.message}`);
    }
  }

  // Disconnect from Plug wallet
  async disconnect(): Promise<void> {
    if (this.isAvailable()) {
      try {
        await window.ic.plug.disconnect();
      } catch (error) {
        console.error('Error disconnecting Plug wallet:', error);
      }
    }
    this.connection = null;
  }

  // Get current balance
  async getBalance(): Promise<number> {
    if (!this.isAvailable() || !this.connection) {
      return 0;
    }

    try {
      const balance = await window.ic.plug.getBalance();
      return parseFloat(balance.toString()) || 0;
    } catch (error) {
      console.error('Error getting Plug balance:', error);
      return 0;
    }
  }

  // Get current connection info
  getConnection(): PlugWalletInfo | null {
    return this.connection;
  }

  // Sign a message
  async signMessage(message: string): Promise<string> {
    if (!this.isAvailable() || !this.connection) {
      throw new Error('Plug wallet not connected');
    }

    try {
      const signature = await window.ic.plug.signMessage(message);
      return signature;
    } catch (error: any) {
      throw new Error(`Failed to sign message: ${error.message}`);
    }
  }

  // Transfer ICP
  async transfer(to: string, amount: number): Promise<string> {
    if (!this.isAvailable() || !this.connection) {
      throw new Error('Plug wallet not connected');
    }

    try {
      const result = await window.ic.plug.transfer({
        to,
        amount,
        fee: 0.0001
      });
      return result.transactionId || result.toString();
    } catch (error: any) {
      throw new Error(`Failed to transfer: ${error.message}`);
    }
  }

  // Request permissions for specific canisters
  async requestPermissions(canisterIds: string[]): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Plug wallet not available');
    }

    try {
      await window.ic.plug.requestConnect({
        whitelist: canisterIds,
        host: 'https://mainnet.dfinity.network'
      });
    } catch (error: any) {
      throw new Error(`Failed to request permissions: ${error.message}`);
    }
  }
}

// Export singleton instance
export const plugWalletService = PlugWalletService.getInstance();

// Extend Window interface
declare global {
  interface Window {
    ic?: {
      plug?: {
        isConnected(): Promise<boolean>;
        requestConnect(options?: any): Promise<void>;
        getPrincipal(): Promise<any>;
        getAccountId?(): Promise<string>; // Optional method
        getBalance(): Promise<any>;
        disconnect(): Promise<void>;
        signMessage(message: string): Promise<string>;
        transfer(params: { to: string; amount: number; fee: number }): Promise<any>;
      };
    };
  }
}
