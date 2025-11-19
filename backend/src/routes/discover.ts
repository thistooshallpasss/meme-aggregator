import { FastifyInstance } from 'fastify';
import redis from '../utils/redis';
import { TokenData } from '../types';
import { fetchTokenListAndCache } from '../services/tokenDiscovery';
import { applyCursorPagination, CursorPaginationResult } from '../utils/pagination';

type SortableTokenKeys = 'volume_sol' | 'price_sol' | 'market_cap_sol' | 'liquidity_sol';

export default async function discoverRoutes(app: FastifyInstance) {
    app.get('/', async (request, reply) => {
        const { limit = 20, cursor, sort = 'volume_sol', period = '24h' } = request.query as any;

        const sortKey: SortableTokenKeys = sort as SortableTokenKeys;
        const CACHE_KEY = `discover:list:period=${period}:sort=${sortKey}:limit=${limit}`;

        const cachedList = await redis.get(CACHE_KEY);
        if (cachedList) {
            return JSON.parse(cachedList);
        }

        const keys = await redis.keys('token:merged:*');
        const tokenDataPromises = keys.map(key => redis.get(key));
        const results = await Promise.all(tokenDataPromises);

        const tokens: TokenData[] = results
            .filter(data => data)
            .map(data => JSON.parse(data!));

        const sortedTokens = tokens.sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));

        // Apply cursor-based pagination
        const paginatedResult = applyCursorPagination(sortedTokens, Number(limit), cursor);
        const response: CursorPaginationResult & { next_cursor: string | null } = {
            count: paginatedResult.count,
            next_cursor: paginatedResult.next_cursor,
            data: paginatedResult.data,
        };

        await redis.set(CACHE_KEY, JSON.stringify(response), 'EX', 60);

        return response;
    });
}
