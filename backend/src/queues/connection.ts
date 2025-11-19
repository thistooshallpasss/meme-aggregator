import { ConnectionOptions } from 'bullmq';
import { config } from '../config/env';

// BullMQ uses Redis, toh hum wohi settings use karenge
export const connection: ConnectionOptions = {
    host: new URL(config.REDIS_URL).hostname,
    port: parseInt(new URL(config.REDIS_URL).port || '6379'),
};