import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
// Backend se copy kiye gaye types ko yahan import karo
import { TokenData } from '../types/index.ts';

// Initial empty data state
const initialData: TokenData[] = [];

export const useRealTimeData = () => {
    const [tokens, setTokens] = useState<TokenData[]>(initialData);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // NOTE: Ye URL wohi hona chahiye jahan tumhara Fastify server chal raha hai
        const socket = io('http://localhost:4000');

        socket.on('connect', () => {
            console.log("Socket: Connected!");
            setIsConnected(true);

            // Server ko batao ki hum discover room join kar rahe hain
            socket.emit('join_discover_room');

            fetch('http://localhost:4000/api/v1/discover?limit=20&sort=volume_sol')
                .then(res => res.json())
                .then(data => {
                    if (data.data) {
                        setTokens(data.data);
                    }
                })
                .catch(error => console.error("Initial REST Fetch Failed:", error));
        });

        socket.on('token_update', (newToken: TokenData) => {
            console.log(`Socket: Received update for ${newToken.token_ticker}`);

            setTokens(prevTokens => {
                // Check if token already exists (by token_address)
                const exists = prevTokens.find(t => t.token_address === newToken.token_address);

                if (exists) {
                    // Agar exist karta hai, toh update karo (Delta-only update logic)
                    return prevTokens.map(t =>
                        t.token_address === newToken.token_address ? { ...t, ...newToken } : t
                    );
                } else {
                    // Agar naya token hai, toh list mein add karo
                    return [...prevTokens, newToken];
                }
            });
        });

        socket.on('disconnect', () => {
            console.log("Socket: Disconnected!");
            setIsConnected(false);
        });

        // Cleanup function
        return () => {
            socket.disconnect();
        };
    }, []);

    // Hum tokens ko Volume ke hisaab se sort karenge taaki demo achha lage
    const sortedTokens = [...tokens].sort((a, b) => b.volume_sol - a.volume_sol);

    return { tokens: sortedTokens, isConnected };
};
