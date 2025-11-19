import dotenv from 'dotenv';

dotenv.config();

export const config = {
    PORT: process.env.PORT || 4000,
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    NODE_ENV: process.env.NODE_ENV || 'development',
};