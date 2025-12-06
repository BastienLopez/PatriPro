// Centralized pricing service for stocks, ETFs, and crypto
// Uses free APIs with fallback to mock data

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  change7d: number;
  change1m: number;
  status: 'live' | 'mock' | 'error';
  lastUpdated: Date;
}

export interface PriceResult {
  data: Record<string, PriceData>;
  source: 'api' | 'mock';
  error?: string;
}

// Mock data for fallback when APIs are unavailable
const mockCryptoPrices: Record<string, PriceData> = {
  BTC: { symbol: 'BTC', price: 98500, change24h: 2.5, change7d: 5.1, change1m: 12.3, status: 'mock', lastUpdated: new Date() },
  ETH: { symbol: 'ETH', price: 3450, change24h: 1.8, change7d: 3.2, change1m: 8.5, status: 'mock', lastUpdated: new Date() },
  SOL: { symbol: 'SOL', price: 185, change24h: 3.2, change7d: 8.5, change1m: 15.2, status: 'mock', lastUpdated: new Date() },
  XRP: { symbol: 'XRP', price: 2.35, change24h: -1.2, change7d: 4.5, change1m: 180.5, status: 'mock', lastUpdated: new Date() },
  ADA: { symbol: 'ADA', price: 1.05, change24h: 0.8, change7d: 2.1, change1m: 45.3, status: 'mock', lastUpdated: new Date() },
};

const mockStockPrices: Record<string, PriceData> = {
  NVDA: { symbol: 'NVDA', price: 145.50, change24h: 1.2, change7d: 3.5, change1m: -5.2, status: 'mock', lastUpdated: new Date() },
  AAPL: { symbol: 'AAPL', price: 248.75, change24h: 0.5, change7d: 1.8, change1m: 4.2, status: 'mock', lastUpdated: new Date() },
  AMZN: { symbol: 'AMZN', price: 215.30, change24h: -0.3, change7d: 2.1, change1m: 6.8, status: 'mock', lastUpdated: new Date() },
  MSFT: { symbol: 'MSFT', price: 435.20, change24h: 0.8, change7d: 1.5, change1m: 3.2, status: 'mock', lastUpdated: new Date() },
  GOOGL: { symbol: 'GOOGL', price: 178.50, change24h: 1.1, change7d: 2.8, change1m: 5.5, status: 'mock', lastUpdated: new Date() },
  TSLA: { symbol: 'TSLA', price: 352.80, change24h: 2.5, change7d: 8.2, change1m: 35.5, status: 'mock', lastUpdated: new Date() },
};

const mockEtfPrices: Record<string, PriceData> = {
  'AM.PEA MS.WLD': { symbol: 'AM.PEA MS.WLD', price: 5.52, change24h: 0.3, change7d: 1.2, change1m: 2.8, status: 'mock', lastUpdated: new Date() },
  'PEAEM': { symbol: 'PEAEM', price: 29.15, change24h: 0.5, change7d: 1.8, change1m: 3.5, status: 'mock', lastUpdated: new Date() },
  'AM.EMUMSC': { symbol: 'AM.EMUMSC', price: 17.20, change24h: 0.2, change7d: 0.8, change1m: 1.5, status: 'mock', lastUpdated: new Date() },
  'SP500PEA': { symbol: 'SP500PEA', price: 5.85, change24h: 0.4, change7d: 1.5, change1m: 3.2, status: 'mock', lastUpdated: new Date() },
  'XAUUSD': { symbol: 'XAUUSD', price: 2650, change24h: 0.1, change7d: 0.5, change1m: 2.1, status: 'mock', lastUpdated: new Date() },
};

// Get API keys from localStorage settings
function getApiKeys(): { coingecko?: string; alphaVantage?: string } {
  try {
    const settings = localStorage.getItem('patripro_settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      return {
        coingecko: parsed.coingeckoApiKey || undefined,
        alphaVantage: parsed.alphaVantageApiKey || undefined,
      };
    }
  } catch {
    // Ignore parse errors
  }
  return {};
}

// Fetch crypto prices from CoinGecko API
export async function getCryptoPrices(symbols: string[]): Promise<PriceResult> {
  const apiKeys = getApiKeys();
  
  // Map common symbols to CoinGecko IDs
  const symbolToId: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    SOL: 'solana',
    XRP: 'ripple',
    ADA: 'cardano',
    DOGE: 'dogecoin',
    DOT: 'polkadot',
    AVAX: 'avalanche-2',
    LINK: 'chainlink',
    MATIC: 'matic-network',
  };

  try {
    const ids = symbols
      .map(s => symbolToId[s.toUpperCase()] || s.toLowerCase())
      .join(',');

    const url = new URL('https://api.coingecko.com/api/v3/coins/markets');
    url.searchParams.set('vs_currency', 'eur');
    url.searchParams.set('ids', ids);
    url.searchParams.set('price_change_percentage', '24h,7d,30d');
    
    if (apiKeys.coingecko) {
      url.searchParams.set('x_cg_demo_api_key', apiKeys.coingecko);
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const result: Record<string, PriceData> = {};

    for (const coin of data) {
      const symbol = Object.keys(symbolToId).find(
        k => symbolToId[k] === coin.id
      ) || coin.symbol.toUpperCase();
      
      result[symbol] = {
        symbol,
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h || 0,
        change7d: coin.price_change_percentage_7d_in_currency || 0,
        change1m: coin.price_change_percentage_30d_in_currency || 0,
        status: 'live',
        lastUpdated: new Date(),
      };
    }

    // Fill missing symbols with mock data
    for (const symbol of symbols) {
      const upperSymbol = symbol.toUpperCase();
      if (!result[upperSymbol] && mockCryptoPrices[upperSymbol]) {
        result[upperSymbol] = { ...mockCryptoPrices[upperSymbol] };
      }
    }

    return { data: result, source: 'api' };
  } catch (error) {
    console.warn('CoinGecko API unavailable, using mock data:', error);
    
    // Return mock data as fallback
    const result: Record<string, PriceData> = {};
    for (const symbol of symbols) {
      const upperSymbol = symbol.toUpperCase();
      if (mockCryptoPrices[upperSymbol]) {
        result[upperSymbol] = { ...mockCryptoPrices[upperSymbol] };
      } else {
        result[upperSymbol] = {
          symbol: upperSymbol,
          price: 0,
          change24h: 0,
          change7d: 0,
          change1m: 0,
          status: 'error',
          lastUpdated: new Date(),
        };
      }
    }
    
    return { 
      data: result, 
      source: 'mock',
      error: 'Données de marché indisponibles pour le moment.'
    };
  }
}

// Fetch stock/ETF prices (mock implementation - Alpha Vantage has strict rate limits)
export async function getStockEtfPrices(symbols: string[]): Promise<PriceResult> {
  // For now, return mock data as Alpha Vantage free tier is very limited
  // In production, you would implement actual API calls here
  
  const result: Record<string, PriceData> = {};
  
  for (const symbol of symbols) {
    const upperSymbol = symbol.toUpperCase();
    
    // Check stocks first, then ETFs
    if (mockStockPrices[upperSymbol]) {
      result[upperSymbol] = { ...mockStockPrices[upperSymbol] };
    } else if (mockEtfPrices[symbol]) {
      result[symbol] = { ...mockEtfPrices[symbol] };
    } else {
      // Generate mock data for unknown symbols
      result[symbol] = {
        symbol,
        price: Math.random() * 100 + 10,
        change24h: (Math.random() - 0.5) * 4,
        change7d: (Math.random() - 0.5) * 8,
        change1m: (Math.random() - 0.5) * 15,
        status: 'mock',
        lastUpdated: new Date(),
      };
    }
  }
  
  return { 
    data: result, 
    source: 'mock',
    error: symbols.length > 0 ? undefined : 'Aucun symbole fourni.'
  };
}

// Get all prices for a list of holdings (mixed assets)
export async function getAllPrices(
  cryptoSymbols: string[],
  stockEtfSymbols: string[]
): Promise<{ crypto: PriceResult; stocks: PriceResult }> {
  const [crypto, stocks] = await Promise.all([
    cryptoSymbols.length > 0 ? getCryptoPrices(cryptoSymbols) : { data: {}, source: 'mock' as const },
    stockEtfSymbols.length > 0 ? getStockEtfPrices(stockEtfSymbols) : { data: {}, source: 'mock' as const },
  ]);
  
  return { crypto, stocks };
}

// Calculate PnL for a holding
export function calculatePnL(
  quantity: number,
  buyPrice: number,
  currentPrice: number
): { pnlValue: number; pnlPercent: number } {
  const invested = quantity * buyPrice;
  const currentValue = quantity * currentPrice;
  const pnlValue = currentValue - invested;
  const pnlPercent = invested > 0 ? (pnlValue / invested) * 100 : 0;
  
  return { pnlValue, pnlPercent };
}