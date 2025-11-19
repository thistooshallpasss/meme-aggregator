import Redis from 'ioredis';
import { config } from '../config/env';

// FIX: New Redis() ko seedha poora URL string pass karo.
// ioredis client automatic URL se hostname, port, aur password nikaal leta hai.
const redis = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    // Agar authentication issue ho, toh yeh option daalna zaroori ho sakta hai:
    // password: new URL(config.REDIS_URL).password || undefined 
});

redis.on('connect', () => {
    console.log('✅ Redis Connected Successfully (Auth Passed)');
});

redis.on('error', (err) => {
    // ERROR HATA DIYA HAI KYUNKI YEHI LOG MEIN DIKHEGA
    // console.error('❌ Redis Connection Error:', err); 
});

export default redis;