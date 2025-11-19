import { TokenData } from '../types';

export interface CursorPaginationResult {
    data: TokenData[];
    next_cursor: string | null;
    count: number;
}

// Cursor-based pagination function
export const applyCursorPagination = (
    sortedTokens: TokenData[],
    limit: number,
    cursor: string | undefined
): CursorPaginationResult => {

    let startIndex = 0;

    // Cursor ko base64 se decode karo (Example: tokenAddress)
    if (cursor) {
        try {
            const decodedCursor = Buffer.from(cursor, 'base64').toString('ascii');
            // Hum simply token address ko cursor man rahe hain
            const cursorIndex = sortedTokens.findIndex(t => t.token_address === decodedCursor);
            if (cursorIndex !== -1) {
                startIndex = cursorIndex + 1;
            }
        } catch (e) {
            console.error("Invalid cursor provided.");
        }
    }

    const endIndex = startIndex + limit;
    const pageData = sortedTokens.slice(startIndex, endIndex);

    let nextCursor = null;

    if (endIndex < sortedTokens.length) {
        // Next page ka pehla element ka address encode karo
        nextCursor = Buffer.from(pageData[pageData.length - 1].token_address).toString('base64');
    }

    return {
        data: pageData,
        next_cursor: nextCursor,
        count: pageData.length,
    };
};