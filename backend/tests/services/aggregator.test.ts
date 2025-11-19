import { mergeTokenData } from '../../src/services/aggregator';
import { TokenData } from '../../src/types';

describe('Aggregator Service Tests', () => {
    // Sample Data: Same token (MOODENG SOL) on 3 different DEXs
    const mockTokenA: TokenData = {
        token_address: 'TOKEN_MOODENG_SOL',
        token_name: 'Moo Deng',
        token_ticker: 'MOODENG',
        price_sol: 0.000010,
        market_cap_sol: 1000,
        volume_sol: 50,
        liquidity_sol: 500, // Highest Liquidity
        transaction_count: 0,
        price_1hr_change: -1.0,
        protocol: 'Raydium'
    };

    const mockTokenB: TokenData = {
        token_address: 'TOKEN_MOODENG_SOL',
        token_name: 'Moo Deng',
        token_ticker: 'MOODENG',
        price_sol: 0.000008, // Lower Price
        market_cap_sol: 800,
        volume_sol: 30,
        liquidity_sol: 200,
        transaction_count: 0,
        price_1hr_change: 2.5, // Best Price Change
        protocol: 'Orca'
    };

    const mockTokenC: TokenData = {
        token_address: 'TOKEN_MOODENG_SOL',
        token_name: 'Moo Deng',
        token_ticker: 'MOODENG',
        price_sol: 0.000012, // Highest Price, Low Liquidity
        market_cap_sol: 1200,
        volume_sol: 20,
        liquidity_sol: 100,
        transaction_count: 0,
        price_1hr_change: 0.5,
        protocol: 'Meteora'
    };

    test('should correctly merge data from multiple sources', () => {
        const merged = mergeTokenData([mockTokenA, mockTokenB, mockTokenC]);

        expect(merged).not.toBeNull();
        if (!merged) return;

        // 1. Total Volume should be summed up (50 + 30 + 20 = 100)
        expect(merged.volume_sol).toBe(100);

        // 2. Total Liquidity should be summed up (500 + 200 + 100 = 800)
        expect(merged.liquidity_sol).toBe(800);

        // 3. Price should be selected from the source with the HIGHEST liquidity (Mock A: 500 liquidity, Price: 0.000010)
        expect(merged.price_sol).toBe(0.000010);

        // 4. Protocols should be merged
        expect(merged.protocol).toContain('Raydium, Orca, Meteora');
    });

    test('should return null if array is empty', () => {
        expect(mergeTokenData([])).toBeNull();
    });
});