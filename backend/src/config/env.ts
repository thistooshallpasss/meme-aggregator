import dotenv from 'dotenv';

dotenv.config();

export const config = {
    PORT: process.env.PORT || 4000,
    REDIS_URL: process.env.REDIS_URL as string, // <--- FIX: Default value 'localhost' hata diya
    NODE_ENV: process.env.NODE_ENV || 'development',
};
// Note: 'as string' cast zaroori hai kyunki humne default value hata di hai.

if (!config.REDIS_URL) {
    throw new Error("REDIS_URL is not set. Cannot connect to database.");
}