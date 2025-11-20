import './cron/fetchTrending';
import discoverRoutes from './routes/discover'; // <--- New Import
import { setupSocketIO } from './sockets/socketManager';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config/env';
import redis from './utils/redis'; // Importing to trigger connection
import { fetchDexScreenerTokens } from './services/dexProvider';

// ✅ NEW: Worker import
import { tokenWorker } from './workers/fetchWorker'; // <--- IMPORTANT

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
        data: tokens.slice(0, 5)
    };
});

const start = async () => {
    try {
        // 1. SOCKET.IO INITIALIZATION:
        setupSocketIO(app);

        // 🟢 CRITICAL FIX: Worker should run inside Web Service (Render free plan)
        tokenWorker.run(); // <--- IMPORTANT

        // 2. Fastify server ko listen karwao
        await app.listen({ port: Number(config.PORT), host: '0.0.0.0' });
        console.log(`🚀 Server running at http://localhost:${config.PORT}`);

        // Redis connection check
        console.log("✅ Redis Connected Successfully");

    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
