import { NextRequest, NextResponse } from 'next/server';
import { conversionService } from '@/lib/conversion-service';

// GET - Get current ICP to USD conversion rate
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includePriceData = searchParams.get('includePriceData') === 'true';

    if (includePriceData) {
      // Return both conversion rate and price data with 24h change
      const [rate, priceData] = await Promise.all([
        conversionService.getConversionRate(),
        conversionService.getPriceWithChange()
      ]);

      return NextResponse.json({
        success: true,
        conversionRate: {
          icpToUsd: rate.icpToUsd,
          usdToIcp: rate.usdToIcp,
          lastUpdated: rate.lastUpdated.toISOString(),
          source: rate.source
        },
        priceData: {
          price: priceData.price,
          change24h: priceData.change24h,
          formattedPrice: priceData.formattedPrice,
          formattedChange: priceData.formattedChange,
          isPositive: priceData.isPositive
        }
      });
    } else {
      // Return just the conversion rate
      const rate = await conversionService.getConversionRate();

      return NextResponse.json({
        success: true,
        conversionRate: {
          icpToUsd: rate.icpToUsd,
          usdToIcp: rate.usdToIcp,
          lastUpdated: rate.lastUpdated.toISOString(),
          source: rate.source
        }
      });
    }
  } catch (error: any) {
    console.error('Conversion rate API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch conversion rate',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST - Convert specific amounts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, from, to } = body;

    if (!amount || !from || !to) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: amount, from, to' },
        { status: 400 }
      );
    }

    if (from === to) {
      return NextResponse.json({
        success: true,
        originalAmount: amount,
        convertedAmount: amount,
        from,
        to,
        rate: 1
      });
    }

    let convertedAmount: number;
    let rate: number;

    if (from === 'ICP' && to === 'USD') {
      convertedAmount = await conversionService.convertIcpToUsd(amount);
      const conversionRate = await conversionService.getConversionRate();
      rate = conversionRate.icpToUsd;
    } else if (from === 'USD' && to === 'ICP') {
      convertedAmount = await conversionService.convertUsdToIcp(amount);
      const conversionRate = await conversionService.getConversionRate();
      rate = conversionRate.usdToIcp;
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported conversion pair' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      originalAmount: amount,
      convertedAmount: convertedAmount,
      from,
      to,
      rate
    });
  } catch (error: any) {
    console.error('Conversion API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to convert amount',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
