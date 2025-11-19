import { Queue, Job } from 'bullmq';
import { connection } from './connection'; // Connection yahan import ho raha hai

// ✅ Re-export connection taaki worker use kar sake
export { connection } from './connection';

// Queue ka naam
export const TOKEN_FETCH_QUEUE = 'TokenFetchQueue';

// Job ka type (token ka address jo hum fetch karna chahte hain)
export interface TokenJobData {
    tokenAddress: string;
}

// Queue instance
export const tokenQueue = new Queue<TokenJobData>(TOKEN_FETCH_QUEUE, {
    connection,
    defaultJobOptions: {
        attempts: 3, // Agar fail ho toh 3 baar retry kare
        backoff: {
            type: 'exponential', // 1s, 2s, 4s ke baad retry
            delay: 1000,
        },
        removeOnComplete: true, // Job khatam hone ke baad queue se hat jaye
        removeOnFail: 5, // Fail hone par 5 din tak record rakhe
    },
});

// Function to add a single job
export const addTokenFetchJob = async (data: TokenJobData) => {
    return tokenQueue.add('fetchTokenDetails', data);
};
