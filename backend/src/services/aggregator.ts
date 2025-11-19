import { TokenData } from '../types';

const getCanonicalId = (token: TokenData): string => {
    return token.token_address;
};

export const mergeTokenData = (sources: TokenData[]): TokenData | null => {
    if (sources.length === 0) return null;

    const base = sources[0];
    let totalVolume = 0;
    let totalLiquidity = 0;
    let bestPrice: number = 0;
    let maxLiquidity: number = 0;
    let bestPriceChange: number = base.price_1hr_change;

    const sourceProtocols: string[] = [];

    for (const token of sources) {
        totalVolume += token.volume_sol;
        totalLiquidity += token.liquidity_sol;
        sourceProtocols.push(token.protocol);

        if (token.liquidity_sol > maxLiquidity) {
            maxLiquidity = token.liquidity_sol;
            bestPrice = token.price_sol;
            bestPriceChange = token.price_1hr_change;
        }
    }

    return {
        ...base,
        price_sol: bestPrice || base.price_sol,
        volume_sol: totalVolume,
        liquidity_sol: totalLiquidity,
        price_1hr_change: bestPriceChange,
        protocol: Array.from(new Set(sourceProtocols)).join(', '),
    };
};
