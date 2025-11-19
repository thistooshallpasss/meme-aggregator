import { socketPublisher } from '../sockets/socketManager';
import { Worker, Job } from 'bullmq';
import { connection, TOKEN_FETCH_QUEUE, TokenJobData } from '../queues/tokenQueue';
import { fetchDexScreenerTokens } from '../services/dexProvider';
import { mergeTokenData } from '../services/aggregator'; // <-- Correct import
import redis from '../utils/redis';

const CACHE_KEY_PREFIX = 'token:merged:';
const CACHE_TTL_SECONDS = 30;

const processTokenJob = async (job: Job<TokenJobData>) => {
    const { tokenAddress } = job.data;

    // 1. Fetch DexScreener data
    const rawSources = await fetchDexScreenerTokens(tokenAddress);
    if (rawSources.length === 0) {
        console.log(`[Worker] No DexScreener data found for ${tokenAddress}`);
        return;
    }

    // 2. Aggregate & Merge with Jupiter price
    const mergedToken = mergeTokenData(rawSources); // <-- FIX: Simple merge use kiya
    if (!mergedToken) {
        throw new Error(`Failed to merge data for ${tokenAddress}`);
    }

    // 3. Save in Redis cache
    const cacheKey = `${CACHE_KEY_PREFIX}${mergedToken.token_address}`;
    await redis.set(cacheKey, JSON.stringify(mergedToken), 'EX', CACHE_TTL_SECONDS);

    // 4. Publish to Socket Server
    await socketPublisher.publish(
        'token_price_updates',
        JSON.stringify(mergedToken)
    );

    console.log(`[Worker] ✅ Processed & Cached: ${mergedToken.token_ticker} | Price: ${mergedToken.price_sol}`);

    return mergedToken;
};

export const tokenWorker = new Worker<TokenJobData>(TOKEN_FETCH_QUEUE, processTokenJob, {
    connection,
    concurrency: 5,
});

tokenWorker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error:`, err);
});
