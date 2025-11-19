import { FastifyInstance } from 'fastify';
import { Server, Socket } from 'socket.io'; // <--- Server yahan se aayega
import { createAdapter } from '@socket.io/redis-adapter';
import redis from '../utils/redis';

const UPDATE_CHANNEL = 'token_price_updates';

// Redis Pub/Sub clients
const subClient = redis.duplicate();
const pubClient = redis.duplicate();

// Interface ki ab zaroorat nahi kyunki hum 'io' ko attach kar rahe hain, na ki Fastify se nikal rahe hain.

export const setupSocketIO = (server: FastifyInstance): Server => {

    // 1. Naya Socket.IO Server Instance banao
    const io = new Server(server.server, { // <-- Fastify ka underlying Node.js HTTP server use karo
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        },
        adapter: createAdapter(pubClient, subClient),
    });

    // 2. Integration logic (baaki sab same)
    io.on('connection', (socket: Socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

        // ... (rest of the socket events)
        socket.on('join_discover_room', () => {
            socket.join('discover');
            console.log(`[Socket] Client ${socket.id} joined 'discover' room.`);
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
        });
    });

    // Redis Pub/Sub Listener
    subClient.subscribe(UPDATE_CHANNEL, (err) => {
        if (err) console.error("Redis subscription error:", err);
        console.log(`[Socket] Subscribed to Redis channel: ${UPDATE_CHANNEL}`);
    });

    subClient.on('message', (channel, message) => {
        if (channel === UPDATE_CHANNEL) {
            console.log(`[Socket] Received update from Worker: ${message}`);
            io.to('discover').emit('token_update', JSON.parse(message));
        }
    });

    return io;
};

export const socketPublisher = pubClient;