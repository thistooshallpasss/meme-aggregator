import got from 'got'; // This now points to Got v11
import Bottleneck from 'bottleneck';
import { DexScreenerPair, TokenData } from '../types';

// Rate Limiter Setup (Same as before)
const limiter = new Bottleneck({
    reservoir: 300,
    reservoirRefreshAmount: 300,
    reservoirRefreshInterval: 60 * 1000,
    minTime: 200,
});

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex/search';

// Wrapper to handle fetching logic
export const fetchDexScreenerTokens = async (query: string): Promise<TokenData[]> => {
    try {
        // Got v11 ke saath, hum responseType: 'json' use karte hain 
        // aur response.body ko manually type cast karte hain.
        const response = await limiter.schedule(() =>
            got(`${DEXSCREENER_API}?q=${query}`, {
                responseType: 'json',
                timeout: 5000
            })
        );

        // Got v11 mein response.body automatic JSON parse ho chuka hoga
        const data = response.body as { pairs: DexScreenerPair[] };

        if (!data.pairs) return [];

        // Transformation logic (no change)
        return data.pairs.map((pair) => ({
            token_address: pair.baseToken.address,
            token_name: pair.baseToken.name,
            token_ticker: pair.baseToken.symbol,
            price_sol: parseFloat(pair.priceNative),
            market_cap_sol: pair.liquidity?.usd || 0,
            volume_sol: pair.volume.h24,
            liquidity_sol: pair.liquidity?.base || 0,
            transaction_count: 0,
            price_1hr_change: pair.priceChange.h1,
            protocol: `DexScreener (${pair.dexId})`
        }));

    } catch (error) {
        // Yahan hum Got error handling use karenge (error.response.body access karna)
        console.error(`❌ Error fetching from DexScreener:`, (error as any).response?.body || error);
        return [];
    }
};