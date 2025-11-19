import Redis from 'ioredis';
import { config } from '../config/env';

// Redis client instance create kar rahe hain
const redis = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: null, // BullMQ ke liye zaroori hai
    enableReadyCheck: false
});

redis.on('connect', () => {
    console.log('✅ Redis Connected Successfully');
});

redis.on('error', (err) => {
    console.error('❌ Redis Connection Error:', err);
});

export default redis;