// backend/src/queues/connection.ts
import { ConnectionOptions } from 'bullmq';
import { config } from '../config/env';

// FIX: REDIS_URL string se components extract karo (No new URL() call in runtime)
const url = new URL(config.REDIS_URL);

export const connection: ConnectionOptions = {
    host: url.hostname,
    port: parseInt(url.port || '6379'),
    password: url.password || undefined,
};