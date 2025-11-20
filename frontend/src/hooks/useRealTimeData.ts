import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { TokenData } from '../types/index.ts';

// 🟢 NEW: Use Vercel environment variable
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// Initial empty data state
const initialData: TokenData[] = [];

export const useRealTimeData = () => {
    const [tokens, setTokens] = useState<TokenData[]>(initialData);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // 🟢 FIXED: Socket URL uses env var
        const socket = io(BACKEND_URL);

        socket.on('connect', () => {
            console.log("Socket: Connected!");
            setIsConnected(true);

            socket.emit('join_discover_room');

            // 🟢 FIXED: REST API uses env var
            fetch(`${BACKEND_URL}/api/v1/discover?limit=20&sort=volume_sol`)
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
                const exists = prevTokens.find(t => t.token_address === newToken.token_address);

                if (exists) {
                    return prevTokens.map(t =>
                        t.token_address === newToken.token_address ? { ...t, ...newToken } : t
                    );
                } else {
                    return [...prevTokens, newToken];
                }
            });
        });

        socket.on('disconnect', () => {
            console.log("Socket: Disconnected!");
            setIsConnected(false);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const sortedTokens = [...tokens].sort((a, b) => b.volume_sol - a.volume_sol);

    return { tokens: sortedTokens, isConnected };
};
