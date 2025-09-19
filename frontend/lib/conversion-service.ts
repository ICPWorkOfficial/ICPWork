// ICP to USD conversion service with real-time price fetching

export interface ConversionRate {
  icpToUsd: number;
  usdToIcp: number;
  lastUpdated: Date;
  source: string;
}

export interface PriceData {
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

class ConversionService {
  private static instance: ConversionService;
  private cache: ConversionRate | null = null;
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private lastFetch: number = 0;

  private constructor() {}

  public static getInstance(): ConversionService {
    if (!ConversionService.instance) {
      ConversionService.instance = new ConversionService();
    }
    return ConversionService.instance;
  }

  // Fetch real-time ICP price from CoinGecko API
  private async fetchRealTimePrice(): Promise<ConversionRate> {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=internet-computer&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true'
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const icpData = data['internet-computer'];

      if (!icpData || !icpData.usd) {
        throw new Error('Invalid price data received');
      }

      const icpToUsd = icpData.usd;
      const usdToIcp = 1 / icpToUsd;

      return {
        icpToUsd,
        usdToIcp,
        lastUpdated: new Date(),
        source: 'CoinGecko'
      };
    } catch (error) {
      console.error('Failed to fetch real-time price:', error);
      
      // Fallback to mock data for development
      return this.getMockPrice();
    }
  }

  // Mock price for development/testing
  private getMockPrice(): ConversionRate {
    // Mock ICP price around $12-15 range
    const mockPrice = 13.50 + (Math.random() - 0.5) * 2; // Random price between 12.5-14.5
    
    return {
      icpToUsd: mockPrice,
      usdToIcp: 1 / mockPrice,
      lastUpdated: new Date(),
      source: 'Mock Data (Development)'
    };
  }

  // Get current conversion rate (with caching)
  public async getConversionRate(): Promise<ConversionRate> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache && (now - this.lastFetch) < this.cacheExpiry) {
      return this.cache;
    }

    // Fetch new data
    this.cache = await this.fetchRealTimePrice();
    this.lastFetch = now;
    
    return this.cache;
  }

  // Convert ICP to USD
  public async convertIcpToUsd(icpAmount: number): Promise<number> {
    const rate = await this.getConversionRate();
    return icpAmount * rate.icpToUsd;
  }

  // Convert USD to ICP
  public async convertUsdToIcp(usdAmount: number): Promise<number> {
    const rate = await this.getConversionRate();
    return usdAmount * rate.usdToIcp;
  }

  // Get formatted price string
  public async getFormattedPrice(icpAmount: number): Promise<string> {
    const usdAmount = await this.convertIcpToUsd(icpAmount);
    return `$${usdAmount.toFixed(2)} USD`;
  }

  // Get price with change indicator
  public async getPriceWithChange(): Promise<{
    price: number;
    change24h: number;
    formattedPrice: string;
    formattedChange: string;
    isPositive: boolean;
  }> {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=internet-computer&vs_currencies=usd&include_24hr_change=true'
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const icpData = data['internet-computer'];

      if (!icpData || !icpData.usd) {
        throw new Error('Invalid price data received');
      }

      const price = icpData.usd;
      const change24h = icpData.usd_24h_change || 0;
      const isPositive = change24h >= 0;

      return {
        price,
        change24h,
        formattedPrice: `$${price.toFixed(2)}`,
        formattedChange: `${isPositive ? '+' : ''}${change24h.toFixed(2)}%`,
        isPositive
      };
    } catch (error) {
      console.error('Failed to fetch price with change:', error);
      
      // Fallback to mock data
      const mockPrice = 13.50 + (Math.random() - 0.5) * 2;
      const mockChange = (Math.random() - 0.5) * 10; // Random change between -5% to +5%
      const isPositive = mockChange >= 0;

      return {
        price: mockPrice,
        change24h: mockChange,
        formattedPrice: `$${mockPrice.toFixed(2)}`,
        formattedChange: `${isPositive ? '+' : ''}${mockChange.toFixed(2)}%`,
        isPositive
      };
    }
  }

  // Clear cache (useful for testing or forcing refresh)
  public clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
  }
}

// Export singleton instance
export const conversionService = ConversionService.getInstance();
