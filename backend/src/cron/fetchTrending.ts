import cron from 'node-cron';
import { addTokenFetchJob } from '../queues/tokenQueue';
import { fetchDexScreenerTokens } from '../services/dexProvider';

cron.schedule('*/30 * * * * *', async () => {
    console.log("🔄 Fetching trending tokens from DexScreener search...");

    // DexScreener mein koi official 'trending' endpoint nahi hai.
    // Hum popular tickers (Meme/Stablecoin) search karke list ko wide karte hain.
    // Isse humare Redis cache mein zyada unique token addresses aayenge.
    const searchQueries = ["SOL", "DOG", "PEPE", "WIF", "USDC"];

    const allTrendingTokens = [];

    for (const query of searchQueries) {
        try {
            const tokens = await fetchDexScreenerTokens(query);
            allTrendingTokens.push(...tokens);
        } catch (error) {
            console.error(`Error fetching trending for ${query}`);
        }
    }

    // Total tokens ki list ko unique addresses par filter karte hain
    const uniqueAddresses = Array.from(new Set(allTrendingTokens.map(t => t.token_address)));

    // Top 50 tokens (jo DexScreener ne search results mein diye)
    const topAddresses = uniqueAddresses.slice(0, 50);

    for (const address of topAddresses) {
        await addTokenFetchJob({ tokenAddress: address });
    }

    console.log(`🚀 Added ${topAddresses.length} unique trending tokens to BullMQ queue.`);
});