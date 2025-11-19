export interface TokenData {
    token_address: string;
    token_name: string;
    token_ticker: string;
    price_sol: number;
    market_cap_sol: number;
    volume_sol: number;
    liquidity_sol: number;
    transaction_count: number;
    price_1hr_change: number;
    protocol: string; // 'DexScreener' | 'Jupiter'
}

// DexScreener API response structure (partial)
export interface DexScreenerPair {
    chainId: string;
    dexId: string;
    url: string;
    baseToken: {
        address: string;
        name: string;
        symbol: string;
    };
    priceNative: string;
    priceUsd: string;
    volume: {
        h24: number;
    };
    liquidity?: {
        usd: number;
        base: number;
        quote: number;
    };
    priceChange: {
        h1: number;
        h24: number;
    };
}