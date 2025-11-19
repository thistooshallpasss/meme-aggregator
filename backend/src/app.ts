import discoverRoutes from './routes/discover'; // <--- New Import
import { setupSocketIO } from './sockets/socketManager';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config/env';
import redis from './utils/redis'; // Importing to trigger connection
import { fetchDexScreenerTokens } from './services/dexProvider';

const app = Fastify({
    logger: true // Development mein logs dekhne ke liye
});

// CORS register karte hain taaki Frontend baat kar sake
app.register(cors, {
    origin: '*', // Production mein isse frontend URL se replace karenge
});

// Discover API route register karna
app.register(discoverRoutes, { prefix: '/api/v1/discover' }); // <--- New Line

// Health Check Route (Resume/Interviews ke liye zaroori)
app.get('/ping', async (request, reply) => {
    // Check if Redis is actually working
    const redisStatus = redis.status === 'ready' ? 'Connected' : 'Disconnected';

    return {
        status: 'API is running 🚀',
        redis: redisStatus,
        timestamp: new Date()
    };
});

app.get('/test-fetch', async (request, reply) => {
    const query = (request.query as any).q || 'SOL'; // Default search 'SOL'
    console.log(`🔍 Searching for: ${query}`);

    const tokens = await fetchDexScreenerTokens(query);

    return {
        source: 'DexScreener',
        count: tokens.length,
        data: tokens.slice(0, 5) // Sirf top 5 dikhao abhi ke liye
    };
});

const start = async () => {
    try {
        // 1. SOCKET.IO INITIALIZATION: Pehle setup karo
        setupSocketIO(app); // <-- FIX: YE LINE UPAR LE AAYE

        // 2. Fastify server ko listen karwao
        await app.listen({ port: Number(config.PORT), host: '0.0.0.0' });
        console.log(`🚀 Server running at http://localhost:${config.PORT}`);

        // Redis connection check (yeh automatic ho chuka hoga, bas log kar rahe hain)
        console.log("✅ Redis Connected Successfully");

        // Initial hardcoded jobs add karo (CRON add hone tak)
        const { addTokenFetchJob } = require('./queues/tokenQueue');
        addTokenFetchJob({ tokenAddress: 'ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY' });
        addTokenFetchJob({ tokenAddress: '0x28561B8A2360F463011c16b6Cc0B0cbEF8dbBcad' });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
// NOTE: Worker ka pub/sub ordering issue Fix 2 se solve ho chuka hai (import time par).

start();