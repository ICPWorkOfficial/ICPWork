// Multi-wallet connector for ICP wallets (Plug, Stoic, WalletConnect)

import { Principal } from '@dfinity/principal';
import { HttpAgent } from '@dfinity/agent';
import { plugWalletService } from './plug-wallet-service';

export interface WalletInfo {
  name: string;
  id: string;
  icon: string;
  description: string;
  installed: boolean;
  downloadUrl?: string;
}

export interface WalletConnection {
  wallet: WalletInfo;
  principal: Principal;
  accountId: string;
  balance?: number;
  connected: boolean;
}

export interface WalletConnector {
  connect(): Promise<WalletConnection>;
  disconnect(): Promise<void>;
  getBalance(): Promise<number>;
  signMessage(message: string): Promise<string>;
  transfer(to: string, amount: number): Promise<string>;
  isConnected(): boolean;
  getPrincipal(): Principal | null;
}

// Plug Wallet Connector
class PlugWalletConnector implements WalletConnector {
  private connection: WalletConnection | null = null;

  async connect(): Promise<WalletConnection> {
    try {
      const plugConnection = await plugWalletService.connect();

      this.connection = {
        wallet: {
          name: 'Plug Wallet',
          id: 'plug',
          icon: 'https://plugwallet.ooo/assets/icon.svg',
          description: 'The most popular ICP wallet',
          installed: true
        },
        principal: plugConnection.principal,
        accountId: plugConnection.accountId,
        balance: plugConnection.balance,
        connected: true
      };

      return this.connection;
    } catch (error: any) {
      throw new Error(`Failed to connect to Plug wallet: ${error.message}`);
    }
  }

  async disconnect(): Promise<void> {
    await plugWalletService.disconnect();
    this.connection = null;
  }

  async getBalance(): Promise<number> {
    if (!this.connection) {
      throw new Error('Plug wallet not connected');
    }

    try {
      return await plugWalletService.getBalance();
    } catch (error: any) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.connection) {
      throw new Error('Plug wallet not connected');
    }

    try {
      return await plugWalletService.signMessage(message);
    } catch (error: any) {
      throw new Error(`Failed to sign message: ${error.message}`);
    }
  }

  async transfer(to: string, amount: number): Promise<string> {
    if (!this.connection) {
      throw new Error('Plug wallet not connected');
    }

    try {
      return await plugWalletService.transfer(to, amount);
    } catch (error: any) {
      throw new Error(`Failed to transfer: ${error.message}`);
    }
  }

  isConnected(): boolean {
    return this.connection?.connected || false;
  }

  getPrincipal(): Principal | null {
    return this.connection?.principal || null;
  }
}

// Stoic Wallet Connector
class StoicWalletConnector implements WalletConnector {
  private connection: WalletConnection | null = null;

  async connect(): Promise<WalletConnection> {
    if (!window.ic?.stoic) {
      throw new Error('Stoic wallet not installed. Please install from https://www.stoicwallet.com/');
    }

    try {
      const isConnected = await window.ic.stoic.isConnected();
      if (!isConnected) {
        await window.ic.stoic.connect();
      }

      const principal = await window.ic.stoic.getPrincipal();
      
      // Validate Principal
      if (!principal || !Principal.isValid(principal.toString())) {
        throw new Error('Invalid Principal received from Stoic wallet');
      }

      // Get account ID - use principal as fallback since getAccountId might not be available
      let accountId: string;
      try {
        // Try to get account ID if method exists
        if (typeof window.ic.stoic.getAccountId === 'function') {
          accountId = await window.ic.stoic.getAccountId();
        } else {
          // Fallback to principal string
          accountId = principal.toString();
        }
      } catch (error) {
        // Fallback to principal string
        accountId = principal.toString();
      }
      
      const balance = await this.getBalance();

      this.connection = {
        wallet: {
          name: 'Stoic Wallet',
          id: 'stoic',
          icon: 'https://www.stoicwallet.com/icon.svg',
          description: 'Secure and user-friendly ICP wallet',
          installed: true
        },
        principal,
        accountId,
        balance,
        connected: true
      };

      return this.connection;
    } catch (error) {
      throw new Error(`Failed to connect to Stoic wallet: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (window.ic?.stoic) {
      await window.ic.stoic.disconnect();
    }
    this.connection = null;
  }

  async getBalance(): Promise<number> {
    if (!window.ic?.stoic) {
      throw new Error('Stoic wallet not connected');
    }

    try {
      const balance = await window.ic.stoic.getBalance();
      return parseFloat(balance.toString());
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!window.ic?.stoic) {
      throw new Error('Stoic wallet not connected');
    }

    try {
      const signature = await window.ic.stoic.signMessage(message);
      return signature;
    } catch (error) {
      throw new Error(`Failed to sign message: ${error}`);
    }
  }

  async transfer(to: string, amount: number): Promise<string> {
    if (!window.ic?.stoic) {
      throw new Error('Stoic wallet not connected');
    }

    try {
      const result = await window.ic.stoic.transfer({
        to,
        amount,
        fee: 0.0001
      });
      return result.transactionId;
    } catch (error) {
      throw new Error(`Failed to transfer: ${error}`);
    }
  }

  isConnected(): boolean {
    return this.connection?.connected || false;
  }

  getPrincipal(): Principal | null {
    return this.connection?.principal || null;
  }
}

// WalletConnect Connector (for mobile wallets)
class WalletConnectConnector implements WalletConnector {
  private connection: WalletConnection | null = null;
  private provider: any = null;

  async connect(): Promise<WalletConnection> {
    try {
      // Initialize WalletConnect provider
      const WalletConnectProvider = (await import('@walletconnect/web3-provider')).default;
      
      this.provider = new WalletConnectProvider({
        rpc: {
          1: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID', // Replace with your Infura project ID
        },
        chainId: 1,
      });

      // Enable session (triggers QR Code modal)
      await this.provider.enable();

      // Get accounts
      const accounts = await this.provider.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const accountId = accounts[0];
      const principal = Principal.fromText(accountId);
      const balance = await this.getBalance();

      this.connection = {
        wallet: {
          name: 'WalletConnect',
          id: 'walletconnect',
          icon: 'https://walletconnect.com/walletconnect-logo.svg',
          description: 'Connect to mobile wallets',
          installed: true
        },
        principal,
        accountId,
        balance,
        connected: true
      };

      return this.connection;
    } catch (error: any) {
      // Handle specific WalletConnect errors
      if (error.message?.includes('User closed modal') || error.message?.includes('User rejected')) {
        throw new Error('Connection cancelled by user');
      } else if (error.message?.includes('Session rejected')) {
        throw new Error('Connection rejected by wallet');
      } else {
        throw new Error(`Failed to connect via WalletConnect: ${error.message || error}`);
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.provider) {
      await this.provider.disconnect();
    }
    this.connection = null;
  }

  async getBalance(): Promise<number> {
    if (!this.provider) {
      throw new Error('WalletConnect not connected');
    }

    try {
      const balance = await this.provider.request({
        method: 'eth_getBalance',
        params: [this.connection?.accountId, 'latest'],
      });
      return parseInt(balance, 16) / 1e18; // Convert from wei to ETH
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.provider) {
      throw new Error('WalletConnect not connected');
    }

    try {
      const signature = await this.provider.request({
        method: 'personal_sign',
        params: [message, this.connection?.accountId],
      });
      return signature;
    } catch (error) {
      throw new Error(`Failed to sign message: ${error}`);
    }
  }

  async transfer(to: string, amount: number): Promise<string> {
    if (!this.provider) {
      throw new Error('WalletConnect not connected');
    }

    try {
      const result = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: this.connection?.accountId,
          to,
          value: `0x${(amount * 1e18).toString(16)}`, // Convert to wei
        }],
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to transfer: ${error}`);
    }
  }

  isConnected(): boolean {
    return this.connection?.connected || false;
  }

  getPrincipal(): Principal | null {
    return this.connection?.principal || null;
  }
}

// Main Wallet Manager
class WalletManager {
  private connectors: Map<string, WalletConnector> = new Map();
  private currentConnection: WalletConnection | null = null;

  constructor() {
    this.connectors.set('plug', new PlugWalletConnector());
    this.connectors.set('stoic', new StoicWalletConnector());
    this.connectors.set('walletconnect', new WalletConnectConnector());
  }

  getAvailableWallets(): WalletInfo[] {
    const wallets: WalletInfo[] = [
      {
        name: 'Plug Wallet',
        id: 'plug',
        icon: 'https://plugwallet.ooo/assets/icon.svg',
        description: 'The most popular ICP wallet',
        installed: plugWalletService.isAvailable(),
        downloadUrl: 'https://plugwallet.ooo/'
      },
      {
        name: 'Stoic Wallet',
        id: 'stoic',
        icon: 'https://www.stoicwallet.com/icon.svg',
        description: 'Secure and user-friendly ICP wallet',
        installed: !!window.ic?.stoic,
        downloadUrl: 'https://www.stoicwallet.com/'
      },
      {
        name: 'WalletConnect',
        id: 'walletconnect',
        icon: 'https://walletconnect.com/walletconnect-logo.svg',
        description: 'Connect to mobile wallets',
        installed: true
      }
    ];

    return wallets;
  }

  async connectWallet(walletId: string): Promise<WalletConnection> {
    const connector = this.connectors.get(walletId);
    if (!connector) {
      throw new Error(`Wallet ${walletId} not supported`);
    }

    try {
      const connection = await connector.connect();
      this.currentConnection = connection;
      return connection;
    } catch (error) {
      throw new Error(`Failed to connect to ${walletId}: ${error}`);
    }
  }

  async disconnectWallet(): Promise<void> {
    if (this.currentConnection) {
      const connector = this.connectors.get(this.currentConnection.wallet.id);
      if (connector) {
        await connector.disconnect();
      }
      this.currentConnection = null;
    }
  }

  getCurrentConnection(): WalletConnection | null {
    return this.currentConnection;
  }

  isConnected(): boolean {
    return this.currentConnection?.connected || false;
  }

  async getBalance(): Promise<number> {
    if (!this.currentConnection) {
      throw new Error('No wallet connected');
    }

    const connector = this.connectors.get(this.currentConnection.wallet.id);
    if (!connector) {
      throw new Error('Wallet connector not found');
    }

    return await connector.getBalance();
  }

  async signMessage(message: string): Promise<string> {
    if (!this.currentConnection) {
      throw new Error('No wallet connected');
    }

    const connector = this.connectors.get(this.currentConnection.wallet.id);
    if (!connector) {
      throw new Error('Wallet connector not found');
    }

    return await connector.signMessage(message);
  }

  async transfer(to: string, amount: number): Promise<string> {
    if (!this.currentConnection) {
      throw new Error('No wallet connected');
    }

    const connector = this.connectors.get(this.currentConnection.wallet.id);
    if (!connector) {
      throw new Error('Wallet connector not found');
    }

    return await connector.transfer(to, amount);
  }
}

// Export singleton instance
export const walletManager = new WalletManager();

// Extend Window interface for wallet objects
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
      stoic?: {
        isConnected(): Promise<boolean>;
        connect(): Promise<void>;
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
